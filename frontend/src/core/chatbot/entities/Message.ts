export type MessageArgs = {
    id: string;
    role: string;
    content: string;
    subject: string | null;
    tokensUsed: unknown;
    conversationId: string;
    externalMessageId: string | null;
};

export type DraftMessage = Pick<MessageArgs, "role" | "content"> & {
    tokensUsed?: unknown;
};

export class Message {
    public id: string;
    public role: string;
    public content: string;
    public subject: string | null;
    public tokensUsed: unknown;
    public conversationId: string;
    public externalMessageId: string | null;

    public static create(args: MessageArgs): Message {
        return new Message(args);
    }

    constructor({
        id,
        role,
        content,
        subject,
        tokensUsed,
        conversationId,
        externalMessageId,
    }: MessageArgs) {
        this.id = id;
        this.role = role;
        this.content = content;
        this.subject = subject;
        this.tokensUsed = tokensUsed;
        this.conversationId = conversationId;
        this.externalMessageId = externalMessageId;
    }
}
