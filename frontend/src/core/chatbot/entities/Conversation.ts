import type { DraftLead, Lead } from "./Lead";
import { Message, type DraftMessage } from "./Message";

type ConversationArgs = {
    id: string;
    sessionToken: string;
    clientIp: string;
    userAgent: string | null;
    locale: string;
    status: string;
    messages?: Message[];
    leads?: Lead[];
};

export type DraftConversation = Pick<
    ConversationArgs,
    "sessionToken" | "clientIp" | "userAgent" | "locale"
> & {
    messages?: DraftMessage[];
    leads?: DraftLead[];
};

export class Conversation {
    public id: string;
    public sessionToken: string;
    public clientIp: string;
    public userAgent: string | null;
    public locale: string;
    public status: string;
    public messages: Message[];
    public leads: Lead[];

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
        messages,
        leads,
    }: ConversationArgs) {
        this.id = id;
        this.sessionToken = sessionToken;
        this.clientIp = clientIp;
        this.userAgent = userAgent;
        this.locale = locale;
        this.status = status;
        this.messages = messages ?? [];
        this.leads = leads ?? [];
    }

    addMessage(message: Message): void {
        this.messages.push(message);
    }

    addLead(lead: Lead): void {
        this.leads.push(lead);
    }
}
