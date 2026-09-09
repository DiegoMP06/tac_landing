import { EmbeddingProviderImpl } from "@/core/chatbot/providers/EmbeddingProviderImpl";
import { EmbeddingRepositoryImpl } from "@/core/chatbot/repositories/EmbeddingRepositoryImpl";
import { PageEmbeddingService } from "@/core/chatbot/services/PageEmbeddingService";
import { PageApiService } from "@/core/pages/services/PageApiService";
import { HttpAdapterImpl } from "@/core/shared/adapters/HttpAdapterImpl";
import { LoggerAdapterImpl } from "@/core/shared/adapters/LoggerAdapterImpl";
import { TranslationProviderImpl } from "@/core/translations/providers/TranslationProviderImpl";
import { TranslationRepositoryImpl } from "@/core/translations/repositories/TranslationRepositoryImpl";
import { PageTranslationService } from "@/core/translations/services/PageTranslationService";
import { BrandsEnum } from "@/enums";
import { LocalesEnum } from "@/enums/locale";
import { PageTypeEnum } from "@/enums/pages";
import { z } from "astro/zod";
import { defineAction } from "astro:actions";

export const getAndIndexPage = defineAction({
    accept: "json",
    input: z.object({
        entityId: z.string(),
        locale: z.enum(LocalesEnum),
        brand: z.enum(BrandsEnum),
        type: z.enum(PageTypeEnum),
    }),
    handler: async (input) => {
        const { locale, brand, entityId, type } = input;

        try {
            const http = new HttpAdapterImpl();
            const logger = new LoggerAdapterImpl();
            const translationProvider = new TranslationProviderImpl(locale);
            const translationRepository = new TranslationRepositoryImpl();
            const embeddingProvider = new EmbeddingProviderImpl();
            const embeddingRepository = new EmbeddingRepositoryImpl();

            const pageApiService = new PageApiService({
                http,
                logger,
            });

            const translationService = new PageTranslationService({
                translation: translationProvider,
                repository: translationRepository,
                logger,
            });

            const embeddingService = new PageEmbeddingService({
                embedding: embeddingProvider,
                repository: embeddingRepository,
                logger,
            });

            const page = await pageApiService.getPage(entityId, brand, type);

            if (!page) throw new Error("Page not found");

            const { cacheId, page: translatedPage } =
                await translationService.translatePage({
                    page,
                    locale,
                    brand,
                    type,
                });

            await embeddingService.generateAndIndexPage({
                cacheId,
                page: translatedPage,
                type,
            });

            return translatedPage;
        } catch (e) {
            console.log(e)
            return null;
        }
    },
});
