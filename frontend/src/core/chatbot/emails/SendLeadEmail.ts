import { EmailBuilder } from "@/core/shared/builders/EmailBuilder";
import { Email } from "@/core/shared/interfaces/Email";
import type { DraftLead } from "../entities/Lead";

type SendLeadEmailArgs = Pick<
    DraftLead,
    "email" | "name" | "phone" | "company"
> & {
    content: string;
};

export class SendLeadEmail extends Email {
    private builder?: EmailBuilder;

    build({
        email,
        name,
        phone,
        company,
        content,
    }: SendLeadEmailArgs): SendLeadEmail {
        this.builder = new EmailBuilder({
            locale: this.locale,
            subject: "Nuevo Lead",
            previewText: "Nuevo lead recibido",
        })
            .addHeading("Nuevo Lead", 1)
            .addParagraph("Se ha recibido un nuevo lead")
            .addKeyValueList({
                Nombre: name,
                Correo: email,
                Telefono: phone,
                Empresa: company,
            })
            .addDivider()
            .addParagraph(content)
            .addDivider()
            .addParagraph(
                "Este es un correo automático, por favor no respondas.",
            );
            
        return this;
    }

    async send(): Promise<void> {
        if (!this.builder) {
            throw new Error("Email builder not built");
        }

        const email = this.builder.build();
        await this.connection.sendMail({
            from: this.from,
            to: this.to,
            subject: email.subject,
            html: email.html,
            text: email.text,
        });
    }
}
