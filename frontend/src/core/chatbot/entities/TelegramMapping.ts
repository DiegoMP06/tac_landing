export type TelegramMappingArgs = {
    id: string;
    staffTelegramMessageId: number;
    conversationId: string;
};

export class TelegramMapping {
    public id: string;
    public staffTelegramMessageId: number;
    public conversationId: string;

    public static create(args: TelegramMappingArgs): TelegramMapping {
        return new TelegramMapping(args);
    }

    constructor({
        id,
        staffTelegramMessageId,
        conversationId,
    }: TelegramMappingArgs) {
        this.id = id;
        this.staffTelegramMessageId = staffTelegramMessageId;
        this.conversationId = conversationId;
    }
}
