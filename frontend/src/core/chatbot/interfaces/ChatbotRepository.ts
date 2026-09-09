import type { Conversation, DraftConversation } from "../entities/Conversation";

export type AppendMessagesArgs = DraftConversation;

export type CloseConversationArgs = Pick<
    DraftConversation,
    "channel" | "sessionToken" | "phone"
>;

export type FindActiveSessionArgs = Pick<
    DraftConversation,
    "channel" | "sessionToken" | "phone"
>;

export abstract class ChatbotRepository {
    abstract appendMessages(args: AppendMessagesArgs): Promise<Conversation>;

    abstract closeConversation(args: CloseConversationArgs): Promise<void>;

    abstract findActiveSession(
        args: FindActiveSessionArgs,
    ): Promise<Conversation | null>;
}
