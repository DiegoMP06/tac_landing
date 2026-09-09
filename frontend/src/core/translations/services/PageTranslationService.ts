import { TRANSLATION_PROVIDER } from "@/consts/translation";
import type { LoggerAdapter } from "@/core/shared/interfaces/LoggerAdapter";
import { PageTypeEnum } from "@/enums/pages";
import { TranslationNamespacesEnum } from "@/enums/translation";
import type { Brand } from "@/types";
import type { Locale } from "@/types/locale";
import type { PageType, PageTypeMap } from "@/types/pages";
import { hashText } from "@/utils/hash";
import { sanitizeHtml } from "@/utils/html";
import { extractJSON, jsonToString, stringToJson } from "@/utils/json";
import { PageDict } from "@/utils/translation/page";
import type { TranslationProvider } from "../interfaces/TranslationProvider";
import type { TranslationRepository } from "../interfaces/TranslationRepository";

type PageTranslationArgs = {
    translation: TranslationProvider;
    repository: TranslationRepository;
    logger: LoggerAdapter;
};

type TranslateParams<T extends PageType> = {
    page: PageTypeMap[T];
    locale: Locale;
    brand: Brand;
    type: T;
};

export class PageTranslationService {
    private readonly translation: TranslationProvider;
    private readonly repository: TranslationRepository;
    private readonly logger: LoggerAdapter;
    private readonly provider = TRANSLATION_PROVIDER;
    private readonly namespace = TranslationNamespacesEnum.PAGE;

    constructor({ translation, repository, logger }: PageTranslationArgs) {
        this.translation = translation;
        this.repository = repository;
        this.logger = logger;
    }

    async translatePage<T extends PageType = typeof PageTypeEnum.DEFAULT>({
        page,
        locale,
        brand,
        type = PageTypeEnum.DEFAULT as T,
    }: TranslateParams<T>): Promise<{
        page: PageTypeMap[T];
        cacheId: string;
    }> {
        const entityId = page.id;
        const { translationSchema, applyTranslation } = PageDict[type];
        const readyForTranslation = translationSchema.parse(page);
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
            const parsed = translationSchema.parse(existing.translatedText);
            return {
                page: applyTranslation(page, parsed),
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
            return { page, cacheId: saved.id };
        }

        const translatedRaw = await this.translation.translate(stringEntity);
        const parsedJson = stringToJson(extractJSON(translatedRaw));
        const parsed = translationSchema.parse(parsedJson);

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
            page: applyTranslation(page, parsed),
            cacheId: saved.id,
        };
    }
}
