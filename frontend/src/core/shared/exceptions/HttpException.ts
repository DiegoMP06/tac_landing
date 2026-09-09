export class HttpException extends Error {
    status: number;

    constructor(message: string, status?: number) {
        super(message);
        this.status = status || 500;
    }

    static get(url: string, status: number): HttpException {
        return new HttpException(
            `Ha ocurrido un error al obtener los datos de: ${url}`,
            status,
        );
    }

    static post(url: string, status: number): HttpException {
        return new HttpException(
            `Ha ocurrido un error al enviar los datos a: ${url}`,
            status,
        );
    }

    static put(url: string, status: number): HttpException {
        return new HttpException(
            `Ha ocurrido un error al actualizar los datos de: ${url}`,
            status,
        );
    }

    static delete(url: string, status: number): HttpException {
        return new HttpException(
            `Ha ocurrido un error al eliminar los datos de: ${url}`,
            status,
        );
    }
}
