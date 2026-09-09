import type { Locale } from "@/types/locale";
import type { DraftEmbedding, Embedding } from "../entities/Embedding";

export type SaveEmbeddingArgs = Pick<
    DraftEmbedding,
    "content" | "embedding" | "cacheId" | "contentHash"
>;

export type GetByCacheIdArgs = Pick<DraftEmbedding, "cacheId" | "contentHash">;

export type GetManyByCacheIdsArgs = {
    items: Pick<DraftEmbedding, "cacheId" | "contentHash">[];
};

export type SaveManyEmbeddingsArgs = {
    items: Pick<
        DraftEmbedding,
        "content" | "embedding" | "cacheId" | "contentHash"
    >[];
};

export abstract class EmbeddingRepository {
    abstract saveEmbedding(args: SaveEmbeddingArgs): Promise<Embedding | null>;

    abstract getByCacheId(args: GetByCacheIdArgs): Promise<Embedding | null>;

    abstract getManyByCacheIds(
        args: GetManyByCacheIdsArgs,
    ): Promise<Embedding[]>;

    abstract saveManyEmbeddings(
        args: SaveManyEmbeddingsArgs,
    ): Promise<Embedding[]>;

    abstract getByLocale(locale: Locale): Promise<Embedding[]>;
}
