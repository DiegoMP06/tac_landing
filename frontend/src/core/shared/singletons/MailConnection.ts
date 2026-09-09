import {
    createTransport,
    type Transporter,
    type SendMailOptions,
} from "nodemailer";
import type SMTPTransport from "nodemailer/lib/smtp-transport";

export class MailConnection {
    private static instance: MailConnection;
    private transporter: Transporter<
        SMTPTransport.SentMessageInfo,
        SMTPTransport.Options
    >;

    private constructor() {
        const host = import.meta.env.SMTP_HOST || process.env.SMTP_HOST;
        const port = Number(
            import.meta.env.SMTP_PORT || process.env.SMTP_PORT || 587,
        );
        const user = import.meta.env.SMTP_USER || process.env.SMTP_USER;
        const pass = import.meta.env.SMTP_PASS || process.env.SMTP_PASS;

        if (!host || !user || !pass) {
            throw new Error(
                "Faltan credenciales SMTP en las variables de entorno.",
            );
        }

        this.transporter = createTransport({
            host,
            port,
            secure: port === 465,
            auth: { user, pass },
        });
    }

    public static getInstance(): MailConnection {
        if (!MailConnection.instance) {
            MailConnection.instance = new MailConnection();
        }
        return MailConnection.instance;
    }

    public async sendMail(options: SendMailOptions) {
        return await this.transporter.sendMail(options);
    }

    public close(): void {
        this.transporter.close();
    }
}
