import { EmbeddingProviderImpl } from "@/core/chatbot/providers/EmbeddingProviderImpl";
import { EmbeddingRepositoryImpl } from "@/core/chatbot/repositories/EmbeddingRepositoryImpl";
import { ProgramEmbeddingService } from "@/core/chatbot/services/ProgramEmbeddingService";
import { ProgramApiService } from "@/core/programs/services/ProgramApiService";
import { HttpAdapterImpl } from "@/core/shared/adapters/HttpAdapterImpl";
import { LoggerAdapterImpl } from "@/core/shared/adapters/LoggerAdapterImpl";
import { TranslationProviderImpl } from "@/core/translations/providers/TranslationProviderImpl";
import { TranslationRepositoryImpl } from "@/core/translations/repositories/TranslationRepositoryImpl";
import { ProgramTranslationService } from "@/core/translations/services/ProgramTranslationService";
import { BrandsEnum, SubBrands } from "@/enums";
import { LocalesEnum } from "@/enums/locale";
import type { ListPrograms } from "@/types/programs";
import { z } from "astro/zod";
import { defineAction } from "astro:actions";

export const getAndIndexProgramsWithoutBrand = defineAction({
    accept: "json",
    input: z.object({
        locale: z.enum(LocalesEnum),
        featured: z.boolean(),
        limit: z.number(),
    }),
    handler: async (input): Promise<ListPrograms> => {
        const { locale, featured, limit } = input;
        try {
            const http = new HttpAdapterImpl();
            const translationProvider = new TranslationProviderImpl(locale);
            const translationRepository = new TranslationRepositoryImpl();
            const embeddingProvider = new EmbeddingProviderImpl();
            const embeddingRepository = new EmbeddingRepositoryImpl();
            const logger = new LoggerAdapterImpl();

            const programApiService = new ProgramApiService({
                http,
                logger,
            });

            const translationService = new ProgramTranslationService({
                translation: translationProvider,
                repository: translationRepository,
                logger,
            });

            const embeddingService = new ProgramEmbeddingService({
                embedding: embeddingProvider,
                repository: embeddingRepository,
                logger,
            });

            const limitPerBrand = Math.ceil(limit / SubBrands.length);

            const brandResults = await Promise.all(
                SubBrands.map(async (brand) => {
                    try {
                        const programs = await programApiService.getAllPrograms(
                            {
                                brand,
                                limit: limitPerBrand,
                                featured,
                            },
                        );

                        const { cacheIds, programs: translatedPrograms } =
                            await translationService.translateArrayPrograms({
                                programs,
                                brand,
                                locale,
                            });

                        void embeddingService
                            .generateAndIndexArrayPrograms({
                                cacheIds,
                                programs: translatedPrograms,
                            })
                            .catch((err) =>
                                logger.error(
                                    `Error indexando embeddings para brand ${brand}`,
                                    err,
                                ),
                            );

                        return translatedPrograms;
                    } catch (err) {
                        logger.error(
                            `Error obteniendo/traduciendo programas para brand ${brand}`,
                            err,
                        );
                        return [];
                    }
                }),
            );

            return brandResults.flat().slice(0, limit);
        } catch (error) {
            console.error(error);
            return [];
        }
    },
});
