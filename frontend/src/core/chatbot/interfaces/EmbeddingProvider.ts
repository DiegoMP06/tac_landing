import type { EmbedTaskType } from "@/types/chat";

export type EmbedBatchItem = {
    id: string;
    text: string;
};

export interface EmbeddingProvider {
    embed(text: string, taskType?: EmbedTaskType): Promise<number[]>;

    embedBatch(
        items: EmbedBatchItem[],
        taskType?: EmbedTaskType,
    ): Promise<Map<string, number[]>>;
}
