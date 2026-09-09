export interface RequestConfig {
    headers?: Record<string, string>;
    params?: Record<string, string>;
}

export interface HttpResponse<T> {
    data: T;
    status: number;
    statusText: string;
    headers: Record<string, string>;
}

export abstract class HttpAdapter {
    abstract get<T>(
        url: string,
        config?: RequestConfig,
    ): Promise<HttpResponse<T>>;

    abstract post<T>(
        url: string,
        data?: any,
        config?: RequestConfig,
    ): Promise<HttpResponse<T>>;

    abstract put<T>(
        url: string,
        data?: any,
        config?: RequestConfig,
    ): Promise<HttpResponse<T>>;

    abstract delete<T>(
        url: string,
        config?: RequestConfig,
    ): Promise<HttpResponse<T>>;
}
