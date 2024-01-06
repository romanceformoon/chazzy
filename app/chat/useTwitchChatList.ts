import {suggestAAColorVariant} from "accessible-colors"
import {useCallback, useEffect, useRef, useState} from "react"
import {backgroundColor, twitchNicknameColors} from "./constants"
import parseTwitchMessage from "./parseTwitchMessage"
import {Chat, ClearMessage, EmojiMessagePart, MessagePart} from "./types"

const INTERNAL_MAX_LENGTH = 10000

const emojiRegex = /([^ ]+)/

const bitRegex = /^[cC]heer(\d+)$/

const bitEmojis: [number, string, string][] = [
    [10000, "__CHAZZY_BIT_CHEER_RED__", "https://static-cdn.jtvnw.net/bits/dark/animated/red/4"],
    [5000, "__CHAZZY_BIT_CHEER_BLUE__", "https://static-cdn.jtvnw.net/bits/dark/animated/blue/4"],
    [1000, "__CHAZZY_BIT_CHEER_GREEN__", "https://static-cdn.jtvnw.net/bits/dark/animated/green/4"],
    [100, "__CHAZZY_BIT_CHEER_PURPLE__", "https://static-cdn.jtvnw.net/bits/dark/animated/purple/4"],
    [1, "__CHAZZY_BIT_CHEER_GRAY__", "https://static-cdn.jtvnw.net/bits/dark/animated/gray/4"]
]

const bitEmojisObject = Object.fromEntries(bitEmojis.map(([, key, url]) => [key, url]))

interface Props {
    chatChannelId: string;
    badges: Record<string, Record<string, string>>;
    onClearMessage?(clearMessage: ClearMessage): void;
}

