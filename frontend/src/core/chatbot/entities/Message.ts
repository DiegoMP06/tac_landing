export type MessageArgs = {
    id: string;
    subject: string | null;
    role: string;
    content: string;
    tokensUsed: unknown;
    conversationId: string;
    createdAt?: Date;
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
    public createdAt?: Date;

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
        createdAt,
    }: MessageArgs) {
        this.id = id;
        this.role = role;
        this.content = content;
        this.subject = subject;
        this.tokensUsed = tokensUsed;
        this.conversationId = conversationId;
        this.createdAt = createdAt;
    }
}
