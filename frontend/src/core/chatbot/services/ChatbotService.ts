import type { LoggerAdapter } from "@/core/shared/interfaces/LoggerAdapter";
import type { DraftMessage } from "../entities/Message";
import type { ChatProvider } from "../interfaces/ChatProvider";
import { ChatbotContextService } from "./ChatbotContextService";
import {
    ConversationPersistenceService,
    type ConversationInfo,
} from "./ConversationPersistenceService";
import { buildSystemPrompt } from "@/utils/chatbot";
import type { Locale } from "@/types/locale";

type ChatbotServiceArgs = {
    chatbot: ChatProvider;
    contextService: ChatbotContextService;
    persistenceService: ConversationPersistenceService;
    logger: LoggerAdapter;
    locale: Locale;
};

type StreamChatbotArgs = {
    history: DraftMessage[];
    newMessage: DraftMessage;
    conversation: ConversationInfo;
};

export class ChatbotService {
    private readonly chatbot: ChatProvider;
    private readonly contextService: ChatbotContextService;
    private readonly persistenceService: ConversationPersistenceService;
    private readonly logger: LoggerAdapter;
    private readonly locale: Locale;

    constructor({
        chatbot,
        contextService,
        persistenceService,
        logger,
        locale,
    }: ChatbotServiceArgs) {
        this.chatbot = chatbot;
        this.contextService = contextService;
        this.persistenceService = persistenceService;
        this.logger = logger;
        this.locale = locale;
    }

    async streamChatbot({
        history,
        newMessage,
        conversation,
    }: StreamChatbotArgs): Promise<ReadableStream<Uint8Array>> {
        const context = await this.contextService.getRelevantContext({
            query: newMessage.content,
        });

        const systemPrompt = buildSystemPrompt(context, this.locale);

        const providerStream = await this.chatbot.streamResponse({
            messages: [...history, newMessage],
            systemPrompt,
        });

        return this.tapForPersistence(providerStream, newMessage, conversation);
    }

    private tapForPersistence(
        source: ReadableStream<Uint8Array>,
        newMessage: DraftMessage,
        conversation: ConversationInfo,
    ): ReadableStream<Uint8Array> {
        const logger = this.logger;
        const decoder = new TextDecoder();
        const persist = this.persistenceService.persist.bind(
            this.persistenceService,
        );
        let fullResponse = "";

        return new ReadableStream<Uint8Array>({
            async start(controller) {
                const reader = source.getReader();

                try {
                    while (true) {
                        const { done, value } = await reader.read();
                        if (done) break;

                        fullResponse += decoder.decode(value, { stream: true });
                        controller.enqueue(value);
                    }
                    controller.close();
                } catch (error) {
                    controller.error(error);
                    return;
                }

                persist({
                    newMessage,
                    assistantResponse: fullResponse,
                    conversation,
                }).catch((error) => {
                    logger.error(
                        "[ChatbotService] Error al guardar conversación:",
                        error,
                    );
                });
            },
            cancel(reason) {
                return source.cancel(reason);
            },
        });
    }
}
