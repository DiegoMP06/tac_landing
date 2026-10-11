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
import { PostTranslationService } from "@/core/translations/services/PostTranslationService";
import { PostEmbeddingService } from "@/core/chatbot/services/PostEmbeddingService";
import { PostApiService } from "@/core/blog/services/PostApiService";

export const getAndIndexPost = defineAction({
    accept: "json",
    input: z.object({
        slug: z.string(),
        locale: z.enum(LocalesEnum),
    }),
    handler: async (input) => {
        const { slug, locale } = input;
        const brand = BrandsEnum.DEFAULT;

        try {
            const http = new HttpAdapterImpl();
            const logger = new LoggerAdapterImpl();
            const translationProvider = new TranslationProviderImpl(locale);
            const translationRepository = new TranslationRepositoryImpl();
            const embeddingProvider = new EmbeddingProviderImpl();
            const embeddingRepository = new EmbeddingRepositoryImpl();

            const postApiService = new PostApiService({
                http,
                logger,
            });

            const postTranslationService = new PostTranslationService({
                translation: translationProvider,
                repository: translationRepository,
                logger,
            });

            const postEmbeddingService = new PostEmbeddingService({
                embedding: embeddingProvider,
                repository: embeddingRepository,
                logger,
            });

            const post = await postApiService.getPost({
                slug,
                brand,
            });

            if (!post) throw new Error("Post not found");

            const { cacheId, post: translatedPost } =
                await postTranslationService.translatePost({
                    post,
                    locale,
                    brand,
                });

            await postEmbeddingService.generateAndIndexPost({
                cacheId,
                post: translatedPost,
            });

            return translatedPost;
        } catch (error) {
            console.log(error);
            return null;
        }
    },
});
