import { API_URL } from "@/consts/api";
import type { HttpAdapter } from "@/core/shared/interfaces/HttpAdapter";
import type { LoggerAdapter } from "@/core/shared/interfaces/LoggerAdapter";
import { ListProgramsSchema } from "@/schemas/programs";
import type { Brand } from "@/types";
import type { Program } from "@/types/programs";

type ProgramApiArgs = {
    http: HttpAdapter;
    logger: LoggerAdapter;
};

type GetProgramArgs = {
    slug: string;
    brand: Brand;
    featured?: boolean;
    limit?: number;
};

export class ProgramApiService {
    private readonly http: HttpAdapter;
    private readonly logger: LoggerAdapter;

    constructor({ http, logger }: ProgramApiArgs) {
        this.http = http;
        this.logger = logger;
    }

    async getProgram({
        slug,
        brand,
    }: Pick<GetProgramArgs, "brand" | "slug">): Promise<Program | null> {
        const fullUrl = `${API_URL[brand]}/programs?slug=${encodeURIComponent(slug)}`;

        const data = await this.http.get<unknown>(fullUrl);

        if (data.status === 404 || data.status === 500) return null;

        const result = ListProgramsSchema.safeParse(data.data);

        if (!result.success) {
            this.logger.error(`Zod Validation Error: ${result.error.message}`);
            return null;
        }

        if (result.data.length === 0) return null;

        return result.data[0];
    }

    async getAllPrograms({
        brand,
        featured,
        limit,
    }: Pick<GetProgramArgs, "brand" | "featured" | "limit">): Promise<
        Program[]
    > {
        const fullUrl = `${API_URL[brand]}/programs`;

        const params: Record<string, string> = {};
        if (featured) params.featured = String(Number(featured));
        if (limit) params.limit = String(limit);

        const data = await this.http.get<unknown>(fullUrl, { params });

        if (data.status === 404 || data.status === 500) return [];

        const result = ListProgramsSchema.safeParse(data.data);

        if (!result.success) {
            this.logger.error(`Zod Validation Error: ${result.error.message}`);
            return [];
        }

        return result.data;
    }
}
