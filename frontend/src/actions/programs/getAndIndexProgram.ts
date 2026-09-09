import { defineAction } from "astro:actions";
import { HttpAdapterImpl } from "@/core/shared/adapters/HttpAdapterImpl";
import { LoggerAdapterImpl } from "@/core/shared/adapters/LoggerAdapterImpl";
import { EmbeddingProviderImpl } from "@/core/chatbot/providers/EmbeddingProviderImpl";
import { EmbeddingRepositoryImpl } from "@/core/chatbot/repositories/EmbeddingRepositoryImpl";
import { TranslationProviderImpl } from "@/core/translations/providers/TranslationProviderImpl";
import { TranslationRepositoryImpl } from "@/core/translations/repositories/TranslationRepositoryImpl";
import { BrandsEnum } from "@/enums";
import { LocalesEnum } from "@/enums/locale";
import { z } from "astro/zod";
import { ProgramTranslationService } from "@/core/translations/services/ProgramTranslationService";
import { ProgramEmbeddingService } from "@/core/chatbot/services/ProgramEmbeddingService";
import { ProgramApiService } from "@/core/programs/services/ProgramApiService";

export const getAndIndexProgram = defineAction({
    accept: "json",
    input: z.object({
        slug: z.string(),
        locale: z.enum(LocalesEnum),
        brand: z.enum(BrandsEnum),
    }),
    handler: async (input) => {
        const { slug, locale, brand } = input;

        try {
            const http = new HttpAdapterImpl();
            const logger = new LoggerAdapterImpl();
            const translationProvider = new TranslationProviderImpl(locale);
            const translationRepository = new TranslationRepositoryImpl();
            const embeddingProvider = new EmbeddingProviderImpl();
            const embeddingRepository = new EmbeddingRepositoryImpl();

            const programApiService = new ProgramApiService({
                http,
                logger,
            });

            const programTranslationService = new ProgramTranslationService({
                translation: translationProvider,
                repository: translationRepository,
                logger,
            });

            const programEmbeddingService = new ProgramEmbeddingService({
                embedding: embeddingProvider,
                repository: embeddingRepository,
                logger,
            });

            const program = await programApiService.getProgram({
                slug,
                brand,
            });

            if (!program) throw new Error("Program not found");

            const { cacheId, program: translatedProgram } =
                await programTranslationService.translateProgram({
                    program,
                    locale,
                    brand,
                });

            await programEmbeddingService.generateAndIndexProgram({
                cacheId,
                program: translatedProgram,
            });

            return translatedProgram;
        } catch (error) {
            console.log(error);
            return null;
        }
    },
});
