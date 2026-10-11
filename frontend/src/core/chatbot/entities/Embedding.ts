export type EmbeddingArgs = {
    id: string;
    content: string;
    embedding: number[];
    contentHash: string;
    dimensions: number;
    cacheId: string;
    createdAt?: Date;
    updatedAt?: Date;
};

export type DraftEmbedding = Pick<
    EmbeddingArgs,
    "content" | "embedding" | "contentHash" | "dimensions" | "cacheId"
>;

export class Embedding {
    id: string;
    content: string;
    embedding: number[];
    contentHash: string;
    dimensions: number;
    cacheId: string;
    createdAt?: Date;
    updatedAt?: Date;

    public static create(args: EmbeddingArgs): Embedding {
        return new Embedding(args);
    }

    constructor({
        id,
        content,
        embedding,
        contentHash,
        dimensions,
        cacheId,
        createdAt,
        updatedAt,
    }: EmbeddingArgs) {
        this.id = id;
        this.content = content;
        this.embedding = embedding;
        this.contentHash = contentHash;
        this.dimensions = dimensions;
        this.cacheId = cacheId;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public isStale(currentHash: string): boolean {
        return this.contentHash !== currentHash;
    }
}
