import type { Brand } from "@/types";

const ENV_API_URL = import.meta.env?.API_URL || process.env.API_URL || "";

export const API_URL: Record<Brand, string> = {
    acu: `${ENV_API_URL}/acu/wp-json/wp/v2`,
    acc: `${ENV_API_URL}/acc/wp-json/wp/v2`,
    acm: `${ENV_API_URL}/acm/wp-json/wp/v2`,
    default: `${ENV_API_URL}/wp/wp-json/wp/v2`
} as const;
