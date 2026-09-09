import type { LoggerAdapter } from "@/core/shared/interfaces/LoggerAdapter";
import { MessageRoleEnum } from "@/enums/chat";
import type { Locale } from "@/types/locale";
import type { Conversation, DraftConversation } from "../entities/Conversation";
import type { DraftMessage } from "../entities/Message";
import type { ChatbotRepository } from "../interfaces/ChatbotRepository";

type ConversationPersistenceServiceArgs = {
    chatbotRepository: ChatbotRepository;
    locale: Locale;
    logger: LoggerAdapter;
};
export type ConversationInfo = Pick<
    DraftConversation,
    | "clientIp"
    | "sessionToken"
    | "userAgent"
    | "channel"
    | "email"
    | "phone"
    | "telegramChatId"
    | "lead"
>;

type PersistArgs = {
    newMessage?: DraftMessage;
    assistantResponse?: string;
    conversation: ConversationInfo;
};

export class ConversationPersistenceService {
    private readonly chatbotRepository: ChatbotRepository;
    private readonly locale: Locale;
    private readonly logger: LoggerAdapter;

    constructor({
        chatbotRepository,
        locale,
        logger,
    }: ConversationPersistenceServiceArgs) {
        this.chatbotRepository = chatbotRepository;
        this.locale = locale;
        this.logger = logger;
    }

    async persist({
        assistantResponse,
        newMessage,
        conversation,
    }: PersistArgs): Promise<Conversation> {
        return await this.chatbotRepository.appendMessages({
            locale: this.locale,
            messages: [
                ...(newMessage ? [newMessage] : []),
                ...(assistantResponse
                    ? [
                          {
                              role: MessageRoleEnum.ASSISTANT,
                              content: assistantResponse,
                              tokensUsed: null,
                          },
                      ]
                    : []),
            ],
            ...conversation,
        });
    }
}
