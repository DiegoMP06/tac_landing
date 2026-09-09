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
            urlObj.searchParams.set(key, value);
        }

        return urlObj.toString();
    }

    async get<T>(
        url: string,
        config?: RequestConfig,
    ): Promise<HttpResponse<T>> {
        const response = await fetch(this.formatURL(url, config?.params), {
            method: "GET",
            headers: config?.headers,
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
        const response = await fetch(this.formatURL(url, config?.params), {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...config?.headers,
            },
            body: JSON.stringify(data),
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
        const response = await fetch(this.formatURL(url, config?.params), {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                ...config?.headers,
            },
            body: JSON.stringify(data),
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
            headers: config?.headers,
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
