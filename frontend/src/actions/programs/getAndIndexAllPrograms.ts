import { EmbeddingProviderImpl } from "@/core/chatbot/providers/EmbeddingProviderImpl";
import { EmbeddingRepositoryImpl } from "@/core/chatbot/repositories/EmbeddingRepositoryImpl";
import { ProgramEmbeddingService } from "@/core/chatbot/services/ProgramEmbeddingService";
import { ProgramApiService } from "@/core/programs/services/ProgramApiService";
import { HttpAdapterImpl } from "@/core/shared/adapters/HttpAdapterImpl";
import { LoggerAdapterImpl } from "@/core/shared/adapters/LoggerAdapterImpl";
import { TranslationProviderImpl } from "@/core/translations/providers/TranslationProviderImpl";
import { TranslationRepositoryImpl } from "@/core/translations/repositories/TranslationRepositoryImpl";
import { ProgramTranslationService } from "@/core/translations/services/ProgramTranslationService";
import { BrandsEnum } from "@/enums";
import { LocalesEnum } from "@/enums/locale";
import type { ListPrograms } from "@/types/programs";
import { z } from "astro/zod";
import { defineAction } from "astro:actions";

export const getAndIndexAllPrograms = defineAction({
    accept: "json",
    input: z.object({
        locale: z.enum(LocalesEnum),
        brand: z.enum(BrandsEnum),
        featured: z.boolean().optional(),
        limit: z.number().optional(),
    }),
    handler: async (input): Promise<ListPrograms> => {
        const { locale, brand, featured, limit } = input;

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

            const programs = await programApiService.getAllPrograms({
                brand,
                featured,
                limit,
            });

            const { cacheIds, programs: translatedPrograms } =
                await translationService.translateArrayPrograms({
                    programs,
                    brand,
                    locale,
                });

            await embeddingService.generateAndIndexArrayPrograms({
                cacheIds,
                programs: translatedPrograms,
            });

            return translatedPrograms;
        } catch (error) {
            console.error(error);
            return [];
        }
    },
});
