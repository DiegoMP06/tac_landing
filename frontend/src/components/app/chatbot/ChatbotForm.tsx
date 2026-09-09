import { ChatModeEnum, MessageRoleEnum } from "@/enums/chat";
import { useChatStore } from "@/stores/chat";
import type { Locale } from "@/types/locale";
import { useTranslations } from "@/utils/i18n";
import { Mail, MessageCircle, SendHorizonal } from "lucide-react";
import { useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";
import MessageItem from "./MessageItem";
import { generateUUID } from "@/utils/uuid";
import type { StoreMessage } from "@/types/chat";

type ChatbotFormProps = {
    locale: Locale;
};

export default function ChatbotForm({ locale }: ChatbotFormProps) {
    const t = useTranslations(locale);
    const [currentMessage, setCurrentMessage] = useState("");
    const messages = useChatStore((state) => state.messages);
    const loading = useChatStore((state) => state.loading);
    const setIsOpen = useChatStore((state) => state.setIsOpen);
    const mode = useChatStore((state) => state.mode);
    const setMode = useChatStore((state) => state.setMode);
    const setIsLoading = useChatStore((state) => state.setIsLoading);
    const addMessage = useChatStore((state) => state.addMessage);
    const editMessage = useChatStore((state) => state.editMessage);

    const bottomRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    function handleChange(e: ChangeEvent<HTMLTextAreaElement>) {
        setCurrentMessage(e.target.value);
    }

    function handleKeyDown(e: React.KeyboardEvent) {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }

        if (e.key === "Escape") {
            e.preventDefault();
            setIsOpen(false);
        }
    }

    const handleSendMessage = async () => {
        if (currentMessage.trim().length === 0 || loading) return;

        const newUserMessage: StoreMessage = {
            stored: false,
            message: {
                id: generateUUID(),
                role: MessageRoleEnum.USER,
                content: currentMessage,
            },
        };

        const newAssistantMessage: StoreMessage = {
            stored: false,
            message: {
                id: generateUUID(),
                role: MessageRoleEnum.ASSISTANT,
                content: "",
            },
        };

        addMessage(newUserMessage);
        addMessage(newAssistantMessage);

        setCurrentMessage("");
        setIsLoading(true);

        try {
            const res = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message: currentMessage,
                    locale,
                }),
            });

            if (!res.ok || !res.body)
                throw new Error("An error occurred while getting the response");

            const reader = res.body.getReader();
            const decoder = new TextDecoder();

            let accumulatedText = "";

            while (true) {
                const { done, value } = await reader.read();

                if (done) break;

                const newContent = decoder.decode(value, {
                    stream: true,
                });

                accumulatedText += newContent;

                editMessage(newAssistantMessage.message.id, {
                    stored: false,
                    message: {
                        ...newAssistantMessage.message,
                        content: accumulatedText,
                    },
                });
            }
        } catch {
            editMessage(newAssistantMessage.message.id, {
                stored: false,
                message: {
                    ...newAssistantMessage.message,
                    content: t("chatbot.error"),
                },
            });
        } finally {
            setIsLoading(false);
            inputRef.current?.focus();
        }
    };

    const canWrite = useMemo(
        () => loading || currentMessage.trim().length === 0,
        [loading, currentMessage],
    );

    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, mode]);

    return (
        <>
            <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4 scroll-smooth">
                {messages.map((item, i) => (
                    <MessageItem item={item} key={i} />
                ))}

                <div className="flex items-center gap-2 pt-2 border-t border-border/30">
                    <button
                        onClick={() => setMode(ChatModeEnum.MESSAGE)}
                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl transition-all cursor-pointer shadow-sm active:scale-95"
                    >
                        <MessageCircle className="size-4" />
                        <span>Mensaje de Texto</span>
                    </button>

                    <button
                        onClick={() => setMode(ChatModeEnum.EMAIL)}
                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium border border-border bg-card hover:bg-accent rounded-xl transition-all cursor-pointer shadow-sm active:scale-95 text-foreground"
                    >
                        <Mail className="size-4 text-primary" />
                        <span>Contacto Email</span>
                    </button>
                </div>

                <div ref={bottomRef} />
            </div>
            <div className="p-4 bg-background/50 backdrop-blur-sm border-t border-border/50 shrink-0">
                <div className="relative flex items-center shadow-sm rounded-full bg-background border border-border/60 focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                    <textarea
                        ref={inputRef}
                        value={currentMessage}
                        onChange={handleChange}
                        onKeyDown={handleKeyDown}
                        placeholder={t("chatbot.placeholder")}
                        disabled={loading}
                        className="flex-1 bg-transparent text-foreground text-sm rounded-full pl-5 pr-14 py-3.5 outline-none placeholder:text-muted-foreground disabled:opacity-50 resize-none scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent"
                    />

                    <button
                        onClick={handleSendMessage}
                        disabled={canWrite}
                        className="absolute right-1.5 p-2 bg-primary text-primary-foreground rounded-full disabled:opacity-40 disabled:scale-100 cursor-pointer hover:scale-105 active:scale-95 transition-all flex items-center justify-center"
                        title={t("chatbot.send")}
                    >
                        <SendHorizonal className="size-4" />
                    </button>
                </div>
            </div>
        </>
    );
}
