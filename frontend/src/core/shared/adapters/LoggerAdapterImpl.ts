import pino, { type Logger } from "pino";
import type { LoggerAdapter } from "../interfaces/LoggerAdapter";

export class LoggerAdapterImpl implements LoggerAdapter {
    private readonly logger: Logger = pino({
        level:
            process.env.LOG_LEVEL ||
            (process.env.NODE_ENV !== "production" ? "debug" : "info"),
    });

    debug(message: string, data?: unknown) {
        this.log("debug", message, data);
    }

    info(message: string, data?: unknown) {
        this.log("info", message, data);
    }

    warn(message: string, data?: unknown) {
        this.log("warn", message, data);
    }

    error(message: string, error?: unknown) {
        this.log("error", message, error);
    }

    log(
        level: "debug" | "info" | "warn" | "error",
        message: string,
        data?: unknown,
    ) {
        if (data) {
            this.logger[level]({ data }, message);
        } else {
            this.logger[level](message);
        }
    }
}
