import { ChatModeEnum } from "@/enums/chat";
import { useChatStore } from "@/stores/chat";
import type { Locale } from "@/types/locale";
import { useTranslations } from "@/utils/i18n";
import { XIcon } from "lucide-react";
import ChatbotForm from "./ChatbotForm";
import LeadForm from "./LeadForm";

type ChatContentProps = {
    locale: Locale;
};

export default function ChatContent({ locale }: ChatContentProps) {
    const t = useTranslations(locale);
    const setIsOpen = useChatStore((state) => state.setIsOpen);
    const mode = useChatStore((state) => state.mode);

    const handleClose = async () => {
        setIsOpen(false);
    };

    return (
        <div className="w-80 md:w-88 h-120 bg-background border border-border/50 rounded-2xl shadow-2xl flex flex-col overflow-hidden ring-1 ring-black/5 dark:ring-white/5">
            <div className="bg-primary text-primary-foreground px-5 py-3 flex items-center justify-between shrink-0 shadow-sm border-b border-white/10 relative overflow-hidden">
                <div className="absolute inset-0 bg-white/5 pointer-events-none" />
                <div className="flex items-center gap-3 relative z-10">
                    <div className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                    </div>
                    <span className="font-bold text-sm tracking-wide">
                        {t("chatbot.title")}
                    </span>
                </div>
                <button
                    onClick={handleClose}
                    className="text-primary-foreground/80 hover:text-primary-foreground hover:bg-white/10 p-1.5 rounded-full transition-all cursor-pointer relative z-10"
                    aria-label={t("chatbot.close")}
                >
                    <XIcon className="size-5" />
                </button>
            </div>

            {mode === ChatModeEnum.CHAT ? (
                <ChatbotForm locale={locale} />
            ) : (
                <LeadForm locale={locale} />
            )}
        </div>
    );
}
