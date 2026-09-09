import type { LoggerAdapter } from "@/core/shared/interfaces/LoggerAdapter";
import type { EmbeddingProvider } from "../interfaces/EmbeddingProvider";
import type { EmbeddingRepository } from "../interfaces/EmbeddingRepository";
import type { Program } from "@/types/programs";
import { ProgramTranslationSchema } from "@/schemas/programs";
import { hashText } from "@/utils/hash";
import { jsonToString } from "@/utils/json";

type ProgramEmbeddingServiceArgs = {
    embedding: EmbeddingProvider;
    repository: EmbeddingRepository;
    logger: LoggerAdapter;
};

type GenerateAndIndexArgs = {
    program: Program;
    cacheId: string;
    programs: Program[];
    cacheIds: Map<string, string>;
};

export class ProgramEmbeddingService {
    private readonly embedding: EmbeddingProvider;
    private readonly repository: EmbeddingRepository;
    private readonly logger: LoggerAdapter;

    constructor({
        embedding,
        repository,
        logger,
    }: ProgramEmbeddingServiceArgs) {
        this.embedding = embedding;
        this.repository = repository;
        this.logger = logger;
    }

    async generateAndIndexProgram({
        cacheId,
        program,
    }: Pick<GenerateAndIndexArgs, "cacheId" | "program">): Promise<void> {
        const readyForEmbedding = ProgramTranslationSchema.parse(program);
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

    async generateAndIndexArrayPrograms({
        programs,
        cacheIds,
    }: Pick<GenerateAndIndexArgs, "programs" | "cacheIds">): Promise<void> {
        if (!programs.length) return;

        const prepared = [];

        for (const program of programs) {
            const cacheId = cacheIds.get(String(program.id));
            if (!cacheId) continue;

            try {
                const readyForEmbedding =
                    ProgramTranslationSchema.parse(program);
                const stringEntity = jsonToString(readyForEmbedding);
                const hash = hashText(stringEntity);

                prepared.push({
                    cacheId,
                    content: stringEntity,
                    contentHash: hash,
                    program,
                });
            } catch (err) {
                this.logger.error(
                    `[ProgramEmbeddingService] Schema parse failed for program ${program.id}: ${err}`,
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
                "[ProgramEmbeddingService] All embeddings are up to date.",
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
                `[ProgramEmbeddingService] Saved ${itemsToSave.length} new embeddings.`,
            );
        }
    }
}
