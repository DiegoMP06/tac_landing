import { PostApiService } from "@/core/blog/services/PostApiService";
import { EmbeddingProviderImpl } from "@/core/chatbot/providers/EmbeddingProviderImpl";
import { EmbeddingRepositoryImpl } from "@/core/chatbot/repositories/EmbeddingRepositoryImpl";
import { PostEmbeddingService } from "@/core/chatbot/services/PostEmbeddingService";
import { HttpAdapterImpl } from "@/core/shared/adapters/HttpAdapterImpl";
import { LoggerAdapterImpl } from "@/core/shared/adapters/LoggerAdapterImpl";
import { TranslationProviderImpl } from "@/core/translations/providers/TranslationProviderImpl";
import { TranslationRepositoryImpl } from "@/core/translations/repositories/TranslationRepositoryImpl";
import { PostTranslationService } from "@/core/translations/services/PostTranslationService";
import { BrandsEnum } from "@/enums";
import { LocalesEnum } from "@/enums/locale";
import type { ListPosts } from "@/types/blog";
import { z } from "astro/zod";
import { defineAction } from "astro:actions";

export const getAndIndexAllPosts = defineAction({
    accept: "json",
    input: z.object({
        locale: z.enum(LocalesEnum),
    }),
    handler: async (input): Promise<ListPosts> => {
        const { locale } = input;
        const brand = BrandsEnum.DEFAULT;

        try {
            const http = new HttpAdapterImpl();
            const translationProvider = new TranslationProviderImpl(locale);
            const translationRepository = new TranslationRepositoryImpl();
            const embeddingProvider = new EmbeddingProviderImpl();
            const embeddingRepository = new EmbeddingRepositoryImpl();
            const logger = new LoggerAdapterImpl();

            const eventApiService = new PostApiService({
                http,
                logger,
            });

            const translationService = new PostTranslationService({
                translation: translationProvider,
                repository: translationRepository,
                logger,
            });

            const embeddingService = new PostEmbeddingService({
                embedding: embeddingProvider,
                repository: embeddingRepository,
                logger,
            });

            const blog = await eventApiService.getAllPosts({
                brand,
            });

            const { cacheIds, blog: translatedPosts } =
                await translationService.translateArrayPosts({
                    blog,
                    brand,
                    locale,
                });

            await embeddingService.generateAndIndexArrayPosts({
                cacheIds,
                blog: translatedPosts,
            });

            return translatedPosts;
        } catch (error) {
            console.error(error);
            return [];
        }
    },
});
