import type { CreateLeadInput } from "@/actions/chatbot/createLead";
import { ChatModeEnum } from "@/enums/chat";
import { useChatStore } from "@/stores/chat";
import type { Locale } from "@/types/locale";
import { actions } from "astro:actions";
import { ArrowLeft } from "lucide-react";
import { useForm } from "react-hook-form";

type LeadFormProps = {
    locale: Locale;
};

export default function LeadForm({ locale }: LeadFormProps) {
    const setMode = useChatStore((state) => state.setMode);
    const mode = useChatStore((state) => state.mode);
    const loading = useChatStore((state) => state.loading);

    const defaultValues: CreateLeadInput = {
        name: "",
        email: "",
        phone: "",
        message: "",
        company: "",
        locale,
    };

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm({
        defaultValues,
    });

    const onLeadFormSubmit = async (data: CreateLeadInput) => {
        const res = await actions.chatbot.createLead(data);
    };

    return (
        <div className="flex-1 overflow-y-auto p-5 flex flex-col">
            <button
                onClick={() => setMode(ChatModeEnum.CHAT)}
                className="mb-4 inline-flex items-center text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
                <ArrowLeft className="mr-1 size-3.5" /> Volver al chat
            </button>

            <h4 className="text-sm font-semibold text-foreground mb-3">
                Formulario de Contacto por E-Mail
            </h4>

            <form
                onSubmit={handleSubmit(onLeadFormSubmit)}
                className="space-y-3 flex-1 flex flex-col"
            >
                <div>
                    <label
                        className="block text-xs font-medium text-muted-foreground"
                        htmlFor="name"
                    >
                        Nombre
                    </label>
                    <input
                        id="name"
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
                    <label
                        className="block text-xs font-medium text-muted-foreground"
                        htmlFor="email"
                    >
                        Email
                    </label>
                    <input
                        id="email"
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
                    <label
                        className="block text-xs font-medium text-muted-foreground"
                        htmlFor="phone"
                    >
                        Teléfono
                    </label>
                    <input
                        id="phone"
                        {...register("phone", {
                            required: "El teléfono es obligatorio.",
                            pattern: {
                                value: /^[0-9]+$/,
                                message: "Teléfono no válido.",
                            },
                        })}
                        type="tel"
                        placeholder="+57 300 000 0000"
                        className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-none"
                    />

                    {errors.phone && (
                        <p className="mt-1 text-[11px] text-rose-500">
                            {errors.phone.message}
                        </p>
                    )}
                </div>

                <div>
                    <label
                        className="block text-xs font-medium text-muted-foreground"
                        htmlFor="company"
                    >
                        Compañía
                    </label>

                    <input
                        id="company"
                        {...register("company")}
                        type="text"
                        placeholder="Tu Compañía"
                        className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-none"
                    />

                    {errors.company && (
                        <p className="mt-1 text-[11px] text-rose-500">
                            {errors.company.message}
                        </p>
                    )}
                </div>

                <div>
                    <label
                        className="block text-xs font-medium text-muted-foreground"
                        htmlFor="message"
                    >
                        Mensaje
                    </label>

                    <textarea
                        id="message"
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
                        Enviar
                    </button>
                </div>
            </form>
        </div>
    );
}
