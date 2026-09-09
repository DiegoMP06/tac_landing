import { SendLeadEmail } from "@/core/chatbot/emails/SendLeadEmail";
import { ChatProviderImpl } from "@/core/chatbot/providers/ChatProviderImpl";
import { ChatbotRepositoryImpl } from "@/core/chatbot/repositories/ChatbotRepositoryImpl";
import { ConversationPersistenceService } from "@/core/chatbot/services/ConversationPersistenceService";
import { LeadService } from "@/core/chatbot/services/LeadService";
import { LoggerAdapterImpl } from "@/core/shared/adapters/LoggerAdapterImpl";
import { ChannelEnum, MessageRoleEnum } from "@/enums/chat";
import { LocalesEnum } from "@/enums/locale";
import { getClientIP } from "@/utils/ip";
import { generateUUID } from "@/utils/uuid";
import { z } from "astro/zod";
import { defineAction } from "astro:actions";

const to = process.env.ADMIN_EMAIL || import.meta.env.ADMIN_EMAIL;

const CreateLeadInputSchema = z.object({
    locale: z.enum(LocalesEnum),
    name: z.string().nonempty(),
    email: z.email().nonempty(),
    phone: z.string().nonempty(),
    message: z.string().nonempty().max(1000),
    company: z.string().nullable(),
});

export type CreateLeadInput = z.infer<typeof CreateLeadInputSchema>;

export const createLead = defineAction({
    accept: "json",
    input: CreateLeadInputSchema,
    handler: async (input, { cookies, request, clientAddress }) => {
        const { locale, email, phone, company, name, message } = input;
        const clientIp = getClientIP(request, clientAddress);
        const userAgent = request.headers.get("user-agent") || null;

        const sessionToken =
            cookies.get("chat_session")?.value ?? generateUUID();

        cookies.set("chat_session", sessionToken, {
            path: "/",
            httpOnly: true,
            sameSite: "lax",
        });

        const chatbot = new ChatProviderImpl(locale);
        const logger = new LoggerAdapterImpl();
        const chatbotRepository = new ChatbotRepositoryImpl();

        const persistenceService = new ConversationPersistenceService({
            chatbotRepository,
            locale,
            logger,
        });

        const leadService = new LeadService({
            chatbot,
            locale,
            logger,
            persistenceService,
        });

        try {
            await leadService.addLeadWithoutEvaluating({
                conversation: {
                    channel: ChannelEnum.WEB,
                    clientIp,
                    userAgent,
                    email,
                    phone,
                    sessionToken,
                    telegramChatId: null,
                    lead: {
                        company,
                        customData: {
                            message,
                        },
                        email,
                        name,
                        phone,
                        detectedIntent: "landing_contact_form",
                        telegramUsername: null,
                    },
                },
                newMessage: {
                    content: `Se envio un mensaje ${message} por parte de ${name} al email`,
                    role: MessageRoleEnum.USER,
                    tokensUsed: null,
                },
            });

            const leadMail = new SendLeadEmail({
                locale,
                from: email,
                to,
            }).build({
                company,
                content: message,
                email,
                name,
                phone,
            });

            await leadMail.send();

            return {
                success: true,
            };
        } catch (error) {
            return {
                success: false,
            };
        }
    },
});
