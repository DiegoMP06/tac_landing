import { GoogleGenerativeAI, TaskType } from "@google/generative-ai";
import type {
    EmbedBatchItem,
    EmbeddingProvider,
} from "../interfaces/EmbeddingProvider";
import type { EmbedTaskType } from "@/types/chat";
import { EmbedTaskTypeEnum } from "@/enums/chat";

const mapTaskType = {
    [EmbedTaskTypeEnum.QUERY]: TaskType.RETRIEVAL_QUERY,
    [EmbedTaskTypeEnum.DOCUMENT]: TaskType.RETRIEVAL_DOCUMENT,
};

export class EmbeddingProviderImpl implements EmbeddingProvider {
    private readonly client: GoogleGenerativeAI;
    private readonly modelName = "gemini-embedding-001";

    constructor() {
        const apiKey =
            import.meta.env?.GEMINI_API_KEY || process.env.GEMINI_API_KEY || "";
        if (!apiKey) {
            throw new Error(
                "[EmbeddingProviderImpl] GEMINI_API_KEY no está configurada.",
            );
        }
        this.client = new GoogleGenerativeAI(apiKey);
    }

    private normalizeL2(vector: number[]): number[] {
        const magnitude = Math.sqrt(
            vector.reduce((sum, val) => sum + val * val, 0),
        );

        if (magnitude === 0) return vector;

        return vector.map((val) => val / magnitude);
    }

    async embed(
        text: string,
        taskType: EmbedTaskType = EmbedTaskTypeEnum.DOCUMENT,
    ): Promise<number[]> {
        const model = this.client.getGenerativeModel({ model: this.modelName });
        const googleTaskType = mapTaskType[taskType];

        const result = await model.embedContent({
            content: { role: "user", parts: [{ text }] },
            taskType: googleTaskType,
        });

        return this.normalizeL2(result.embedding.values);
    }

    async embedBatch(
        items: EmbedBatchItem[],
        taskType: EmbedTaskType = EmbedTaskTypeEnum.DOCUMENT,
    ): Promise<Map<string, number[]>> {
        const resultMap = new Map<string, number[]>();
        if (!items.length) return resultMap;

        const model = this.client.getGenerativeModel({ model: this.modelName });
        const googleTaskType = mapTaskType[taskType];

        const BATCH_SIZE = 50;

        for (let i = 0; i < items.length; i += BATCH_SIZE) {
            const chunk = items.slice(i, i + BATCH_SIZE);

            const requests = chunk.map((item) => ({
                content: { role: "user", parts: [{ text: item.text }] },
                taskType: googleTaskType,
            }));

            const response = await model.batchEmbedContents({
                requests,
            });

            response.embeddings.forEach((embedding, index) => {
                const item = chunk[index];
                if (item) {
                    resultMap.set(item.id, this.normalizeL2(embedding.values));
                }
            });
        }

        return resultMap;
    }
}
