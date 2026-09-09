import type { LoggerAdapter } from "@/core/shared/interfaces/LoggerAdapter";
import type { Event } from "@/types/events";
import type { Locale } from "@/types/locale";
import type { Brand } from "@/types";
import type { TranslationProvider } from "../interfaces/TranslationProvider";
import type { TranslationRepository } from "../interfaces/TranslationRepository";
import { TranslationNamespacesEnum } from "@/enums/translation";
import { TRANSLATION_PROVIDER } from "@/consts/translation";
import { EventTranslationSchema } from "@/schemas/events";
import { sanitizeHtml } from "@/utils/html";
import { extractJSON, jsonToString, stringToJson } from "@/utils/json";
import { hashText } from "@/utils/hash";
import { applyEventTranslation } from "@/utils/translation/event";

type EventTranslationArgs = {
    translation: TranslationProvider;
    repository: TranslationRepository;
    logger: LoggerAdapter;
};

type TranslateParams = {
    event: Event;
    events: Event[];
    locale: Locale;
    brand: Brand;
    entityId: string;
};

export class EventTranslationService {
    private readonly translation: TranslationProvider;
    private readonly repository: TranslationRepository;
    private readonly logger: LoggerAdapter;
    private readonly provider = TRANSLATION_PROVIDER;
    private readonly namespace = TranslationNamespacesEnum.EVENT;

    constructor({ translation, repository, logger }: EventTranslationArgs) {
        this.translation = translation;
        this.repository = repository;
        this.logger = logger;
    }

    async translateEvent({
        event,
        locale,
        brand,
    }: Pick<TranslateParams, "event" | "locale" | "brand">): Promise<{
        event: Event;
        cacheId: string;
    }> {
        const entityId = event.id;
        const readyForTranslation = EventTranslationSchema.parse(event);
        readyForTranslation.content.rendered = sanitizeHtml(
            readyForTranslation.content.rendered,
        );
        const stringEntity = jsonToString(readyForTranslation);
        const hash = hashText(stringEntity);
        const key = String(entityId);

        const existing = await this.repository.getTranslation({
            key,
            locale,
            namespace: this.namespace,
            brand,
        });

        if (existing && !existing.isStale(hash)) {
            this.logger.debug(`Using DB translation ${key}`);
            const parsed = EventTranslationSchema.parse(
                existing.translatedText,
            );
            return {
                event: applyEventTranslation(event, parsed),
                cacheId: existing.id,
            };
        }

        if (this.translation.isDefaultLocale()) {
            const saved = await this.repository.saveTranslation({
                hash,
                key,
                locale,
                namespace: this.namespace,
                brand,
                originalText: readyForTranslation,
                translatedText: readyForTranslation,
                provider: this.provider,
            });

            this.logger.debug(`Without translation ${entityId}`);
            return { event, cacheId: saved.id };
        }

        const translatedRaw = await this.translation.translate(stringEntity);
        const parsedJson = stringToJson(extractJSON(translatedRaw));
        const parsed = EventTranslationSchema.parse(parsedJson);

        const saved = await this.repository.saveTranslation({
            hash,
            key,
            locale,
            namespace: this.namespace,
            brand,
            originalText: readyForTranslation,
            translatedText: parsed,
            provider: this.provider,
        });

        this.logger.debug(`Using IA translation ${key}`);
        return {
            event: applyEventTranslation(event, parsed),
            cacheId: saved.id,
        };
    }

    async translateArrayEvents({
        events,
        locale,
        brand,
    }: Pick<TranslateParams, "events" | "locale" | "brand">): Promise<{
        events: Event[];
        cacheIds: Map<string, string>;
    }> {
        const cacheIds = new Map<string, string>();

        const prepared = events.map((event) => {
            const entityId = event.id;
            const readyForTranslation = EventTranslationSchema.parse(event);
            readyForTranslation.content.rendered = sanitizeHtml(
                readyForTranslation.content.rendered,
            );
            const stringEntity = jsonToString(readyForTranslation);
            const hash = hashText(stringEntity);
            const key = String(entityId);

            return { event, key, hash, readyForTranslation, stringEntity };
        });

        const allExisting = await this.repository.getAllTranslations({
            namespace: this.namespace,
            locale,
            brand,
            items: prepared.map(({ key }) => ({ key })),
        });

        allExisting.forEach((x) => cacheIds.set(x.key, x.id));

        const existingByKey = new Map(
            allExisting.map((translation) => [translation.key, translation]),
        );
        const fresh = new Map<string, unknown>();

        const pending = prepared.filter((event) => {
            const cached = existingByKey.get(event.key);
            if (!cached) return true;
            if (cached.isStale(event.hash)) return true;
            fresh.set(event.key, cached.translatedText);
            return false;
        });

        if (this.translation.isDefaultLocale()) {
            if (pending.length > 0) {
                const savedDefaults =
                    await this.repository.saveManyTranslations({
                        namespace: this.namespace,
                        locale,
                        brand,
                        provider: this.provider,
                        items: pending.map((event) => ({
                            key: event.key,
                            originalText: event.readyForTranslation,
                            translatedText: event.readyForTranslation,
                            hash: event.hash,
                        })),
                    });

                savedDefaults.forEach((x) => cacheIds.set(x.key, x.id));
            }

            return {
                events,
                cacheIds,
            };
        }

        let newTranslations = new Map<string, string>();

        if (pending.length > 0) {
            try {
                newTranslations = await this.translation.translateMany(
                    pending.map((event) => ({
                        key: event.key,
                        text: event.stringEntity,
                    })),
                );
            } catch (err) {
                this.logger.error(
                    `[EventTranslationService] translateMany failed, returning originals for pending items: ${err}`,
                );
            }

            const itemsToSave = [];
            for (const event of pending) {
                const rawTranslation = newTranslations.get(event.key);
                if (!rawTranslation) continue;

                try {
                    const parsed = EventTranslationSchema.parse(
                        stringToJson(extractJSON(rawTranslation)),
                    );
                    itemsToSave.push({
                        key: event.key,
                        originalText: event.readyForTranslation,
                        translatedText: parsed,
                        hash: event.hash,
                    });
                } catch (err) {
                    this.logger.error(
                        `[EventTranslationService] Invalid translation structure for event ${event.key}: ${err}`,
                    );
                }
            }

            if (itemsToSave.length > 0) {
                const allSaved = await this.repository.saveManyTranslations({
                    namespace: this.namespace,
                    locale,
                    brand,
                    provider: this.provider,
                    items: itemsToSave,
                });

                allSaved.forEach((x) => cacheIds.set(x.key, x.id));
            }
        }

        const allEvents = prepared.map(({ event, key }) => {
            const cachedOrNew = fresh.get(key) ?? newTranslations.get(key);

            if (!cachedOrNew) {
                return event;
            }

            try {
                const parsedTranslation =
                    typeof cachedOrNew === "string"
                        ? stringToJson(extractJSON(cachedOrNew))
                        : cachedOrNew;

                const validatedTranslation =
                    EventTranslationSchema.parse(parsedTranslation);
                return applyEventTranslation(event, validatedTranslation);
            } catch (err) {
                this.logger.error(
                    `[EventTranslationService] Validation failed for event ${key}, returning original: ${err}`,
                );
                return event;
            }
        });

        return {
            events: allEvents,
            cacheIds,
        };
    }
}
