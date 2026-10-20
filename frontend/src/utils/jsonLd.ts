import { getAbsoluteUrl, SITE_URL } from "@/config/seo";
import type { Locale } from "@/types/locale";

export function buildOrganizationSchema(siteName: string, description: string) {
    return {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": siteName,
        "url": SITE_URL,
        "logo": getAbsoluteUrl("/ac.svg"),
        "description": description,
    };
}

export function buildWebSiteSchema(siteName: string, locale: Locale) {
    return {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": siteName,
        "url": getAbsoluteUrl(`/${locale}`),
        "inLanguage": locale,
    };
}

export function buildWebPageSchema({
    title,
    description,
    url,
    locale,
}: {
    title: string;
    description: string;
    url: string;
    locale: Locale;
}) {
    return {
        "@context": "https://schema.org",
        "@type": "WebPage",
        "name": title,
        "description": description,
        "url": url,
        "inLanguage": locale,
    };
}

export function buildBreadcrumbSchema(
    items: Array<{ name: string; url: string }>,
) {
    return {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": items.map((item, index) => ({
            "@type": "ListItem",
            "position": index + 1,
            "name": item.name,
            "item": item.url.startsWith("http") ? item.url : getAbsoluteUrl(item.url),
        })),
    };
}

export function buildArticleSchema({
    title,
    description,
    image,
    url,
    publishedTime,
    modifiedTime,
    locale,
    authorName,
}: {
    title: string;
    description: string;
    image?: string;
    url: string;
    publishedTime?: string;
    modifiedTime?: string;
    locale: Locale;
    authorName?: string;
}) {
    return {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "headline": title,
        "description": description,
        ...(image ? { "image": image.startsWith("http") ? image : getAbsoluteUrl(image) } : {}),
        "url": url,
        ...(publishedTime ? { "datePublished": publishedTime } : {}),
        ...(modifiedTime ? { "dateModified": modifiedTime } : {}),
        "inLanguage": locale,
        "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": url,
        },
        "publisher": {
            "@type": "Organization",
            "name": "The Americas Conference",
            "logo": {
                "@type": "ImageObject",
                "url": getAbsoluteUrl("/ac.svg"),
            },
        },
        ...(authorName
            ? {
                  "author": {
                      "@type": "Person",
                      "name": authorName,
                  },
              }
            : {
                  "author": {
                      "@type": "Organization",
                      "name": "The Americas Conference",
                  },
              }),
    };
}

export function buildEventSchema({
    name,
    description,
    startDate,
    endDate,
    url,
    image,
    locationName,
    isOnline,
}: {
    name: string;
    description: string;
    startDate?: string;
    endDate?: string;
    url: string;
    image?: string;
    locationName?: string;
    isOnline?: boolean;
}) {
    return {
        "@context": "https://schema.org",
        "@type": "Event",
        "name": name,
        "description": description,
        "url": url,
        ...(startDate ? { "startDate": startDate } : {}),
        ...(endDate ? { "endDate": endDate } : {}),
        "eventStatus": "https://schema.org/EventScheduled",
        "eventAttendanceMode": isOnline
            ? "https://schema.org/OnlineEventAttendanceMode"
            : "https://schema.org/OfflineEventAttendanceMode",
        ...(image ? { "image": image.startsWith("http") ? image : getAbsoluteUrl(image) } : {}),
        ...(locationName
            ? {
                  "location": {
                      "@type": "Place",
                      "name": locationName,
                  },
              }
            : {}),
    };
}
