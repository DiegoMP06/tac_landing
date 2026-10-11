import type { Locale } from "@/types/locale";

export const formatDateToUser = (date: string, locale: Locale) => {
    const dateObj = new Date(date);
    const options: Intl.DateTimeFormatOptions = {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    };

    return dateObj.toLocaleDateString(locale, options);
};
