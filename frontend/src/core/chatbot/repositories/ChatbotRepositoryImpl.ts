import { db } from "@/db";
import { conversations, leads, messages } from "@/db/schema";
import { ChannelEnum, ChatStatusEnum } from "@/enums/chat";
import type { Channel, MessageRole } from "@/types/chat";
import type { Locale } from "@/types/locale";
import { and, eq } from "drizzle-orm";
import { Conversation } from "../entities/Conversation";
import { Message } from "../entities/Message";
import type {
    AppendMessagesArgs,
    ChatbotRepository,
    CloseConversationArgs,
    FindActiveSessionArgs,
} from "../interfaces/ChatbotRepository";
import { Lead } from "../entities/Lead";

function toConversation({
    conversation,
    messagesArray = [],
    lead,
}: {
    conversation: typeof conversations.$inferSelect;
    messagesArray?: (typeof messages.$inferSelect)[];
    lead?: typeof leads.$inferSelect;
}): Conversation {
    const messagesEntities = messagesArray.map(
        ({
            id,
            content,
            role,
            tokensUsed,
            conversationId,
            externalMessageId,
            subject,
        }) =>
            Message.create({
                id,
                content,
                role,
                tokensUsed,
                conversationId,
                externalMessageId,
                subject,
            }),
    );

    const leadEntity = lead
        ? Lead.create({
              id: lead.id,
              name: lead.name,
              email: lead.email,
              phone: lead.phone,
              company: lead.company,
              status: lead.status,
              telegramUsername: lead.telegramUsername,
              detectedIntent: lead.detectedIntent,
              customData: lead.customData,
              conversationId: lead.conversationId!,
          })
        : null;

    return Conversation.create({
        id: conversation.id,
        locale: conversation.locale,
        status: conversation.status,
        sessionToken: conversation.sessionToken,
        clientIp: conversation.clientIp,
        userAgent: conversation.userAgent,
        botPaused: conversation.botPaused,
        pausedAt: conversation.pausedAt,
        phone: conversation.phone,
        telegramChatId: conversation.telegramChatId,
        email: conversation.email,
        channel: conversation.channel,
        messages: messagesEntities,
        lead: leadEntity,
    });
}

export class ChatbotRepositoryImpl implements ChatbotRepository {
    private getChannelCondition(
        channel: string,
        sessionToken: string,
        phone: string,
    ) {
        return channel === ChannelEnum.WEB
            ? eq(conversations.sessionToken, sessionToken)
            : eq(conversations.phone, phone);
    }

    async appendMessages({
        clientIp,
        locale,
        messages: draftMessages,
        sessionToken,
        userAgent,
        channel,
        email,
        phone,
        telegramChatId,
        lead: draftLead,
    }: AppendMessagesArgs): Promise<Conversation> {
        return await db.transaction(async (tx) => {
            const condition = this.getChannelCondition(
                channel,
                sessionToken!,
                phone!,
            );

            const [existingConversation] = await tx
                .select()
                .from(conversations)
                .where(
                    and(
                        condition,
                        eq(conversations.channel, channel as Channel),
                    ),
                )
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
                            channel: channel as Channel,
                            email,
                            phone,
                            telegramChatId,
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

            const [existingLead] = await tx
                .select()
                .from(leads)
                .where(eq(leads.conversationId, conversationRow.id))
                .for("update")
                .limit(1);

            const leadSaved =
                existingLead && draftLead
                    ? (
                          await tx
                              .update(leads)
                              .set({
                                  name: draftLead.name,
                                  phone: draftLead.phone,
                                  email: draftLead.email,
                                  company: draftLead.company,
                                  detectedIntent: draftLead.detectedIntent,
                                  telegramUsername: draftLead.telegramUsername,
                                  customData: draftLead.customData,
                                  conversationId: conversationRow.id,
                              })
                              .returning()
                      ).at(0)
                    : draftLead
                      ? (
                            await tx
                                .insert(leads)
                                .values({
                                    name: draftLead.name,
                                    phone: draftLead.phone,
                                    email: draftLead.email,
                                    company: draftLead.company,
                                    detectedIntent: draftLead.detectedIntent,
                                    telegramUsername:
                                        draftLead.telegramUsername,
                                    customData: draftLead.customData,
                                    conversationId: conversationRow.id,
                                })
                                .returning()
                        ).at(0)
                      : undefined;

            return toConversation({
                conversation: conversationRow,
                messagesArray: messagesSaved,
                lead: leadSaved,
            });
        });
    }

    async closeConversation({
        sessionToken,
        channel,
        phone,
    }: CloseConversationArgs): Promise<void> {
        const condition = this.getChannelCondition(
            channel,
            sessionToken!,
            phone!,
        );

        await db
            .update(conversations)
            .set({
                status: ChatStatusEnum.CLOSED,
            })
            .where(
                and(
                    condition,
                    eq(conversations.status, ChatStatusEnum.ACTIVE),
                    eq(conversations.channel, channel as Channel),
                ),
            );
    }

    async findActiveSession({
        sessionToken,
        channel,
        phone,
    }: FindActiveSessionArgs): Promise<Conversation | null> {
        const condition = this.getChannelCondition(
            channel,
            sessionToken!,
            phone!,
        );

        const conversation = await db.query.conversations.findFirst({
            where: (conversations, { and, eq }) =>
                and(
                    condition,
                    eq(conversations.status, ChatStatusEnum.ACTIVE),
                    eq(conversations.channel, channel as Channel),
                ),
            with: {
                messages: {
                    orderBy: (messages, { asc }) => asc(messages.createdAt),
                },
                lead: true,
            },
        });

        if (!conversation) {
            return null;
        }

        return toConversation({
            conversation,
            messagesArray: conversation.messages,
            lead: conversation.lead,
        });
    }
}
