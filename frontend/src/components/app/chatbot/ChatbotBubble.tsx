import { useChatStore } from "@/stores/chat";
import type { Locale } from "@/types/locale";
import { useTranslations } from "@/utils/i18n";
import { MessageCircle, XIcon } from "lucide-react";

type ChatbotBubbleProps = {
    locale: Locale;
};

export default function ChatbotBubble({ locale }: ChatbotBubbleProps) {
    const t = useTranslations(locale);

    const open = useChatStore((state) => state.open);
    const setIsOpen = useChatStore((state) => state.setIsOpen);

    return (
        <button
            onClick={() => setIsOpen(!open)}
            className="group relative size-12 rounded-full shadow-lg flex items-center justify-center text-2xl cursor-pointer hover:scale-110 active:scale-95 transition-all duration-300 bg-primary text-primary-foreground border border-white/10 overflow-hidden"
            aria-label={open ? t("chatbot.close") : t("chatbot.open")}
        >
            <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative z-10 transition-transform duration-300">
                {open ? (
                    <XIcon className="size-6" />
                ) : (
                    <MessageCircle className="size-6" />
                )}
            </div>
        </button>
    );
}
