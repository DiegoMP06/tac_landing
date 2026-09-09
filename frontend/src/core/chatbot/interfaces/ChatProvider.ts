import type { Locale } from "@/types/locale";
import type { DraftMessage, Message } from "../entities/Message";
import type { MessageRole, ResponseFormat } from "@/types/chat";

export type StreamResponseArgs = {
    messages: DraftMessage[];
    systemPrompt: string;
};

export type GetCompletionArgs = {
    messages: DraftMessage[];
    systemPrompt: string;
    responseFormat?: ResponseFormat;
};

export abstract class ChatProvider {
    protected abstract model: string;
    protected abstract apiKey: string;
    protected abstract temperature: number;
    protected abstract locale: Locale;

    abstract streamResponse(
        args: StreamResponseArgs,
    ): Promise<ReadableStream<Uint8Array>>;

    abstract getCompletion(args: GetCompletionArgs): Promise<DraftMessage>;
}
