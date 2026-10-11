import type { DraftMessage } from "@/core/chatbot/entities/Message";
import { ChatProviderImpl } from "@/core/chatbot/providers/ChatProviderImpl";
import { EmbeddingProviderImpl } from "@/core/chatbot/providers/EmbeddingProviderImpl";
import { ChatbotRepositoryImpl } from "@/core/chatbot/repositories/ChatbotRepositoryImpl";
import { EmbeddingRepositoryImpl } from "@/core/chatbot/repositories/EmbeddingRepositoryImpl";
import { ChatbotContextService } from "@/core/chatbot/services/ChatbotContextService";
import { ChatbotService } from "@/core/chatbot/services/ChatbotService";
import { ConversationPersistenceService } from "@/core/chatbot/services/ConversationPersistenceService";
import { LoggerAdapterImpl } from "@/core/shared/adapters/LoggerAdapterImpl";
import { MessageRoleEnum } from "@/enums/chat";
import { LocalesEnum } from "@/enums/locale";
import { getClientIP } from "@/utils/ip";
import { generateUUID } from "@/utils/uuid";
import type { APIRoute } from "astro";
import { z } from "astro/zod";

const ChatRouteSchema = z.object({
    locale: z.enum(LocalesEnum, { error: "Locale is required" }),
    message: z.string().min(1, { error: "message is required" }),
    ip: z
        .ipv4({ error: "Invalid IP address" })
        .or(z.ipv6({ error: "Invalid IP address" })),
    userAgent: z.string().optional().nullable().default(null),
});

export const POST: APIRoute = async ({ request, clientAddress, cookies }) => {
    try {
        const clientIP = getClientIP(request, clientAddress);
        const userAgentHeaders = request.headers.get("user-agent") || undefined;
        const body = await request.json();

        const validated = ChatRouteSchema.safeParse({
            ...body,
            ip: clientIP,
            userAgent: userAgentHeaders,
        });

        if (!validated.success) {
            console.log(validated.error.message);
            return new Response(
                JSON.stringify({ error: "Invalid request body" }),
                {
                    status: 400,
                    headers: { "Content-Type": "application/json" },
                },
            );
        }

        const { message, locale, ip, userAgent } = validated.data;

        const chatbot = new ChatProviderImpl(locale);
        const chatbotRepository = new ChatbotRepositoryImpl();
        const embeddingRepository = new EmbeddingRepositoryImpl();
        const embeddingProvider = new EmbeddingProviderImpl();
        const logger = new LoggerAdapterImpl();

        const contextService = new ChatbotContextService({
            embeddingRepository,
            embeddingProvider,
            locale,
            logger,
        });

        const persistenceService = new ConversationPersistenceService({
            chatbotRepository,
            locale,
            logger,
        });

        const chatbotService = new ChatbotService({
            chatbot,
            contextService,
            persistenceService,
            logger,
            locale,
        });

        const sessionToken =
            cookies.get("chat_session")?.value ?? generateUUID();

        cookies.set("chat_session", sessionToken, {
            path: "/",
            httpOnly: true,
            sameSite: "lax",
        });

        const existingConversation = await chatbotRepository.findActiveSession({
            sessionToken,
        });

        const history: DraftMessage[] = existingConversation
            ? existingConversation.messages.map(
                  ({ role, content, tokensUsed }) => ({
                      role,
                      content,
                      tokensUsed,
                  }),
              )
            : [];

        const newMessage: DraftMessage = {
            role: MessageRoleEnum.USER,
            content: message,
            tokensUsed: null,
        };

        const stream = await chatbotService.streamChatbot({
            history,
            newMessage,
            conversation: {
                clientIp: ip,
                sessionToken,
                userAgent,
            },
        });

        return new Response(stream, {
            headers: {
                "Content-Type": "text/plain; charset=utf-8",
                "Transfer-Encoding": "chunked",
                "X-Content-Type-Options": "nosniff",
                "Cache-Control": "no-cache",
            },
        });
    } catch (error) {
        console.error("[api/chat] Error:", error);
        return new Response(
            JSON.stringify({ error: "Error interno del servidor" }),
            { status: 500, headers: { "Content-Type": "application/json" } },
        );
    }
};
