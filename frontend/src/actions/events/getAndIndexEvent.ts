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
import { EventTranslationService } from "@/core/translations/services/EventTranslationService";
import { EventEmbeddingService } from "@/core/chatbot/services/EventEmbeddingService";
import { EventApiService } from "@/core/events/services/EventApiService";

export const getAndIndexEvent = defineAction({
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

            const eventApiService = new EventApiService({
                http,
                logger,
            });

            const eventTranslationService = new EventTranslationService({
                translation: translationProvider,
                repository: translationRepository,
                logger,
            });

            const eventEmbeddingService = new EventEmbeddingService({
                embedding: embeddingProvider,
                repository: embeddingRepository,
                logger,
            });

            const event = await eventApiService.getEvent({
                slug,
                brand,
            });

            if (!event) throw new Error("Event not found");

            const { cacheId, event: translatedEvent } =
                await eventTranslationService.translateEvent({
                    event,
                    locale,
                    brand,
                });

            await eventEmbeddingService.generateAndIndexEvent({
                cacheId,
                event: translatedEvent,
            });

            return translatedEvent;
        } catch (error) {
            console.log(error);
            return null;
        }
    },
});
