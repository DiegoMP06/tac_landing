import {
    CHATBOT_MAX_TOKENS,
    CHATBOT_MODEL,
    CHATBOT_TEMPERATURE,
} from "@/consts/chatbot";
import { MessageRoleEnum, ResponseFormatEnum } from "@/enums/chat";
import type { MessageRole } from "@/types/chat";
import type { Locale } from "@/types/locale";
import { Groq } from "groq-sdk";
import type { DraftMessage } from "../entities/Message";
import {
    ChatProvider,
    type GetCompletionArgs,
    type StreamResponseArgs,
} from "../interfaces/ChatProvider";

const API_KEY = import.meta.env?.GROQ_API_KEY || process.env.GROQ_API_KEY || "";

if (!API_KEY) {
    throw new Error(
        "[ChatProviderImpl] GROQ_API_KEY no está configurada en las variables de entorno.",
    );
}

export class ChatProviderImpl extends ChatProvider {
    protected readonly model: string;
    protected readonly apiKey: string;
    protected readonly temperature: number;
    protected readonly locale: Locale;
    protected readonly maxTokens: number;
    private readonly client: Groq;

    constructor(locale: Locale) {
        super();
        this.locale = locale;
        this.apiKey = API_KEY;
        this.model = CHATBOT_MODEL;
        this.temperature = CHATBOT_TEMPERATURE;
        this.maxTokens = CHATBOT_MAX_TOKENS;
        this.client = new Groq({ apiKey: this.apiKey });
    }

    private formatMessages(
        messages: DraftMessage[],
    ): Groq.Chat.ChatCompletionMessageParam[] {
        return messages
            .map(({ role, content }) => ({
                role: role as Exclude<MessageRole, "agent">,
                content,
            }))
            .filter(
                (message) => (message.role as string) !== MessageRoleEnum.AGENT,
            );
    }

    override async streamResponse({
        messages,
        systemPrompt,
    }: StreamResponseArgs): Promise<ReadableStream<Uint8Array>> {
        const groqMessages: Groq.Chat.ChatCompletionMessageParam[] = [
            { role: MessageRoleEnum.SYSTEM, content: systemPrompt },
            ...this.formatMessages(messages),
        ];

        const stream = await this.client.chat.completions.create({
            model: this.model,
            messages: groqMessages,
            temperature: this.temperature,
            max_tokens: this.maxTokens,
            stream: true,
        });

        const encoder = new TextEncoder();

        return new ReadableStream<Uint8Array>({
            async start(controller) {
                for await (const chunk of stream) {
                    const text = chunk.choices[0]?.delta?.content;
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
        const groqMessages: Groq.Chat.ChatCompletionMessageParam[] = [
            { role: MessageRoleEnum.SYSTEM, content: systemPrompt },
            ...this.formatMessages(messages),
        ];

        const completion = await this.client.chat.completions.create({
            model: this.model,
            messages: groqMessages,
            temperature: this.temperature,
            max_tokens: this.maxTokens,
            stream: false,
            response_format: { type: responseFormat },
        });

        const content = completion.choices[0]?.message?.content || "";
        const tokensUsed = completion.usage?.total_tokens || 0;

        return {
            content,
            role: MessageRoleEnum.ASSISTANT,
            tokensUsed,
        };
    }
}
