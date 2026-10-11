import {
    CHATBOT_MAX_TOKENS,
    CHATBOT_MODEL,
    CHATBOT_TEMPERATURE,
} from "@/consts/chatbot";
import { MessageRoleEnum, ResponseFormatEnum } from "@/enums/chat";
import type { Locale } from "@/types/locale";
import { GoogleGenAI, type Content } from "@google/genai";
import type { DraftMessage } from "../entities/Message";
import {
    ChatProvider,
    type GetCompletionArgs,
    type StreamResponseArgs,
} from "../interfaces/ChatProvider";

const API_KEY =
    import.meta.env?.GEMINI_API_KEY || process.env.GEMINI_API_KEY || "";

if (!API_KEY) {
    throw new Error(
        "[ChatProviderImpl] GEMINI_API_KEY no está configurada en las variables de entorno.",
    );
}

export class ChatProviderImpl extends ChatProvider {
    protected readonly model: string;
    protected readonly apiKey: string;
    protected readonly temperature: number;
    protected readonly locale: Locale;
    protected readonly maxTokens: number;
    private readonly client: GoogleGenAI;

    constructor(locale: Locale) {
        super();
        this.locale = locale;
        this.apiKey = API_KEY;
        this.model = CHATBOT_MODEL;
        this.temperature = CHATBOT_TEMPERATURE;
        this.maxTokens = CHATBOT_MAX_TOKENS;
        this.client = new GoogleGenAI({ apiKey: this.apiKey });
    }

    private formatMessages(messages: DraftMessage[]): Content[] {
        return messages
            .filter(
                (message) =>
                    message.role !== MessageRoleEnum.AGENT &&
                    message.role !== MessageRoleEnum.SYSTEM,
            )
            .map(({ role, content }) => ({
                role: role === MessageRoleEnum.USER ? "user" : "model",
                parts: [{ text: content }],
            }));
    }

    override async streamResponse({
        messages,
        systemPrompt,
    }: StreamResponseArgs): Promise<ReadableStream<Uint8Array>> {
        const geminiMessages = this.formatMessages(messages);

        const responseStream = await this.client.models.generateContentStream({
            model: this.model,
            contents: geminiMessages,
            config: {
                systemInstruction: systemPrompt,
                temperature: this.temperature,
                maxOutputTokens: this.maxTokens,
                responseMimeType: "text/plain",
            },
        });

        const encoder = new TextEncoder();

        return new ReadableStream<Uint8Array>({
            async start(controller) {
                for await (const chunk of responseStream) {
                    const text = chunk.text;
                    if (text) {
                        controller.enqueue(encoder.encode(text));
                    }
                }
                controller.close();
            },
        });
    }

    async getCompletion({
        messages,
        systemPrompt,
        responseFormat = ResponseFormatEnum.TEXT,
    }: GetCompletionArgs): Promise<DraftMessage> {
        const geminiMessages = this.formatMessages(messages);

        const response = await this.client.models.generateContent({
            model: this.model,
            contents: geminiMessages,
            config: {
                systemInstruction: systemPrompt,
                temperature: this.temperature,
                maxOutputTokens: this.maxTokens,
                responseMimeType:
                    responseFormat === "json_object"
                        ? "application/json"
                        : "text/plain",
            },
        });

        const content = response.text || "";
        const tokensUsed = response.usageMetadata?.totalTokenCount || 0;

        return {
            content,
            role: MessageRoleEnum.ASSISTANT,
            tokensUsed,
        };
    }
}
