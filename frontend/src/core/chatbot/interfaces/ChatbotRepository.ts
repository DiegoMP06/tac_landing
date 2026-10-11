import type { Conversation, DraftConversation } from "../entities/Conversation";

export type AppendMessagesArgs = DraftConversation;

export type CloseConversationBySessionIdArgs = Pick<
    DraftConversation,
    "sessionToken"
>;

export type FindActiveSessionArgs = Pick<DraftConversation, "sessionToken">;

export type CloseInactiveConversationArgs = {
    hours?: number;
} & Pick<DraftConversation, "sessionToken">;

export abstract class ChatbotRepository {
    abstract appendMessages(args: AppendMessagesArgs): Promise<Conversation>;

    abstract findActiveSession(
        args: FindActiveSessionArgs,
    ): Promise<Conversation | null>;

    abstract closeConversationBySessionId(
        args: CloseConversationBySessionIdArgs,
    ): Promise<void>;

    abstract closeInactiveConversation(
        args: CloseInactiveConversationArgs,
    ): Promise<void>;
}
