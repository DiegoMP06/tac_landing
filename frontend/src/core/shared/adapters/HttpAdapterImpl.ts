import { HttpException } from "../exceptions/HttpException";
import {
    type HttpAdapter,
    type HttpResponse,
    type RequestConfig,
} from "../interfaces/HttpAdapter";

export class HttpAdapterImpl implements HttpAdapter {
    formatURL(url: string, params: RequestConfig["params"] = {}): string {
        const urlObj = new URL(url);

        for (const [key, value] of Object.entries(params)) {
            urlObj.searchParams.set(key, value as string);
        }

        return urlObj.toString();
    }

    async get<T>(
        url: string,
        config?: RequestConfig,
    ): Promise<HttpResponse<T>> {
        const response = await fetch(this.formatURL(url, config?.params), {
            method: "GET",
            headers: config?.headers as HeadersInit,
        });

        if (!response.ok) {
            throw HttpException.get(url, response.status);
        }

        return {
            data: (await response.json()) as T,
            status: response.status,
            statusText: response.statusText,
            headers: Object.fromEntries(response.headers.entries()),
        };
    }

    async post<T, D = unknown>(
        url: string,
        data?: D,
        config?: RequestConfig,
    ): Promise<HttpResponse<T>> {
        const isFormData = data instanceof FormData;
        const headers: Record<string, string> = {
            ...(config?.headers as Record<string, string>),
        };

        if (!isFormData) {
            headers["Content-Type"] =
                headers["Content-Type"] || "application/json";
        }

        const response = await fetch(this.formatURL(url, config?.params), {
            method: "POST",
            headers,
            body: isFormData ? data : JSON.stringify(data),
        });

        if (!response.ok) {
            throw HttpException.post(url, response.status);
        }

        return {
            data: (await response.json()) as T,
            status: response.status,
            statusText: response.statusText,
            headers: Object.fromEntries(response.headers.entries()),
        };
    }

    async put<T, D = unknown>(
        url: string,
        data?: D,
        config?: RequestConfig,
    ): Promise<HttpResponse<T>> {
        const isFormData = data instanceof FormData;
        const headers: Record<string, string> = {
            ...(config?.headers as Record<string, string>),
        };

        if (!isFormData) {
            headers["Content-Type"] =
                headers["Content-Type"] || "application/json";
        }

        const response = await fetch(this.formatURL(url, config?.params), {
            method: "PUT",
            headers,
            body: isFormData ? data : JSON.stringify(data),
        });

        if (!response.ok) {
            throw HttpException.put(url, response.status);
        }

        return {
            data: (await response.json()) as T,
            status: response.status,
            statusText: response.statusText,
            headers: Object.fromEntries(response.headers.entries()),
        };
    }

    async delete<T>(
        url: string,
        config?: RequestConfig,
    ): Promise<HttpResponse<T>> {
        const response = await fetch(this.formatURL(url, config?.params), {
            method: "DELETE",
            headers: config?.headers as HeadersInit,
        });

        if (!response.ok) {
            throw HttpException.delete(url, response.status);
        }

        return {
            data: (await response.json()) as T,
            status: response.status,
            statusText: response.statusText,
            headers: Object.fromEntries(response.headers.entries()),
        };
    }
}
