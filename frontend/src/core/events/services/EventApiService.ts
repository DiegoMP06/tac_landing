import { API_URL } from "@/consts/api";
import type { HttpAdapter } from "@/core/shared/interfaces/HttpAdapter";
import type { LoggerAdapter } from "@/core/shared/interfaces/LoggerAdapter";
import { ListEventsSchema } from "@/schemas/events";
import type { Brand } from "@/types";
import type { Event } from "@/types/events";

type EventApiArgs = {
    http: HttpAdapter;
    logger: LoggerAdapter;
};

type GetEventArgs = {
    slug: string;
    brand: Brand;
    featured?: boolean;
    limit?: number;
};

export class EventApiService {
    private readonly http: HttpAdapter;
    private readonly logger: LoggerAdapter;

    constructor({ http, logger }: EventApiArgs) {
        this.http = http;
        this.logger = logger;
    }

    async getEvent({
        slug,
        brand,
    }: Pick<GetEventArgs, "brand" | "slug">): Promise<Event | null> {
        const fullUrl = `${API_URL[brand]}/events?slug=${encodeURIComponent(slug)}`;

        const data = await this.http.get<unknown>(fullUrl);

        if (data.status === 404 || data.status === 500) return null;

        const result = ListEventsSchema.safeParse(data.data);

        if (!result.success) {
            this.logger.error(`Zod Validation Error: ${result.error.message}`);
            return null;
        }

        if (result.data.length === 0) return null;

        return result.data[0];
    }

    async getAllEvents({
        brand,
        featured,
        limit,
    }: Pick<GetEventArgs, "brand" | "featured" | "limit">): Promise<Event[]> {
        const fullUrl = `${API_URL[brand]}/events`;
        const params: Record<string, string> = {};
        if (featured) params.featured = String(Number(featured));
        if (limit) params.limit = String(limit);

        const data = await this.http.get<unknown>(fullUrl, { params });

        if (data.status === 404 || data.status === 500) return [];

        const result = ListEventsSchema.safeParse(data.data);

        if (!result.success) {
            this.logger.error(`Zod Validation Error: ${result.error.message}`);
            return [];
        }

        return result.data;
    }
}
