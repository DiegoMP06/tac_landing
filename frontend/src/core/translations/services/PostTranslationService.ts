import type { LoggerAdapter } from "@/core/shared/interfaces/LoggerAdapter";
import type { Post } from "@/types/blog";
import type { Locale } from "@/types/locale";
import type { Brand } from "@/types";
import type { TranslationProvider } from "../interfaces/TranslationProvider";
import type { TranslationRepository } from "../interfaces/TranslationRepository";
import { TranslationNamespacesEnum } from "@/enums/translation";
import { TRANSLATION_PROVIDER } from "@/consts/translation";
import { PostTranslationSchema } from "@/schemas/blog";
import { sanitizeHtml } from "@/utils/html";
import { extractJSON, jsonToString, stringToJson } from "@/utils/json";
import { hashText } from "@/utils/hash";
import { applyPostTranslation } from "@/utils/translation/blog";

type PostTranslationArgs = {
    translation: TranslationProvider;
    repository: TranslationRepository;
    logger: LoggerAdapter;
};

type TranslateParams = {
    post: Post;
    blog: Post[];
    locale: Locale;
    brand: Brand;
    entityId: string;
};

export class PostTranslationService {
    private readonly translation: TranslationProvider;
    private readonly repository: TranslationRepository;
    private readonly logger: LoggerAdapter;
    private readonly provider = TRANSLATION_PROVIDER;
    private readonly namespace = TranslationNamespacesEnum.POST;

    constructor({ translation, repository, logger }: PostTranslationArgs) {
        this.translation = translation;
        this.repository = repository;
        this.logger = logger;
    }

    async translatePost({
        post,
        locale,
        brand,
    }: Pick<TranslateParams, "post" | "locale" | "brand">): Promise<{
        post: Post;
        cacheId: string;
    }> {
        const entityId = post.id;
        const readyForTranslation = PostTranslationSchema.parse(post);
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
            const parsed = PostTranslationSchema.parse(existing.translatedText);
            return {
                post: applyPostTranslation(post, parsed),
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
            return { post, cacheId: saved.id };
        }

        const translatedRaw = await this.translation.translate(stringEntity);
        const parsedJson = stringToJson(extractJSON(translatedRaw));
        const parsed = PostTranslationSchema.parse(parsedJson);

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
            post: applyPostTranslation(post, parsed),
            cacheId: saved.id,
        };
    }

    async translateArrayPosts({
        blog,
        locale,
        brand,
    }: Pick<TranslateParams, "blog" | "locale" | "brand">): Promise<{
        blog: Post[];
        cacheIds: Map<string, string>;
    }> {
        const cacheIds = new Map<string, string>();

        const prepared = blog.map((post) => {
            const entityId = post.id;
            const readyForTranslation = PostTranslationSchema.parse(post);
            readyForTranslation.content.rendered = sanitizeHtml(
                readyForTranslation.content.rendered,
            );
            const stringEntity = jsonToString(readyForTranslation);
            const hash = hashText(stringEntity);
            const key = String(entityId);

            return { post, key, hash, readyForTranslation, stringEntity };
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

        const pending = prepared.filter((post) => {
            const cached = existingByKey.get(post.key);
            if (!cached) return true;
            if (cached.isStale(post.hash)) return true;
            fresh.set(post.key, cached.translatedText);
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
                        items: pending.map((post) => ({
                            key: post.key,
                            originalText: post.readyForTranslation,
                            translatedText: post.readyForTranslation,
                            hash: post.hash,
                        })),
                    });

                savedDefaults.forEach((x) => cacheIds.set(x.key, x.id));
            }

            return {
                blog,
                cacheIds,
            };
        }

        let newTranslations = new Map<string, string>();

        if (pending.length > 0) {
            try {
                newTranslations = await this.translation.translateMany(
                    pending.map((post) => ({
                        key: post.key,
                        text: post.stringEntity,
                    })),
                );
            } catch (err) {
                this.logger.error(
                    `[PostTranslationService] translateMany failed, returning originals for pending items: ${err}`,
                );
            }

            const itemsToSave = [];
            for (const post of pending) {
                const rawTranslation = newTranslations.get(post.key);
                if (!rawTranslation) continue;

                try {
                    const parsed = PostTranslationSchema.parse(
                        stringToJson(extractJSON(rawTranslation)),
                    );
                    itemsToSave.push({
                        key: post.key,
                        originalText: post.readyForTranslation,
                        translatedText: parsed,
                        hash: post.hash,
                    });
                } catch (err) {
                    this.logger.error(
                        `[PostTranslationService] Invalid translation structure for post ${post.key}: ${err}`,
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

        const allPosts = prepared.map(({ post, key }) => {
            const cachedOrNew = fresh.get(key) ?? newTranslations.get(key);

            if (!cachedOrNew) {
                return post;
            }

            try {
                const parsedTranslation =
                    typeof cachedOrNew === "string"
                        ? stringToJson(extractJSON(cachedOrNew))
                        : cachedOrNew;

                const validatedTranslation =
                    PostTranslationSchema.parse(parsedTranslation);
                return applyPostTranslation(post, validatedTranslation);
            } catch (err) {
                this.logger.error(
                    `[PostTranslationService] Validation failed for post ${key}, returning original: ${err}`,
                );
                return post;
            }
        });

        return {
            blog: allPosts,
            cacheIds,
        };
    }
}
