import { Message, type DraftMessage } from "./Message";

type ConversationArgs = {
    id: string;
    sessionToken: string;
    clientIp: string;
    userAgent: string | null;
    locale: string;
    status: string;
    createdAt?: Date;
    updatedAt?: Date;
    messages?: Message[];
};

export type DraftConversation = Pick<
    ConversationArgs,
    "sessionToken" | "clientIp" | "userAgent" | "locale"
> & {
    messages?: DraftMessage[];
};

export class Conversation {
    public id: string;
    public sessionToken: string;
    public clientIp: string;
    public userAgent: string | null;
    public locale: string;
    public status: string;
    public createdAt?: Date;
    public updatedAt?: Date;
    public messages: Message[];

    public static create(args: ConversationArgs): Conversation {
        return new Conversation(args);
    }

    constructor({
        id,
        sessionToken,
        clientIp,
        userAgent,
        locale,
        status,
        createdAt,
        updatedAt,
        messages,
    }: ConversationArgs) {
        this.id = id;
        this.sessionToken = sessionToken;
        this.clientIp = clientIp;
        this.userAgent = userAgent;
        this.locale = locale;
        this.status = status;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.messages = messages ?? [];
    }

    public addMessage(message: Message): void {
        this.messages.push(message);
    }
}
