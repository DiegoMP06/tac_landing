import { ChatModeEnum } from "@/enums/chat";
import type { LeadInput } from "@/schemas/leadSchema";
import { useChatStore } from "@/stores/chat";
import type { Locale } from "@/types/locale";
import { ArrowLeft, Loader2, Send } from "lucide-react";
import { useForm } from "react-hook-form";

type MessageFormProps = {
    locale: Locale;
};

export default function MessageForm({ locale }: MessageFormProps) {
    const setMode = useChatStore((state) => state.setMode);
    const mode = useChatStore((state) => state.mode);
    const loading = useChatStore((state) => state.loading);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<LeadInput>({
        defaultValues: {
            channel: "email",
            name: "",
            email: "",
            phone: "",
            message: "",
            detectedIntent: "landing_chatbot_contact",
        },
    });

    const MessageFormSubmit = () => {};

    return (
        <div className="flex-1 overflow-y-auto p-5 flex flex-col">
            <button
                onClick={() => setMode(ChatModeEnum.CHAT)}
                className="mb-4 inline-flex items-center text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
                <ArrowLeft className="mr-1 size-3.5" /> Volver al chat
            </button>

            <h4 className="text-sm font-semibold text-foreground mb-3">
                Formulario de Contacto por{" "}
                {ChatModeEnum.EMAIL === mode ? "E-Mail" : "WhatsApp"}
            </h4>

            <form
                onSubmit={handleSubmit(MessageFormSubmit)}
                className="space-y-3 flex-1 flex flex-col"
            >
                <div>
                    <label className="block text-xs font-medium text-muted-foreground">
                        Nombre
                    </label>
                    <input
                        {...register("name", {
                            required: "El nombre es obligatorio.",
                            minLength: {
                                value: 2,
                                message: "Mínimo 2 caracteres.",
                            },
                        })}
                        type="text"
                        placeholder="Tu nombre"
                        className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-none"
                    />
                    {errors.name && (
                        <p className="mt-1 text-[11px] text-rose-500">
                            {errors.name.message}
                        </p>
                    )}
                </div>

                <div>
                    <label className="block text-xs font-medium text-muted-foreground">
                        Email
                    </label>
                    <input
                        {...register("email", {
                            required: "El email es obligatorio.",
                            pattern: {
                                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                message: "Email no válido.",
                            },
                        })}
                        type="email"
                        placeholder="tu@email.com"
                        className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-none"
                    />

                    {errors.email && (
                        <p className="mt-1 text-[11px] text-rose-500">
                            {errors.email.message}
                        </p>
                    )}
                </div>

                <div>
                    <label className="block text-xs font-medium text-muted-foreground">
                        Mensaje
                    </label>
                    <textarea
                        {...register("message", {
                            required: "El mensaje es obligatorio.",
                            minLength: {
                                value: 5,
                                message: "Mínimo 5 caracteres.",
                            },
                        })}
                        rows={3}
                        placeholder="¿En qué te ayudamos?"
                        className="mt-1 w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-none"
                    />
                    {errors.message && (
                        <p className="mt-1 text-[11px] text-rose-500">
                            {errors.message.message}
                        </p>
                    )}
                </div>

                <div className="pt-2 mt-auto">
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-medium text-primary-foreground shadow-md transition-all hover:opacity-90 disabled:opacity-50"
                    >
                        {loading ? (
                            <Loader2 className="size-4 animate-spin" />
                        ) : (
                            <>
                                <span>Enviar Consulta</span>
                                <Send className="size-3.5" />
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
