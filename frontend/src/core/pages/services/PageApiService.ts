import { API_URL } from "@/consts/api";
import type { HttpAdapter } from "@/core/shared/interfaces/HttpAdapter";
import type { LoggerAdapter } from "@/core/shared/interfaces/LoggerAdapter";
import { PageTypeEnum } from "@/enums/pages";
import type { Brand } from "@/types";
import type { PageType, PageTypeMap } from "@/types/pages";
import { PageDict } from "@/utils/translation/page";

type PageApiArgs = {
    http: HttpAdapter;
    logger: LoggerAdapter;
};

export class PageApiService {
    private readonly http: HttpAdapter;
    private readonly logger: LoggerAdapter;

    constructor({ http, logger }: PageApiArgs) {
        this.http = http;
        this.logger = logger;
    }

    async getPage<T extends PageType = typeof PageTypeEnum.DEFAULT>(
        entityId: string,
        brand: Brand,
        type: T = PageTypeEnum.DEFAULT as T,
    ): Promise<PageTypeMap[T] | null> {
        const fullUrl = `${API_URL[brand]}/pages/${encodeURIComponent(entityId)}`;
        const data = await this.http.get<unknown>(fullUrl);

        if (data.status === 404 || data.status === 500) return null;

        const { schema } = PageDict[type];
        const result = schema.safeParse(data.data);

        if (!result.success) {
            this.logger.error(
                `Zod Validation Error (${type} page): ${result.error.message}`,
            );
            return null;
        }

        return result.data as PageTypeMap[T];
    }
}
