import { ChatModeEnum } from "@/enums/chat";
import type { LeadInput } from "@/schemas/leadSchema";
import { useChatStore } from "@/stores/chat";
import type { Locale } from "@/types/locale";
import { useTranslations } from "@/utils/i18n";
import { XIcon } from "lucide-react";
import { useMemo } from "react";
import ChatbotForm from "./ChatbotForm";
import LeadForm from "./LeadForm";
import MessageForm from "./MessageForm";

type ChatContentProps = {
    locale: Locale;
};

export default function ChatContent({ locale }: ChatContentProps) {
    const t = useTranslations(locale);
    const setIsOpen = useChatStore((state) => state.setIsOpen);
    const mode = useChatStore((state) => state.mode);

    const whatsappNumber = import.meta.env.PUBLIC_WHATSAPP_NUMBER || "";
    const defaultMessage =
        import.meta.env.PUBLIC_WHATSAPP_DEFAULT_MESSAGE ||
        "Hola, me gustaría recibir más información.";

    const hasWhatsApp = useMemo(
        () => Boolean(whatsappNumber),
        [whatsappNumber],
    );

    const handleClose = async () => {
        setIsOpen(false);
    };

    const handleWhatsAppRedirect = async () => {
        // if (!hasWhatsApp) return;
        // const payload: LeadInput = {
        //     channel: "whatsapp",
        //     name: "Cliente WhatsApp",
        //     email: "whatsapp@direct.contact",
        //     message: defaultMessage,
        //     detectedIntent: "whatsapp_redirect",
        // };
        // try {
        //     await fetch("/api/lead", {
        //         method: "POST",
        //         headers: { "Content-Type": "application/json" },
        //         body: JSON.stringify(payload),
        //     });
        //     addMessage(
        //         Message.create({
        //             id: generateUUID(),
        //             role: "user",
        //             content: "[Contacto WhatsApp] Solicitud de inicio de chat.",
        //             tokensUsed: null,
        //             conversationId: "",
        //         }),
        //     );
        //     addMessage(
        //         Message.create({
        //             id: generateUUID(),
        //             role: "assistant",
        //             content: "Te estamos redirigiendo a WhatsApp...",
        //             tokensUsed: null,
        //             conversationId: "",
        //         }),
        //     );
        // } catch (error) {
        //     console.warn("Error registrando lead WhatsApp:", error);
        // } finally {
        //     const encodedMsg = encodeURIComponent(defaultMessage);
        //     const cleanPhone = whatsappNumber.replace(/[^\d]/g, "");
        //     const waUrl = `https://wa.me/${cleanPhone}?text=${encodedMsg}`;
        //     window.open(waUrl, "_blank", "noopener,noreferrer");
        // }
    };

    const onLeadFormSubmit = async (data: LeadInput) => {
        // setSubmittingLead(true);
        // try {
        //     const response = await fetch("/api/lead", {
        //         method: "POST",
        //         headers: { "Content-Type": "application/json" },
        //         body: JSON.stringify({ ...data, channel: "email" }),
        //     });
        //     const result = await response.json();
        //     if (!response.ok || !result.success) {
        //         throw new Error(result.message || "Error al enviar la consulta.");
        //     }
        //     addMessage(
        //         Message.create({
        //             id: generateUUID(),
        //             role: "user",
        //             content: `[Mensaje] ${data.name} (${data.email}): ${data.message}`,
        //             tokensUsed: null,
        //             conversationId: "",
        //         }),
        //     );
        //     addMessage(
        //         Message.create({
        //             id: generateUUID(),
        //             role: "assistant",
        //             content: "¡Gracias por escribirnos! Hemos recibido tu información correctamente.",
        //             tokensUsed: null,
        //             conversationId: "",
        //         }),
        //     );
        //     reset();
        //     setMode("chat");
        // } catch (err: any) {
        //     alert(err.message || "No se pudo enviar la consulta. Intenta de nuevo.");
        // } finally {
        //     setSubmittingLead(false);
        // }
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

            {(() => {
                switch (mode) {
                    case ChatModeEnum.CHAT:
                        return <ChatbotForm locale={locale} />;
                    case ChatModeEnum.EMAIL:
                        return <LeadForm locale={locale} />;
                    default:
                        return <MessageForm locale={locale} />;
                }
            })()}
        </div>
    );
}
