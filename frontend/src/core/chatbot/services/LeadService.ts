import type { LoggerAdapter } from "@/core/shared/interfaces/LoggerAdapter";
import { MessageRoleEnum } from "@/enums/chat";
import type { Locale } from "@/types/locale";
import { buildSystemPrompt } from "@/utils/chatbot/leads";
import type { Conversation } from "../entities/Conversation";
import type { DraftMessage } from "../entities/Message";
import type { ChatProvider } from "../interfaces/ChatProvider";
import type {
    ConversationInfo,
    ConversationPersistenceService,
} from "./ConversationPersistenceService";

type LeadServiceArgs = {
    chatbot: ChatProvider;
    persistenceService: ConversationPersistenceService;
    logger: LoggerAdapter;
    locale: Locale;
};

type AddLeadWithoutEvaluatingArgs = {
    conversation: ConversationInfo;
    newMessage: DraftMessage;
};

export class LeadService {
    private readonly chatbot: ChatProvider;
    private readonly persistenceService: ConversationPersistenceService;
    private readonly logger: LoggerAdapter;
    private readonly locale: Locale;

    constructor({
        chatbot,
        locale,
        logger,
        persistenceService,
    }: LeadServiceArgs) {
        this.chatbot = chatbot;
        this.persistenceService = persistenceService;
        this.logger = logger;
        this.locale = locale;
    }

    async addLeadWithoutEvaluating({
        conversation: draftConversation,
        newMessage,
    }: AddLeadWithoutEvaluatingArgs): Promise<Conversation> {
        const systemPrompt = buildSystemPrompt(this.locale);

        const messageFormatted = await this.chatbot.getCompletion({
            messages: [
                {
                    content: JSON.stringify(draftConversation.lead),
                    role: MessageRoleEnum.USER,
                },
            ],
            systemPrompt,
        });

        const conversation = await this.persistenceService.persist({
            conversation: draftConversation,
            newMessage,
            assistantResponse: messageFormatted.content,
        });

        return conversation;
    }
}
