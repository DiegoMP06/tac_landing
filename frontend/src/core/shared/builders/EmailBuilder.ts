import type { Locale } from "@/types/locale";

type EmailBuilderArgs = {
    locale: Locale;
    subject: string;
    previewText?: string;
};

export class EmailBuilder {
    private readonly locale: Locale;
    private subject: string;
    private previewText?: string;
    private htmlBlocks: string[] = [];
    private textBlocks: string[] = [];

    constructor({ locale, subject, previewText }: EmailBuilderArgs) {
        this.locale = locale;
        this.subject = subject;
        this.previewText = previewText;
    }

    private escapeHtml(text: string): string {
        return text
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    addHeading(text: string, level: 1 | 2 | 3 = 1): this {
        const escaped = this.escapeHtml(text);
        const sizes = { 1: "22px", 2: "18px", 3: "16px" };

        this.htmlBlocks.push(
            `<h${level} style="font-size: ${sizes[level]}; font-weight: bold; color: #111827; margin: 0 0 16px 0; font-family: Arial, sans-serif;">${escaped}</h${level}>`,
        );
        this.textBlocks.push(`${text.toUpperCase()}\n`);
        return this;
    }

    addParagraph(text: string): this {
        const escaped = this.escapeHtml(text);
        this.htmlBlocks.push(
            `<p style="margin: 0 0 16px 0; color: #374151; font-size: 15px; line-height: 1.6; font-family: Arial, sans-serif;">${escaped}</p>`,
        );
        this.textBlocks.push(`${text}\n`);
        return this;
    }

    addKeyValueList(data: Record<string, string | null | undefined>): this {
        const items = Object.entries(data).filter(
            ([_, val]) => val !== null && val !== undefined,
        );
        if (items.length === 0) return this;

        const htmlRows = items
            .map(
                ([key, val]) =>
                    `<tr>
                        <td style="padding: 6px 12px 6px 0; font-weight: bold; color: #4b5563; font-size: 14px; font-family: Arial, sans-serif; vertical-align: top;">${this.escapeHtml(key)}:</td>
                        <td style="padding: 6px 0; color: #111827; font-size: 14px; font-family: Arial, sans-serif;">${this.escapeHtml(String(val))}</td>
                    </tr>`,
            )
            .join("");

        this.htmlBlocks.push(
            `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 16px;">${htmlRows}</table>`,
        );

        items.forEach(([key, val]) => {
            this.textBlocks.push(`- ${key}: ${val}`);
        });
        this.textBlocks.push("");

        return this;
    }

    addButton(text: string, url: string): this {
        const escapedText = this.escapeHtml(text);
        const safeUrl = this.escapeHtml(url);

        this.htmlBlocks.push(
            `<div style="margin: 24px 0 16px 0;">
                <a href="${safeUrl}" target="_blank" style="background-color: #2563eb; color: #ffffff; padding: 12px 20px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block; font-size: 14px; font-family: Arial, sans-serif;">${escapedText}</a>
            </div>`,
        );
        this.textBlocks.push(`${text}: ${url}\n`);
        return this;
    }

    addDivider(): this {
        this.htmlBlocks.push(
            '<hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 24px 0;" />',
        );
        this.textBlocks.push("---\n");
        return this;
    }

    build() {
        const contentHtml = this.htmlBlocks.join("");
        const preview = this.previewText
            ? `<div style="display:none;font-size:1px;color:#333;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">${this.escapeHtml(this.previewText)}</div>`
            : "";

        const html = `
<!DOCTYPE html>
<html lang="${this.locale}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="background-color: #f3f4f6; margin: 0; padding: 20px; font-family: Arial, sans-serif;">
    ${preview}
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
        <tr>
            <td align="center">
                <table role="presentation" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 8px; padding: 32px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);" cellspacing="0" cellpadding="0" border="0">
                    <tr>
                        <td>
                            ${contentHtml}
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`.trim();

        return {
            subject: this.subject,
            html,
            text: this.textBlocks.join("\n").trim(),
        };
    }
}
