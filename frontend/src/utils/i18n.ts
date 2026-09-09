import type { Locale, UiKeys } from "@/types/locale";
import { ui } from "../i18n/ui";
import { DEFAULT_LOCALE } from "@/consts/locale";
import { LocalesEnum } from "@/enums/locale";

export function useTranslations(locale: Locale) {
    return function t(path: UiKeys): string {
        const currentLocale = ui[locale] ? locale : DEFAULT_LOCALE;

        const getNestedValue = (
            obj: any,
            pathString: string,
        ): string | undefined => {
            return pathString.split(".").reduce((current, key) => {
                return current && current[key] !== undefined
                    ? current[key]
                    : undefined;
            }, obj);
        };

        let translated = getNestedValue(ui[currentLocale], path);

        if (!translated && currentLocale !== DEFAULT_LOCALE) {
            translated = getNestedValue(ui[DEFAULT_LOCALE], path);
        }

        return translated || path;
    };
}

export function useLocalePath(currentUrl: URL, request?: Request) {
    const segments = currentUrl.pathname.split("/").filter(Boolean);
    const SUPPORTED_LOCALES = Object.values(LocalesEnum);
    
    let locale = SUPPORTED_LOCALES.includes(segments[0] as Locale)
        ? (segments[0] as Locale)
        : null;

    if (!locale && request) {
        const cookie = request.headers.get("cookie") ?? "";
        const localeCookie = cookie
            .split(";")
            .find((c) => c.trim().startsWith("locale="))
            ?.split("=")[1]
            ?.trim();
        if (
            localeCookie &&
            SUPPORTED_LOCALES.includes(localeCookie as Locale)
        ) {
            locale = localeCookie as Locale;
        }
    }

    locale = locale ?? DEFAULT_LOCALE;

    return {
        locale,
        localePath: (path: string) =>
            `/${locale}${path.startsWith("/") ? path : `/${path}`}`,
    };
}
