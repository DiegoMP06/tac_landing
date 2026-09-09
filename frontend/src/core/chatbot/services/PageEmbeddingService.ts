import type { LoggerAdapter } from "@/core/shared/interfaces/LoggerAdapter";
import type { PageType, PageTypeMap } from "@/types/pages";
import { hashText } from "@/utils/hash";
import { jsonToString } from "@/utils/json";
import { PageDict } from "@/utils/translation/page";
import type { EmbeddingProvider } from "../interfaces/EmbeddingProvider";
import type { EmbeddingRepository } from "../interfaces/EmbeddingRepository";

type PageEmbeddingArgs = {
    embedding: EmbeddingProvider;
    repository: EmbeddingRepository;
    logger: LoggerAdapter;
};

type GenerateAndIndexPageArgs<T extends PageType> = {
    page: PageTypeMap[T];
    cacheId: string;
    type: T;
};

export class PageEmbeddingService {
    private readonly embedding: EmbeddingProvider;
    private readonly repository: EmbeddingRepository;
    private readonly logger: LoggerAdapter;

    constructor({ embedding, repository, logger }: PageEmbeddingArgs) {
        this.embedding = embedding;
        this.repository = repository;
        this.logger = logger;
    }

    async generateAndIndexPage<T extends PageType>({
        page,
        cacheId,
        type,
    }: GenerateAndIndexPageArgs<T>): Promise<void> {
        const { translationSchema } = PageDict[type];
        const readyForEmbedding = translationSchema.parse(page);
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
}
