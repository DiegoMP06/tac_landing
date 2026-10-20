import { BrandsEnum } from "@/enums";
import type { Brand } from "@/types";
import type { Locale } from "@/types/locale";

export const DEFAULT_SITE_URL = "https://theamericasconference.com";

export const SITE_URL =
    process.env.PUBLIC_SITE_URL ||
    process.env.SITE_URL ||
    DEFAULT_SITE_URL;

export const DEFAULT_LOCALE: Locale = "es";
export const SUPPORTED_LOCALES: readonly Locale[] = ["es", "en", "pt"] as const;

export const OG_LOCALE_MAP: Record<Locale, string> = {
    es: "es_LA",
    en: "en_US",
    pt: "pt_BR",
};

export const BRAND_THEME_COLORS: Record<Brand, { light: string; dark: string }> = {
    [BrandsEnum.DEFAULT]: { light: "#1b5e34", dark: "#1c1917" },
    [BrandsEnum.ACU]: { light: "#0a1e48", dark: "#0d0c22" },
    [BrandsEnum.ACM]: { light: "#c81012", dark: "#1e0506" },
    [BrandsEnum.ACC]: { light: "#544b45", dark: "#191512" },
};

export function getAbsoluteUrl(path: string = "/"): string {
    const base = SITE_URL.endsWith("/") ? SITE_URL.slice(0, -1) : SITE_URL;
    const cleanPath = path.startsWith("/") ? path : `/${path}`;
    return `${base}${cleanPath}`;
}

export function getCleanPathname(pathname: string): string {
    const segments = pathname.split("/").filter(Boolean);
    if (segments.length > 0 && SUPPORTED_LOCALES.includes(segments[0] as Locale)) {
        segments.shift();
    }
    return segments.length > 0 ? `/${segments.join("/")}` : "";
}

export function getAlternateUrls(pathname: string): {
    alternates: Array<{ locale: Locale; url: string }>;
    xDefaultUrl: string;
} {
    const cleanPath = getCleanPathname(pathname);
    const alternates = SUPPORTED_LOCALES.map((loc) => ({
        locale: loc,
        url: getAbsoluteUrl(`/${loc}${cleanPath}`),
    }));

    const xDefaultUrl = getAbsoluteUrl(`/${DEFAULT_LOCALE}${cleanPath}`);

    return { alternates, xDefaultUrl };
}
