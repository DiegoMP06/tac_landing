import type { Locale } from "@/types/locale";
import type { EmailBuilder } from "../builders/EmailBuilder";
import { MailConnection } from "../singletons/MailConnection";

export type EmailArgs = {
    to?: string;
    from?: string;
    locale: Locale;
};

export abstract class Email {
    to?: string;
    from?: string;
    locale: Locale;
    connection: MailConnection;

    constructor({ to, from, locale }: EmailArgs) {
        this.to = to;
        this.from = from;
        this.locale = locale;
        this.connection = MailConnection.getInstance();
    }

    abstract send(): Promise<void>;
}
