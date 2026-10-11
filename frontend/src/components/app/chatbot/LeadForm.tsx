import { ChatModeEnum } from "@/enums/chat";
import { EMAIL_REGEX, PHONE_REGEX } from "@/regex";
import { useChatStore } from "@/stores/chat";
import type { SendLeadArgs } from "@/types/leads";
import type { Locale } from "@/types/locale";
import { useTranslations } from "@/utils/i18n";
import { actions } from "astro:actions";
import { ArrowLeft } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

type LeadFormProps = {
    locale: Locale;
};

export default function LeadForm({ locale }: LeadFormProps) {
    const setIsLoading = useChatStore((state) => state.setIsLoading);
    const setMode = useChatStore((state) => state.setMode);
    const loading = useChatStore((state) => state.loading);

    const t = useTranslations(locale);

    const defaultValues: SendLeadArgs = {
        name: "",
        email: "",
        company: "",
        phone: "",
        subject: "",
        message: "",
    };

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm({
        defaultValues,
    });

    const onLeadFormSubmit = async (data: SendLeadArgs) => {
        setIsLoading(true);
        const {
            data: { success },
        } = await actions.leads.sendLead(data);

        if (!success) {
            toast.error(t("sendEmail.error"));
            setIsLoading(false);
            return;
        }

        reset();
        toast.success(t("sendEmail.success"));
        setMode(ChatModeEnum.CHAT);
        setIsLoading(false);
    };

    return (
        <div className="flex-1 overflow-y-auto p-5 flex flex-col">
            <button
                onClick={() => setMode(ChatModeEnum.CHAT)}
                className="mb-4 inline-flex items-center text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
                <ArrowLeft className="mr-1 size-3.5" /> {t("sendEmail.back")}
            </button>

            <h4 className="text-sm font-semibold text-foreground mb-3">
                {t("sendEmail.title")}
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
                        {t("sendEmail.fields.name.label")}
                    </label>

                    <input
                        id="name"
                        {...register("name", {
                            required: t(
                                "sendEmail.fields.name.validation.required",
                            ),
                            minLength: {
                                value: 2,
                                message: t(
                                    "sendEmail.fields.name.validation.minLength",
                                ),
                            },
                            maxLength: {
                                value: 50,
                                message: t(
                                    "sendEmail.fields.name.validation.maxLength",
                                ),
                            },
                        })}
                        type="text"
                        placeholder={t("sendEmail.fields.name.placeholder")}
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
                        {t("sendEmail.fields.email.label")}
                    </label>

                    <input
                        id="email"
                        {...register("email", {
                            required: t(
                                "sendEmail.fields.email.validation.required",
                            ),
                            pattern: {
                                value: EMAIL_REGEX,
                                message: t(
                                    "sendEmail.fields.email.validation.email",
                                ),
                            },
                        })}
                        type="email"
                        placeholder={t("sendEmail.fields.email.placeholder")}
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
                        {t("sendEmail.fields.phone.label")}
                    </label>

                    <input
                        id="phone"
                        {...register("phone", {
                            required: t(
                                "sendEmail.fields.phone.validation.required",
                            ),
                            pattern: {
                                value: PHONE_REGEX,
                                message: t(
                                    "sendEmail.fields.phone.validation.pattern",
                                ),
                            },
                        })}
                        type="tel"
                        placeholder={t("sendEmail.fields.phone.placeholder")}
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
                        {t("sendEmail.fields.company.label")}
                    </label>

                    <input
                        id="company"
                        {...register("company")}
                        type="text"
                        placeholder={t("sendEmail.fields.company.placeholder")}
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
                        htmlFor="subject"
                    >
                        {t("sendEmail.fields.subject.label")}
                    </label>

                    <input
                        id="subject"
                        {...register("subject", {
                            required: t(
                                "sendEmail.fields.subject.validation.required",
                            ),
                            minLength: {
                                value: 2,
                                message: t(
                                    "sendEmail.fields.subject.validation.minLength",
                                ),
                            },
                            maxLength: {
                                value: 50,
                                message: t(
                                    "sendEmail.fields.subject.validation.maxLength",
                                ),
                            },
                        })}
                        type="text"
                        placeholder={t("sendEmail.fields.subject.placeholder")}
                        className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-none"
                    />

                    {errors.subject && (
                        <p className="mt-1 text-[11px] text-rose-500">
                            {errors.subject.message}
                        </p>
                    )}
                </div>

                <div>
                    <label
                        className="block text-xs font-medium text-muted-foreground"
                        htmlFor="message"
                    >
                        {t("sendEmail.fields.message.label")}
                    </label>

                    <textarea
                        id="message"
                        {...register("message", {
                            required: t(
                                "sendEmail.fields.message.validation.required",
                            ),
                            minLength: {
                                value: 5,
                                message: t(
                                    "sendEmail.fields.message.validation.minLength",
                                ),
                            },
                            maxLength: {
                                value: 500,
                                message: t(
                                    "sendEmail.fields.message.validation.maxLength",
                                ),
                            },
                        })}
                        rows={3}
                        placeholder={t("sendEmail.fields.message.placeholder")}
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
                        {t("sendEmail.fields.submit.label")}
                    </button>
                </div>
            </form>
        </div>
    );
}
