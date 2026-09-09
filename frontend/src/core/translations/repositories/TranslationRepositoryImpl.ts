import { db } from "@/db";
import { translationCache } from "@/db/schema";
import type { Brand } from "@/types";
import type { Locale } from "@/types/locale";
import { stringToJson } from "@/utils/json";
import { and, eq, inArray, sql } from "drizzle-orm";
import { Translation } from "../entities/Translation";
import {
    TranslationRepository,
    type GetAllTranslationsArgs,
    type GetExactTranslationArgs,
    type SaveManyTranslationsArgs,
    type SaveTranslationArgs,
} from "../interfaces/TranslationRepository";

function toTranslation({
    id,
    brand,
    namespace,
    key,
    locale,
    originalText,
    translatedText,
    provider,
    hash,
}: typeof translationCache.$inferSelect): Translation {
    return Translation.create({
        id,
        brand,
        namespace,
        key,
        locale,
        originalText: stringToJson(originalText),
        translatedText: stringToJson(translatedText),
        provider,
        hash,
    });
}

export class TranslationRepositoryImpl extends TranslationRepository {
    override async getTranslation({
        key,
        locale,
        namespace,
        brand,
    }: GetExactTranslationArgs): Promise<Translation | null> {
        const [result] = await db
            .select()
            .from(translationCache)
            .where(
                and(
                    eq(translationCache.brand, brand as Brand),
                    eq(translationCache.namespace, namespace),
                    eq(translationCache.key, key),
                    eq(translationCache.locale, locale as Locale),
                ),
            )
            .limit(1);

        if (!result) return null;

        return toTranslation(result);
    }

    override async saveTranslation(
        data: SaveTranslationArgs,
    ): Promise<Translation> {
        const [translationSaved] = await db
            .insert(translationCache)
            .values({
                brand: data.brand as Brand,
                namespace: data.namespace,
                key: data.key,
                locale: data.locale as Locale,
                originalText: data.originalText,
                translatedText: data.translatedText,
                provider: data.provider,
                hash: data.hash,
            })
            .onConflictDoUpdate({
                target: [
                    translationCache.brand,
                    translationCache.namespace,
                    translationCache.key,
                    translationCache.locale,
                ],
                set: {
                    originalText: data.originalText,
                    translatedText: data.translatedText,
                    hash: data.hash,
                    provider: data.provider,
                },
            })
            .returning();

        return toTranslation(translationSaved);
    }

    override async getAllTranslations({
        items,
        namespace,
        locale,
        brand,
    }: GetAllTranslationsArgs): Promise<Translation[]> {
        if (!items.length) return [];

        const keys = items.map((item) => item.key);

        const translations = await db
            .select()
            .from(translationCache)
            .where(
                and(
                    eq(translationCache.brand, brand as Brand),
                    eq(translationCache.namespace, namespace),
                    eq(translationCache.locale, locale as Locale),
                    inArray(translationCache.key, keys),
                ),
            );

        return translations.map(toTranslation);
    }

    async saveManyTranslations({
        items,
        namespace,
        locale,
        brand,
        provider,
    }: SaveManyTranslationsArgs): Promise<Translation[]> {
        if (!items.length) return [];

        const valuesToInsert = items.map((item) => ({
            id: crypto.randomUUID(),
            brand: brand as Brand,
            namespace,
            locale: locale as Locale,
            provider,
            key: item.key,
            originalText: item.originalText,
            translatedText: item.translatedText,
            hash: item.hash,
        }));

        await db
            .insert(translationCache)
            .values(valuesToInsert)
            .onConflictDoUpdate({
                target: [
                    translationCache.brand,
                    translationCache.namespace,
                    translationCache.key,
                    translationCache.locale,
                ],
                set: {
                    originalText: sql`excluded.original_text`,
                    translatedText: sql`excluded.translated_text`,
                    hash: sql`excluded.hash`,
                    provider: sql`excluded.provider`,
                },
            });

        const keys = items.map((item) => item.key);

        const saved = await db
            .select()
            .from(translationCache)
            .where(
                and(
                    eq(translationCache.brand, brand as Brand),
                    eq(translationCache.namespace, namespace),
                    eq(translationCache.locale, locale as Locale),
                    inArray(translationCache.key, keys),
                ),
            );

        return saved.map(toTranslation);
    }
}
