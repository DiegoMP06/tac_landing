export interface LoggerAdapter {
    info(message: string, data?: unknown): void;
    error(message: string, error?: Error): void;
    warn(message: string, data?: unknown): void;
    debug(message: string, data?: unknown): void;
    log(
        level: "debug" | "info" | "warn" | "error",
        message: string,
        data?: unknown,
    ): void;
}
