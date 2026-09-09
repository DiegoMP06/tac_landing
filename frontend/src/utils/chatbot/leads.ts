import { LOCALE_NAMES } from "@/consts";
import { SYSTEM_PROMPT } from "@/consts/leads";
import type { Locale } from "@/types/locale";

export const buildSystemPrompt = (locale: Locale): string => {
    const localeName = LOCALE_NAMES[locale];
    return SYSTEM_PROMPT.replaceAll("{{ locale }}", localeName);
};
1