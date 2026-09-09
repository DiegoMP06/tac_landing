import type { Locale } from "@/types/locale";
import { cosineSimilarity } from "@/utils/chatbot/similarity";
import type { EmbeddingProvider } from "../interfaces/EmbeddingProvider";
import type { EmbeddingRepository } from "../interfaces/EmbeddingRepository";
import { EmbedTaskTypeEnum } from "@/enums/chat";
import type { LoggerAdapter } from "@/core/shared/interfaces/LoggerAdapter";

const TOP_K = 6;
const MIN_SIMILARITY = 0.3;

type ChatbotContextServiceArgs = {
    embeddingRepository: EmbeddingRepository;
    embeddingProvider: EmbeddingProvider;
    locale: Locale;
    logger: LoggerAdapter;
};

type GetRelevantContextArgs = {
    query: string;
};

export class ChatbotContextService {
    private readonly embeddingRepository: EmbeddingRepository;
    private readonly embeddingProvider: EmbeddingProvider;
    private readonly locale: Locale;
    private readonly logger: LoggerAdapter;

    constructor({
        embeddingRepository,
        embeddingProvider,
        locale,
        logger,
    }: ChatbotContextServiceArgs) {
        this.embeddingRepository = embeddingRepository;
        this.embeddingProvider = embeddingProvider;
        this.locale = locale;
        this.logger = logger;
    }

    async getRelevantContext({
        query,
    }: GetRelevantContextArgs): Promise<string> {
        const [queryEmbedding, storedEmbeddings] = await Promise.all([
            this.embeddingProvider.embed(query, EmbedTaskTypeEnum.QUERY),
            this.embeddingRepository.getByLocale(this.locale),
        ]);

        if (storedEmbeddings.length === 0) return "";

        const ranked = storedEmbeddings
            .map((item) => ({
                item,
                score: cosineSimilarity(queryEmbedding, item.embedding),
            }))
            .filter((r) => r.score >= MIN_SIMILARITY)
            .sort((a, b) => b.score - a.score)
            .slice(0, TOP_K);

        this.logger.info(
            `[ChatbotContextService] query="${query}" | candidates=${storedEmbeddings.length} | selected=${ranked.length}`,
            ranked.map((r) => ({
                key: r.item.cacheId,
                score: r.score.toFixed(3),
            })),
        );

        if (ranked.length === 0) return "";

        return ranked
            .map(({ item }) => `## [${item.cacheId}] ${item.content}`)
            .join("\n\n---\n\n");
    }
}
