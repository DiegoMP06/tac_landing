import { db } from "@/db";
import { embeddings, translationCache } from "@/db/schema";
import { and, eq, or, sql } from "drizzle-orm";
import { Embedding } from "../entities/Embedding";
import {
    EmbeddingRepository,
    type GetByCacheIdArgs,
    type GetManyByCacheIdsArgs,
    type SaveEmbeddingArgs,
    type SaveManyEmbeddingsArgs,
} from "../interfaces/EmbeddingRepository";
import type { Locale } from "@/types/locale";

function toEmbedding({
    id,
    content,
    embedding,
    contentHash,
    dimensions,
    cacheId,
}: typeof embeddings.$inferSelect): Embedding {
    return Embedding.create({
        id,
        content,
        embedding,
        contentHash,
        dimensions,
        cacheId,
    });
}

export class EmbeddingRepositoryImpl extends EmbeddingRepository {
    override async saveEmbedding(data: SaveEmbeddingArgs): Promise<Embedding> {
        const [embeddingSaved] = await db
            .insert(embeddings)
            .values({
                content: data.content,
                embedding: data.embedding,
                dimensions: data.embedding.length,
                contentHash: data.contentHash,
                cacheId: data.cacheId,
            })
            .onConflictDoUpdate({
                target: embeddings.cacheId,
                set: {
                    content: data.content,
                    embedding: data.embedding,
                    dimensions: data.embedding.length,
                    contentHash: data.contentHash,
                },
            })
            .returning();

        return toEmbedding(embeddingSaved);
    }

    override async getByCacheId({
        cacheId,
        contentHash,
    }: GetByCacheIdArgs): Promise<Embedding | null> {
        const [result] = await db
            .select()
            .from(embeddings)
            .where(
                and(
                    eq(embeddings.cacheId, cacheId),
                    eq(embeddings.contentHash, contentHash),
                ),
            )
            .limit(1);

        if (!result) return null;

        return toEmbedding(result);
    }

    override async getManyByCacheIds({
        items,
    }: GetManyByCacheIdsArgs): Promise<Embedding[]> {
        if (!items.length) return [];

        const conditions = items.map((item) =>
            and(
                eq(embeddings.cacheId, item.cacheId),
                eq(embeddings.contentHash, item.contentHash),
            ),
        );

        const result = await db
            .select()
            .from(embeddings)
            .where(or(...conditions));

        return result.map(toEmbedding);
    }

    override async saveManyEmbeddings({
        items,
    }: SaveManyEmbeddingsArgs): Promise<Embedding[]> {
        if (!items.length) return [];

        const valuesToInsert = items.map((item) => ({
            content: item.content,
            embedding: item.embedding,
            dimensions: item.embedding.length,
            contentHash: item.contentHash,
            cacheId: item.cacheId,
        }));

        const saved = await db
            .insert(embeddings)
            .values(valuesToInsert)
            .onConflictDoUpdate({
                target: embeddings.cacheId,
                set: {
                    content: sql`excluded.content`,
                    embedding: sql`excluded.embedding`,
                    dimensions: sql`excluded.dimensions`,
                    contentHash: sql`excluded.content_hash`,
                },
            })
            .returning();

        return saved.map(toEmbedding);
    }

    override async getByLocale(locale: Locale): Promise<Embedding[]> {
        const result = await db.query.translationCache.findMany({
            where: eq(translationCache.locale, locale),
            columns: {
                id: true,
            },
            with: {
                embedding: true,
            },
        });

        return result.map((row) => toEmbedding(row.embedding));
    }
}
