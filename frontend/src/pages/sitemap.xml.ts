import type { APIRoute } from "astro";
import { getAbsoluteUrl, SUPPORTED_LOCALES } from "@/config/seo";
import { HttpAdapterImpl } from "@/core/shared/adapters/HttpAdapterImpl";
import { LoggerAdapterImpl } from "@/core/shared/adapters/LoggerAdapterImpl";
import { PostApiService } from "@/core/blog/services/PostApiService";
import { EventApiService } from "@/core/events/services/EventApiService";
import { ProgramApiService } from "@/core/programs/services/ProgramApiService";
import { BrandsEnum, SubBrands } from "@/enums";
import type { Locale } from "@/types/locale";

interface SitemapItem {
    path: string; // e.g. "/about", "/acu/events", "/blog/my-post"
    lastmod?: string;
}

export const GET: APIRoute = async () => {
    const items: SitemapItem[] = [
        { path: "" },
        { path: "/about" },
        { path: "/contact" },
        { path: "/blog" },
    ];

    // Add sub-brand pages
    for (const brand of SubBrands) {
        items.push({ path: `/${brand}` });
        items.push({ path: `/${brand}/about` });
        items.push({ path: `/${brand}/events` });
        items.push({ path: `/${brand}/programs` });
    }

    // Try fetching dynamic posts, events, and programs through existing API services
    try {
        const http = new HttpAdapterImpl();
        const logger = new LoggerAdapterImpl();

        // 1. Blog posts
        const postService = new PostApiService({ http, logger });
        const posts = await postService.getAllPosts({ brand: BrandsEnum.DEFAULT });
        for (const post of posts) {
            if (post?.slug) {
                const dateVal = post.modified_gmt || post.date_gmt;
                items.push({
                    path: `/blog/${post.slug}`,
                    lastmod: typeof dateVal === "string" ? dateVal : undefined,
                });
            }
        }

        // 2. Events across brands
        const eventService = new EventApiService({ http, logger });
        for (const brand of SubBrands) {
            const events = await eventService.getAllEvents({ brand });
            for (const ev of events) {
                if (ev?.slug) {
                    const dateVal = ev.modified_gmt || ev.date_gmt;
                    items.push({
                        path: `/${brand}/events/${ev.slug}`,
                        lastmod: typeof dateVal === "string" ? dateVal : undefined,
                    });
                }
            }
        }

        // 3. Programs across brands
        const programService = new ProgramApiService({ http, logger });
        for (const brand of SubBrands) {
            const programs = await programService.getAllPrograms({ brand });
            for (const pr of programs) {
                if (pr?.slug) {
                    const dateVal = pr.modified_gmt || pr.date_gmt;
                    items.push({
                        path: `/${brand}/programs/${pr.slug}`,
                        lastmod: typeof dateVal === "string" ? dateVal : undefined,
                    });
                }
            }
        }
    } catch {
        // Fallback gracefully to static routes if API service is temporarily unreachable
    }

    // Build the XML urlset
    const urlElements: string[] = [];

    for (const item of items) {
        const cleanPath = item.path.startsWith("/") ? item.path : `/${item.path}`;

        for (const loc of SUPPORTED_LOCALES) {
            const locUrl = getAbsoluteUrl(`/${loc}${cleanPath === "/" ? "" : cleanPath}`);

            const alternates = SUPPORTED_LOCALES.map((altLoc) => {
                const altUrl = getAbsoluteUrl(`/${altLoc}${cleanPath === "/" ? "" : cleanPath}`);
                return `    <xhtml:link rel="alternate" hreflang="${altLoc}" href="${altUrl}" />`;
            });

            const xDefaultUrl = getAbsoluteUrl(`/es${cleanPath === "/" ? "" : cleanPath}`);
            alternates.push(`    <xhtml:link rel="alternate" hreflang="x-default" href="${xDefaultUrl}" />`);

            const lastmodTag = item.lastmod
                ? `\n    <lastmod>${new Date(item.lastmod).toISOString()}</lastmod>`
                : "";

            urlElements.push(`  <url>
    <loc>${locUrl}</loc>${lastmodTag}
${alternates.join("\n")}
  </url>`);
        }
    }

    const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urlElements.join("\n")}
</urlset>`;

    return new Response(sitemapXml, {
        headers: {
            "Content-Type": "application/xml; charset=utf-8",
            "Cache-Control": "public, max-age=3600, s-maxage=3600",
        },
    });
};
