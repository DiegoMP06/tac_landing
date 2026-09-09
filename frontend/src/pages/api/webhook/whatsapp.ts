import type { APIRoute } from "astro";
import { db } from "@/db"; // Tu instancia de cliente Drizzle
import { conversations, messages, telegramMappings } from "@/db/schema";
import { MessageRoleEnum } from "@/enums/chat";
import { desc, eq } from "drizzle-orm";
import type { MessageRole } from "@/types/chat";

/**
 * Obtiene la conversación asociada a partir del ID del mensaje en el grupo de Telegram de Staff.
 */
export async function getConversationByTelegramMessageId(
    staffTelegramMessageId: number,
) {
    const result = await db
        .select({
            id: conversations.id,
            channel: conversations.channel,
            phone: conversations.phone,
            telegramChatId: conversations.telegramChatId,
            email: conversations.email,
            botPaused: conversations.botPaused,
            locale: conversations.locale,
            status: conversations.status,
        })
        .from(telegramMappings)
        .innerJoin(
            conversations,
            eq(telegramMappings.conversationId, conversations.id),
        )
        .where(
            eq(telegramMappings.staffTelegramMessageId, staffTelegramMessageId),
        )
        .limit(1);

    return result[0] ?? null;
}

/**
 * Obtiene la última conversación que fue pausada para intervención humana.
 */
export async function getLastPausedConversation() {
    const result = await db
        .select()
        .from(conversations)
        .where(eq(conversations.botPaused, true))
        .orderBy(desc(conversations.pausedAt), desc(conversations.updatedAt))
        .limit(1);

    return result[0] ?? null;
}

/**
 * Registra en la base de datos el mensaje enviado por el agente humano.
 */
export async function saveAgentMessage({
    conversationId,
    content,
    role = MessageRoleEnum.AGENT,
}: {
    conversationId: string;
    content: string;
    role?: MessageRole;
}) {
    const [newMessage] = await db
        .insert(messages)
        .values({
            conversationId,
            content,
            role,
        })
        .returning();

    return newMessage;
}

/**
 * Reactiva el bot para una conversación quitando el estado de pausa.
 */
export async function unpauseBot(conversationId: string) {
    const [updatedConversation] = await db
        .update(conversations)
        .set({
            botPaused: false,
            pausedAt: null,
            updatedAt: new Date(),
        })
        .where(eq(conversations.id, conversationId))
        .returning();

    return updatedConversation;
}

export const POST: APIRoute = async ({ request }) => {
    try {
        const body = await request.json();
        const tgMessage = body.message;

        if (!tgMessage || !tgMessage.text) {
            return new Response("OK", { status: 200 });
        }

        const text = tgMessage.text.trim();
        const staffChatId = import.meta.env.TELEGRAM_CHAT_ID;

        // ==========================================================
        // 1. COMANDOS DE REACTIVACIÓN (/resume o /reactivar)
        // ==========================================================
        if (text.startsWith("/resume") || text.startsWith("/reactivar")) {
            let conversation;

            // Si se hace /resume respondiendo a un mensaje específico
            if (tgMessage.reply_to_message) {
                conversation = await getConversationByTelegramMessageId(
                    tgMessage.reply_to_message.message_id,
                );
            } else {
                // Si no, toma la última conversación pausada
                conversation = await getLastPausedConversation();
            }

            if (conversation) {
                await unpauseBot(conversation.id);

                // Notificamos al usuario según su canal de origen
                const resumeNotice = "El asistente virtual se ha reactivado.";
                await dispatchToChannel(conversation, resumeNotice);

                await sendTelegramStaffNotification(
                    `✅ Bot reactivado para la conversación [${conversation.channel.toUpperCase()}] ID: ${conversation.id}`,
                );
            } else {
                await sendTelegramStaffNotification(
                    "⚠️ No hay conversaciones pausadas para reactivar.",
                );
            }

            return new Response("OK", { status: 200 });
        }

        // ==========================================================
        // 2. RESPUESTA DE AGENTE HUMANO (Reply en el grupo de staff)
        // ==========================================================
        if (tgMessage.reply_to_message) {
            const originalMessageId = tgMessage.reply_to_message.message_id;

            // Obtenemos la conversación genérica desde el mapping
            const conversation =
                await getConversationByTelegramMessageId(originalMessageId);

            if (conversation) {
                // Guardamos el mensaje emitido por el agente en la BD
                await saveAgentMessage({
                    conversationId: conversation.id,
                    content: text,
                    role: "agent",
                });

                // Despachamos la respuesta hacia el proveedor/canal correspondiente
                await dispatchToChannel(conversation, text);
            } else {
                await sendTelegramStaffNotification(
                    "⚠️ No se encontró la conversación asociada a este mensaje.",
                );
            }
        }

        return new Response("OK", { status: 200 });
    } catch (error) {
        console.error("Error en Webhook Telegram Staff:", error);
        return new Response("Error", { status: 500 });
    }
};

// ==========================================================
// 3. DESPACHADOR OMNICANAL DE MENSAJES
// ==========================================================

interface ConversationRecord {
    id: string;
    channel: "web" | "whatsapp" | "telegram" | "email";
    phone?: string | null;
    telegramChatId?: number | null;
    email?: string | null;
}

async function dispatchToChannel(
    conversation: ConversationRecord,
    text: string,
) {
    switch (conversation.channel) {
        case "whatsapp":
            if (conversation.phone) {
                await sendWhatsAppMessage(conversation.phone, text);
            }
            break;

        case "telegram":
            if (conversation.telegramChatId) {
                await sendTelegramClientMessage(
                    conversation.telegramChatId,
                    text,
                );
            }
            break;

        case "email":
            if (conversation.email) {
                await sendEmailMessage(
                    conversation.email,
                    "Respuesta a su consulta",
                    text,
                );
            }
            break;

        case "web":
            // En web no se envía API externa; el cliente consume el mensaje guardado mediante SSE / WebSockets / Polling.
            break;
    }
}

// ==========================================================
// 4. PROVEEDORES EXTERNOS DE ENVÍO
// ==========================================================

async function sendWhatsAppMessage(to: string, text: string) {
    await fetch(
        `https://graph.facebook.com/v19.0/${import.meta.env.WHATSAPP_PHONE_ID}/messages`,
        {
            method: "POST",
            headers: {
                Authorization: `Bearer ${import.meta.env.WHATSAPP_TOKEN}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                messaging_product: "whatsapp",
                recipient_type: "individual",
                to,
                type: "text",
                text: { body: text },
            }),
        },
    );
}

async function sendTelegramClientMessage(chatId: number, text: string) {
    await fetch(
        `https://api.telegram.org/bot${import.meta.env.TELEGRAM_BOT_TOKEN}/sendMessage`,
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                chat_id: chatId,
                text,
            }),
        },
    );
}

async function sendTelegramStaffNotification(text: string) {
    await fetch(
        `https://api.telegram.org/bot${import.meta.env.TELEGRAM_BOT_TOKEN}/sendMessage`,
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                chat_id: import.meta.env.TELEGRAM_CHAT_ID,
                text,
            }),
        },
    );
}

async function sendEmailMessage(to: string, subject: string, bodyText: string) {
    // Implementa tu proveedor preferido (Resend, Nodemailer, Postmark, etc.)
    if (!import.meta.env.RESEND_API_KEY) return;

    await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${import.meta.env.RESEND_API_KEY}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            from: "Soporte <soporte@tudominio.com>",
            to: [to],
            subject: subject,
            text: bodyText,
        }),
    });
}
