import { defineMiddleware } from "astro:middleware";
import { LocalesEnum } from "./enums/locale";
import type { Locale } from "./types/locale";
import { DEFAULT_LOCALE } from "./consts/locale";

const EXCLUDED_PATHS = [
    "/404",
    "/500",
    "/api",
    "/_image",
    "/favicon.ico",
    "/robots.txt",
    "/sitemap.xml",
    '/_actions',
];

const SUPPORTED_LOCALES = Object.values(LocalesEnum);

function detectLocale(request: Request): Locale {
    const cookieHeader = request.headers.get("cookie") ?? "";
    const localeCookie = cookieHeader
        .split(";")
        .find((c) => c.trim().startsWith("locale="))
        ?.split("=")[1]
        ?.trim();

    if (localeCookie && SUPPORTED_LOCALES.includes(localeCookie as Locale)) {
        return localeCookie as Locale;
    }

    const acceptLocaleuage = request.headers.get("accept-language") ?? "";
    const browserLocale = acceptLocaleuage
        .split(",")[0]
        ?.split("-")[0]
        ?.toLowerCase();

    if (browserLocale && SUPPORTED_LOCALES.includes(browserLocale as Locale)) {
        return browserLocale as Locale;
    }

    return DEFAULT_LOCALE;
}

export const onRequest = defineMiddleware(
    ({ url, request, redirect }, next) => {
        const pathname = url.pathname;

        const isExcluded = EXCLUDED_PATHS.some(
            (p) => pathname === p || pathname.startsWith(`${p}/`),
        );

        if (isExcluded) return next();

        const segments = pathname.split("/").filter(Boolean);
        const firstSegment = segments[0];
        const hasLocale = SUPPORTED_LOCALES.includes(firstSegment as Locale);

        if (!hasLocale) {
            const locale = detectLocale(request);
            return redirect(`/${locale}${pathname}`);
        }

        return next();
    },
);
