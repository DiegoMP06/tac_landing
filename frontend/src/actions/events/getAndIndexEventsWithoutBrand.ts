import { EmbeddingProviderImpl } from "@/core/chatbot/providers/EmbeddingProviderImpl";
import { EmbeddingRepositoryImpl } from "@/core/chatbot/repositories/EmbeddingRepositoryImpl";
import { EventEmbeddingService } from "@/core/chatbot/services/EventEmbeddingService";
import { EventApiService } from "@/core/events/services/EventApiService";
import { HttpAdapterImpl } from "@/core/shared/adapters/HttpAdapterImpl";
import { LoggerAdapterImpl } from "@/core/shared/adapters/LoggerAdapterImpl";
import { TranslationProviderImpl } from "@/core/translations/providers/TranslationProviderImpl";
import { TranslationRepositoryImpl } from "@/core/translations/repositories/TranslationRepositoryImpl";
import { EventTranslationService } from "@/core/translations/services/EventTranslationService";
import { BrandsEnum, SubBrands } from "@/enums";
import { LocalesEnum } from "@/enums/locale";
import type { ListEvents } from "@/types/events";
import { z } from "astro/zod";
import { defineAction } from "astro:actions";

export const getAndIndexEventsWithoutBrand = defineAction({
    accept: "json",
    input: z.object({
        locale: z.enum(LocalesEnum),
        featured: z.boolean(),
        limit: z.number(),
    }),
    handler: async (input): Promise<ListEvents> => {
        const { locale, featured, limit } = input;
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

            const limitPerBrand = Math.ceil(limit / SubBrands.length);

            const brandResults = await Promise.all(
                SubBrands.map(async (brand) => {
                    try {
                        const events = await eventApiService.getAllEvents({
                            brand,
                            limit: limitPerBrand,
                            featured,
                        });

                        const { cacheIds, events: translatedEvents } =
                            await translationService.translateArrayEvents({
                                events,
                                brand,
                                locale,
                            });

                        void embeddingService
                            .generateAndIndexArrayEvents({
                                cacheIds,
                                events: translatedEvents,
                            })
                            .catch((err) =>
                                logger.error(
                                    `Error indexando embeddings para brand ${brand}`,
                                    err,
                                ),
                            );

                        return translatedEvents;
                    } catch (err) {
                        logger.error(
                            `Error obteniendo/traduciendo eventos para brand ${brand}`,
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
