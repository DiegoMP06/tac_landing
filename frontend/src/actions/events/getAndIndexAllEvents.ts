import { EmbeddingProviderImpl } from "@/core/chatbot/providers/EmbeddingProviderImpl";
import { EmbeddingRepositoryImpl } from "@/core/chatbot/repositories/EmbeddingRepositoryImpl";
import { EventEmbeddingService } from "@/core/chatbot/services/EventEmbeddingService";
import { EventApiService } from "@/core/events/services/EventApiService";
import { HttpAdapterImpl } from "@/core/shared/adapters/HttpAdapterImpl";
import { LoggerAdapterImpl } from "@/core/shared/adapters/LoggerAdapterImpl";
import { TranslationProviderImpl } from "@/core/translations/providers/TranslationProviderImpl";
import { TranslationRepositoryImpl } from "@/core/translations/repositories/TranslationRepositoryImpl";
import { EventTranslationService } from "@/core/translations/services/EventTranslationService";
import { BrandsEnum } from "@/enums";
import { LocalesEnum } from "@/enums/locale";
import type { ListEvents } from "@/types/events";
import { z } from "astro/zod";
import { defineAction } from "astro:actions";

export const getAndIndexAllEvents = defineAction({
    accept: "json",
    input: z.object({
        locale: z.enum(LocalesEnum),
        brand: z.enum(BrandsEnum),
        featured: z.boolean().optional(),
        limit: z.number().optional(),
    }),
    handler: async (input): Promise<ListEvents> => {
        const { locale, brand, featured, limit } = input;
        try {
            const http = new HttpAdapterImpl();
            const translationProvider = new TranslationProviderImpl(locale);
            const translationRepository = new TranslationRepositoryImpl();
            const embeddingProvider = new EmbeddingProviderImpl();
            const embeddingRepository = new EmbeddingRepositoryImpl();
            const logger = new LoggerAdapterImpl();

            const eventApiService = new EventApiService({
                http,
                logger,
            });

            const translationService = new EventTranslationService({
                translation: translationProvider,
                repository: translationRepository,
                logger,
            });

            const embeddingService = new EventEmbeddingService({
                embedding: embeddingProvider,
                repository: embeddingRepository,
                logger,
            });

            const events = await eventApiService.getAllEvents({
                brand,
                limit,
                featured,
            });

            const { cacheIds, events: translatedEvents } =
                await translationService.translateArrayEvents({
                    events,
                    brand,
                    locale,
                });

            await embeddingService.generateAndIndexArrayEvents({
                cacheIds,
                events: translatedEvents,
            });

            return translatedEvents;
        } catch (error) {
            console.error(error);
            return [];
        }
    },
});
