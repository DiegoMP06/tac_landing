export type LeadArgs = {
    id: string;
    name: string;
    email: string;
    phone: string;
    company: string | null;
    type: string;
    status: string;
    customData: unknown | null;
    conversationId: string;
};

export type DraftLead = Pick<
    LeadArgs,
    "name" | "email" | "phone" | "company" | "customData" | "type"
>;

export class Lead {
    public id: string;
    public name: string;
    public email: string;
    public phone: string;
    public company: string | null;
    public status: string;
    public type: string;
    public customData: unknown | null;
    public conversationId: string;

    public static create(args: LeadArgs): Lead {
        return new Lead(args);
    }

    constructor({
        id,
        name,
        email,
        phone,
        company,
        status,
        customData,
        conversationId,
        type,
    }: LeadArgs) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.phone = phone;
        this.type = type;
        this.company = company;
        this.status = status;
        this.customData = customData;
        this.conversationId = conversationId;
    }
}
