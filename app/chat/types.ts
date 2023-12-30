export interface TextMessagePart {
    type: 'text';
    text: string;
}

export interface EmojiMessagePart {
    type: 'emoji';
    emojiKey: string;
}

export type MessagePart = TextMessagePart | EmojiMessagePart

export interface Chat {
    uid: string;
    time: number;
    userId: string;
    nickname: string;
    badges: string[];
    color: string;
    emojis: Record<string, string>;
    message: MessagePart[];
}

export enum ChatCmd {
    PING = 0,
    PONG = 10000,
    CONNECT = 100,
    CHAT = 93101,
    CHEESE_CHAT = 93102
}

export interface CheeseChat extends Chat {
    payAmount: number;
}

interface ClearSpecificMessage {
    type: "message";
    uid: string;
}

interface ClearUserMessages {
    type: "user";
    userId: string;
}

export type ClearMessage = ClearSpecificMessage | ClearUserMessages
