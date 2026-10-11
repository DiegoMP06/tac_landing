import type { Conversation } from "@/core/chatbot/entities/Conversation";
import { MessageRoleEnum } from "@/enums/chat";
import { useChatStore } from "@/stores/chat";
import type { Locale } from "@/types/locale";
import { useTranslations } from "@/utils/i18n";
import { useEffect, useRef } from "react";
import ChatbotBubble from "./ChatbotBubble";
import ChatContent from "./ChatContent";
import { generateUUID } from "@/utils/uuid";

type ChatbotProps = {
    locale: Locale;
    conversation: Conversation | null;
};

export default function Chatbot({ locale, conversation }: ChatbotProps) {
    const t = useTranslations(locale);
    const messages = useChatStore((state) => state.messages);
    const setMessages = useChatStore((state) => state.setMessages);
    const open = useChatStore((state) => state.open);

    const initializedRef = useRef<boolean>(false);

    useEffect(() => {
        if (initializedRef.current) return;

        if (conversation) {
            setMessages(
                conversation.messages.map((message) => ({
                    stored: true,
                    message,
                })),
            );
            initializedRef.current = true;
        } else if (messages.length === 0) {
            setMessages([
                {
                    stored: false,
                    message: {
                        id: generateUUID(),
                        content: t("chatbot.welcome"),
                        role: MessageRoleEnum.ASSISTANT,
                    },
                },
            ]);
            initializedRef.current = true;
        }
    }, [conversation, setMessages, t]);

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3 pointer-events-none font-sans">
            <div
                className={`pointer-events-auto transition-all duration-300 origin-bottom-right ${
                    open
                        ? "opacity-100 translate-y-0 scale-100"
                        : "opacity-0 translate-y-4 scale-95 pointer-events-none invisible"
                }`}
            >
                <ChatContent locale={locale} />
            </div>

            <div className="pointer-events-auto">
                <ChatbotBubble locale={locale} />
            </div>
        </div>
    );
}
