import { EmbedTaskTypeEnum } from "@/enums/chat";
import type { EmbedTaskType } from "@/types/chat";
import { GoogleGenAI } from "@google/genai";
import type {
    EmbedBatchItem,
    EmbeddingProvider,
} from "../interfaces/EmbeddingProvider";

const mapTaskType = {
    [EmbedTaskTypeEnum.QUERY]: "RETRIEVAL_QUERY",
    [EmbedTaskTypeEnum.DOCUMENT]: "RETRIEVAL_DOCUMENT",
};

export class EmbeddingProviderImpl implements EmbeddingProvider {
    private readonly client: GoogleGenAI;
    private readonly modelName = "gemini-embedding-001";

    constructor() {
        const apiKey =
            import.meta.env?.GEMINI_API_KEY || process.env.GEMINI_API_KEY || "";

        if (!apiKey) {
            throw new Error(
                "[EmbeddingProviderImpl] GEMINI_API_KEY no está configurada.",
            );
        }
        // Inicialización con el nuevo SDK
        this.client = new GoogleGenAI({ apiKey });
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
        const googleTaskType = mapTaskType[taskType];

        const result = await this.client.models.embedContent({
            model: this.modelName,
            contents: text,
            config: {
                taskType: googleTaskType,
            },
        });

        const values = result.embeddings?.[0]?.values || [];
        return this.normalizeL2(values);
    }

    async embedBatch(
        items: EmbedBatchItem[],
        taskType: EmbedTaskType = EmbedTaskTypeEnum.DOCUMENT,
    ): Promise<Map<string, number[]>> {
        const resultMap = new Map<string, number[]>();
        if (!items.length) return resultMap;

        const googleTaskType = mapTaskType[taskType];
        const BATCH_SIZE = 50;

        for (let i = 0; i < items.length; i += BATCH_SIZE) {
            const chunk = items.slice(i, i + BATCH_SIZE);

            const texts = chunk.map((item) => item.text);

            const response = await this.client.models.embedContent({
                model: this.modelName,
                contents: texts,
                config: {
                    taskType: googleTaskType as any,
                },
            });

            if (response.embeddings) {
                response.embeddings.forEach((embedding, index) => {
                    const item = chunk[index];
                    if (item && embedding.values) {
                        resultMap.set(
                            item.id,
                            this.normalizeL2(embedding.values),
                        );
                    }
                });
            }
        }

        return resultMap;
    }
}
