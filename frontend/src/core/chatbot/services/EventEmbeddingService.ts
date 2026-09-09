import type { LoggerAdapter } from "@/core/shared/interfaces/LoggerAdapter";
import type { EmbeddingProvider } from "../interfaces/EmbeddingProvider";
import type { EmbeddingRepository } from "../interfaces/EmbeddingRepository";
import type { Event } from "@/types/events";
import { EventTranslationSchema } from "@/schemas/events";
import { hashText } from "@/utils/hash";
import { jsonToString } from "@/utils/json";

type EventEmbeddingServiceArgs = {
    embedding: EmbeddingProvider;
    repository: EmbeddingRepository;
    logger: LoggerAdapter;
};

type GenerateAndIndexArgs = {
    event: Event;
    cacheId: string;
    events: Event[];
    cacheIds: Map<string, string>;
};

export class EventEmbeddingService {
    private readonly embedding: EmbeddingProvider;
    private readonly repository: EmbeddingRepository;
    private readonly logger: LoggerAdapter;

    constructor({ embedding, repository, logger }: EventEmbeddingServiceArgs) {
        this.embedding = embedding;
        this.repository = repository;
        this.logger = logger;
    }

    async generateAndIndexEvent({
        cacheId,
        event,
    }: Pick<GenerateAndIndexArgs, "cacheId" | "event">): Promise<void> {
        const readyForEmbedding = EventTranslationSchema.parse(event);
        const stringEntity = jsonToString(readyForEmbedding);
        const hash = hashText(stringEntity);

        const existing = await this.repository.getByCacheId({
            cacheId,
            contentHash: hash,
        });

        if (existing) {
            this.logger.debug(`Embedding already exists for ${cacheId}`);
            return;
        }

        const embedding = await this.embedding.embed(stringEntity);

        await this.repository.saveEmbedding({
            cacheId,
            embedding,
            content: stringEntity,
            contentHash: hash,
        });

        this.logger.debug(`Embedding successfully saved for ${cacheId}`);
    }

    async generateAndIndexArrayEvents({
        events,
        cacheIds,
    }: Pick<GenerateAndIndexArgs, "events" | "cacheIds">): Promise<void> {
        if (!events.length) return;

        const prepared = [];

        for (const event of events) {
            const cacheId = cacheIds.get(String(event.id));
            if (!cacheId) continue;

            try {
                const readyForEmbedding = EventTranslationSchema.parse(event);
                const stringEntity = jsonToString(readyForEmbedding);
                const hash = hashText(stringEntity);

                prepared.push({
                    cacheId,
                    content: stringEntity,
                    contentHash: hash,
                    event,
                });
            } catch (err) {
                this.logger.error(
                    `[EventEmbeddingService] Schema parse failed for event ${event.id}: ${err}`,
                );
            }
        }

        if (!prepared.length) return;

        const allExisting = await this.repository.getManyByCacheIds({
            items: prepared.map(({ cacheId, contentHash }) => ({
                cacheId,
                contentHash,
            })),
        });

        const existingByCacheId = new Map(
            allExisting.map((x) => [x.cacheId, x]),
        );

        const fresh = prepared.filter((x) => {
            const exists = existingByCacheId.get(x.cacheId);
            if (!exists) return true;
            return exists.contentHash !== x.contentHash;
        });

        if (!fresh.length) {
            this.logger.debug(
                "[EventEmbeddingService] All embeddings are up to date.",
            );
            return;
        }

        const batchItems = fresh.map((x) => ({
            id: x.cacheId,
            text: x.content,
        }));

        const embeddingsMap = await this.embedding.embedBatch(batchItems);

        const itemsToSave = fresh
            .filter((x) => embeddingsMap.has(x.cacheId))
            .map((x) => ({
                cacheId: x.cacheId,
                embedding: embeddingsMap.get(x.cacheId)!,
                content: x.content,
                contentHash: x.contentHash,
            }));

        if (itemsToSave.length > 0) {
            await this.repository.saveManyEmbeddings({
                items: itemsToSave,
            });
            this.logger.debug(
                `[EventEmbeddingService] Saved ${itemsToSave.length} new embeddings.`,
            );
        }
    }
}
