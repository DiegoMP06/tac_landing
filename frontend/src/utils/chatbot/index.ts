import { LOCALE_NAMES } from "@/consts";
import {  SYSTEM_PROMPT } from "@/consts/chatbot";
import type { Locale } from "@/types/locale";

export const buildSystemPrompt = (context: string, locale: Locale): string => {
    const localeName = LOCALE_NAMES[locale];
    return SYSTEM_PROMPT.replaceAll("{{ locale }}", localeName).replaceAll(
        "{{ context }}",
        context,
    );
};
