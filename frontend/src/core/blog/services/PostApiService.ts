import { API_URL } from "@/consts/api";
import type { HttpAdapter } from "@/core/shared/interfaces/HttpAdapter";
import type { LoggerAdapter } from "@/core/shared/interfaces/LoggerAdapter";
import { ListPostsSchema } from "@/schemas/blog";
import type { Brand } from "@/types";
import type { Post } from "@/types/blog";

type PostApiArgs = {
    http: HttpAdapter;
    logger: LoggerAdapter;
};

type GetPostArgs = {
    slug: string;
    brand: Brand;
};

export class PostApiService {
    private readonly http: HttpAdapter;
    private readonly logger: LoggerAdapter;

    constructor({ http, logger }: PostApiArgs) {
        this.http = http;
        this.logger = logger;
    }

    async getPost({
        slug,
        brand,
    }: Pick<GetPostArgs, "slug" | "brand">): Promise<Post | null> {
        const fullUrl = `${API_URL[brand]}/posts?slug=${encodeURIComponent(slug)}`;

        const data = await this.http.get<unknown>(fullUrl);

        if (data.status === 404 || data.status === 500) return null;

        const result = ListPostsSchema.safeParse(data.data);

        if (!result.success) {
            this.logger.error(`Zod Validation Error: ${result.error.message}`);
            return null;
        }

        if (result.data.length === 0) return null;

        return result.data[0];
    }

    async getAllPosts({ brand }: Pick<GetPostArgs, "brand">): Promise<Post[]> {
        const fullUrl = `${API_URL[brand]}/posts`;

        const data = await this.http.get<unknown>(fullUrl);

        if (data.status === 404 || data.status === 500) return [];

        const result = ListPostsSchema.safeParse(data.data);

        if (!result.success) {
            this.logger.error(`Zod Validation Error: ${result.error.message}`);
            return [];
        }

        return result.data;
    }
}