export default function useTwitchChatList(props: Props) {
    const {chatChannelId, badges, onClearMessage} = props
    const isRefreshingRef = useRef<boolean>(false)
    const isUnloadingRef = useRef<boolean>(false)
    const pendingChatListRef = useRef<Chat[]>([])
    const [webSocketBuster, setWebSocketBuster] = useState<number>(0)

    const convertChat = useCallback((raw: any): Chat => {
        const source = raw.source
        const tags = raw.tags
        const nickname = tags["display-name"] ?? source["nick"]
        const color = tags["color"] != null
            ? suggestAAColorVariant(tags["color"], backgroundColor)
            : twitchNicknameColors[parseInt(tags["user-id"]) % twitchNicknameColors.length]
        let message: string = raw["parameters"]
        const isItalic = message.indexOf("\x01ACTION ") !== -1
        message = message.replace("\x01ACTION ", "").replace("\x01", "")
        const emotes = tags["emotes"] ?? {}
        let bits = parseInt(tags["bits"] ?? '0')

        const emoteReplacements: {stringToReplace: string; replacement: EmojiMessagePart}[] = []

        Object.entries(emotes).forEach(([key, positions]) => {
            const position = positions[0]
            const {startPosition, endPosition} = position
            const stringToReplace = message.substring(parseInt(startPosition), parseInt(endPosition) + 1)
            emoteReplacements.push({stringToReplace, replacement: {type: "emoji", emojiKey: key}})
        })

        return {
            uid: tags["id"],
            time: parseInt(tags["tmi-sent-ts"]),
            userId: tags["user-id"],
            nickname,
            badges: Object.entries(tags["badges"] ?? []).map(([key, version]: [string, string]) => badges[key][version]),
            color,
            emojis: {
                ...bitEmojisObject,
                ...Object.fromEntries(
                    Object.keys(emotes).map((key) =>
                        [key, `https://static-cdn.jtvnw.net/emoticons/v2/${key}/default/dark/4.0`]
                    )
                )
            },
            message: message.split(emojiRegex).filter((part) => part !== '').map((part): MessagePart[] => {
                if (bits > 0) {
                    const bitMatch = part.match(bitRegex)
                    if (bitMatch != null) {
                        const bit = parseInt(part.match(bitRegex)[1])
                        for (const [threshold, emojiKey] of bitEmojis) {
                            if (bit >= threshold && bit >= bits) {
                                bits -= bit
                                return [{type: "emoji", emojiKey}, {type: "text", text: ` ${bit}`}]
                            }
                        }
                    }
                }
                const emoteIndex = emoteReplacements.findIndex(({stringToReplace}) => stringToReplace === part)
                if (emoteIndex === -1) {
                    return [{type: "text", text: part}]
                }
                return [emoteReplacements[emoteIndex].replacement]
            }).flat(),
            isItalic
        }
    }, [badges])

    const connectTwitch = useCallback(() => {
        const ws = new WebSocket("wss://irc-ws.chat.twitch.tv")

        const worker = new Worker(
            URL.createObjectURL(new Blob([`
                let timeout = null

                onmessage = (e) => {
                    if (e.data === "startPingTimer") {
                        if (timeout != null) {
                            clearTimeout(timeout)
                        }
                        timeout = setTimeout(function reservePing() {
                            postMessage("ping")
                            timeout = setTimeout(reservePing, 20000)
                        }, 20000)
                    }
                    if (e.data === "stop") {
                        if (timeout != null) {
                            clearTimeout(timeout)
                        }
                    }
                }
            `], {type: "application/javascript"}))
        )

        worker.onmessage = (e) => {
            if (e.data === "ping") {
                ws.send('PING');
            }
        }

        ws.onopen = () => {
            ws.send("CAP REQ :twitch.tv/membership twitch.tv/tags twitch.tv/commands")
            ws.send("PASS SCHMOOPIIE")
            ws.send(`NICK justinfan${75837 + Math.floor(Math.random() * 10000)}`);
            isRefreshingRef.current = false
        }

        ws.onclose = () => {
            if (!isUnloadingRef.current && !isRefreshingRef.current) {
                setTimeout(() => setWebSocketBuster(new Date().getTime()), 1000)
            }
        }

        ws.onmessage = (event: MessageEvent) => {
            const data = event.data

            const rawIrcMessage = data.trimEnd()
            const messages = rawIrcMessage.split("\r\n")

            messages.forEach((message) => {
                const parsedMessage = parseTwitchMessage(message)
                if (parsedMessage == null) return
                switch (parsedMessage.command.command) {
                    case 'PRIVMSG':
                        pendingChatListRef.current =
                            [...pendingChatListRef.current, convertChat(parsedMessage)].slice(-1 * INTERNAL_MAX_LENGTH)
                        break;
                    case 'CLEARCHAT':
                        if (parsedMessage.tags["target-user-id"] == null) break;
                        onClearMessage?.({
                            type: "user",
                            userId: parsedMessage.tags["target-user-id"]
                        })
                        break;
                    case 'CLEARMSG':
                        if (parsedMessage.tags["target-msg-id"] == null) break;
                        onClearMessage?.({
                            type: "message",
                            method: {
                                type: "twitch",
                                uid: parsedMessage.tags["target-msg-id"]
                            }
                        })
                        break;
                    case 'PING':
                        ws.send('PONG');
                        break;
                    case '001':
                        ws.send(`JOIN #${chatChannelId}`);
                        break;
                }

                if (parsedMessage.command.command !== "PONG") {
                    worker.postMessage("startPingTimer")
                }
            })
        }

        worker.postMessage("startPingTimer")

        return () => {
            worker.postMessage("stop")
            worker.terminate()
            ws.close()
        }
    }, [chatChannelId, convertChat, onClearMessage])

    useEffect(() => {
        isRefreshingRef.current = true
        return connectTwitch()
    }, [connectTwitch, webSocketBuster])

    useEffect(() => {
        return () => {
            isUnloadingRef.current = true
        }
    }, [])

    return {pendingChatListRef}
}
