import { db } from "@/db";
import { conversations, messages } from "@/db/schema";
import { ChatStatusEnum } from "@/enums/chat";
import type { MessageRole } from "@/types/chat";
import type { Locale } from "@/types/locale";
import { and, eq, lt } from "drizzle-orm"; // <-- Se agregó 'lt'
import { Conversation } from "../entities/Conversation";
import { Message } from "../entities/Message";
import type {
    AppendMessagesArgs,
    ChatbotRepository,
    CloseConversationBySessionIdArgs,
    CloseInactiveConversationArgs,
    FindActiveSessionArgs,
} from "../interfaces/ChatbotRepository";

function toConversation({
    conversation,
    messagesArray = [],
}: {
    conversation: typeof conversations.$inferSelect;
    messagesArray?: (typeof messages.$inferSelect)[];
}): Conversation {
    const messagesEntities = messagesArray.map(
        ({ id, content, role, tokensUsed, conversationId, subject }) =>
            Message.create({
                id,
                content,
                role,
                tokensUsed,
                conversationId,
                subject,
            }),
    );

    return Conversation.create({
        id: conversation.id,
        locale: conversation.locale,
        status: conversation.status,
        sessionToken: conversation.sessionToken,
        clientIp: conversation.clientIp,
        userAgent: conversation.userAgent,
        messages: messagesEntities,
    });
}

export class ChatbotRepositoryImpl implements ChatbotRepository {
    async appendMessages({
        clientIp,
        locale,
        messages: draftMessages,
        sessionToken,
        userAgent,
    }: AppendMessagesArgs): Promise<Conversation> {
        return await db.transaction(async (tx) => {
            const [existingConversation] = await tx
                .select()
                .from(conversations)
                .where(eq(conversations.sessionToken, sessionToken))
                .for("update")
                .limit(1);

            const conversationRow =
                existingConversation ??
                (
                    await tx
                        .insert(conversations)
                        .values({
                            clientIp,
                            locale: locale as Locale,
                            sessionToken,
                            userAgent,
                        })
                        .returning()
                )[0];

            const messagesSaved = draftMessages
                ? await tx
                      .insert(messages)
                      .values(
                          draftMessages.map(
                              ({ content, role, tokensUsed }) => ({
                                  content,
                                  role: role as MessageRole,
                                  tokensUsed,
                                  conversationId: conversationRow.id,
                              }),
                          ),
                      )
                      .returning()
                : [];

            return toConversation({
                conversation: conversationRow,
                messagesArray: messagesSaved,
            });
        });
    }

    async findActiveSession({
        sessionToken,
    }: FindActiveSessionArgs): Promise<Conversation | null> {
        const conversation = await db.query.conversations.findFirst({
            where: (conversations, { and, eq }) =>
                and(
                    eq(conversations.sessionToken, sessionToken),
                    eq(conversations.status, ChatStatusEnum.ACTIVE),
                ),
            with: {
                messages: {
                    orderBy: (messages, { asc }) => asc(messages.createdAt),
                },
            },
        });

        if (!conversation) {
            return null;
        }

        return toConversation({
            conversation,
            messagesArray: conversation.messages,
        });
    }

    async closeConversationBySessionId({
        sessionToken,
    }: CloseConversationBySessionIdArgs): Promise<void> {
        await db
            .update(conversations)
            .set({
                status: ChatStatusEnum.CLOSED,
            })
            .where(
                and(
                    eq(conversations.sessionToken, sessionToken),
                    eq(conversations.status, ChatStatusEnum.ACTIVE),
                ),
            );
    }

    async closeInactiveConversation({
        hours = 2,
        sessionToken,
    }: CloseInactiveConversationArgs): Promise<void> {
        const timeThreshold = new Date(Date.now() - hours * 60 * 60 * 1000);

        await db
            .update(conversations)
            .set({
                status: ChatStatusEnum.CLOSED,
            })
            .where(
                and(
                    eq(conversations.sessionToken, sessionToken),
                    eq(conversations.status, ChatStatusEnum.ACTIVE),
                    lt(conversations.updatedAt, timeThreshold),
                ),
            );
    }
}
