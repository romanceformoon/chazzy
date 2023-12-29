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
    CHAT = 93101
}
