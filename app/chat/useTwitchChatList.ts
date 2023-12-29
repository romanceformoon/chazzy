import {useCallback, useEffect, useRef, useState} from "react"
import {twitchNicknameColors} from "./constants"
import parseTwitchMessage from "./parseTwitchMessage"
import {Chat, EmojiMessagePart} from "./types"

export default function useTwitchChatList(chatChannelId: string, badges: Record<string, Record<string, string>>[], maxChatLength: number = 50) {
    const isUnloadingRef = useRef<boolean>(false)
    const lastSetTimestampRef = useRef<number>(0)
    const pendingChatListRef = useRef<Chat[]>([])
    const [chatList, setChatList] = useState<Chat[]>([])
    const [webSocketBuster, setWebSocketBuster] = useState<number>(0)

    const convertChat = useCallback((raw: any): Chat => {
        const source = raw.source
        const tags = raw.tags
        const nickname = tags["display-name"] ?? source["nick"]
        const color = tags["color"] ?? twitchNicknameColors[parseInt(tags["user-id"]) % twitchNicknameColors.length]
        const message = raw["parameters"]
        const emotes = tags["emotes"] ?? {}

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
            emojis: Object.fromEntries(
                Object.keys(emotes).map((key) =>
                    [key, `https://static-cdn.jtvnw.net/emoticons/v2/${key}/default/dark/4.0`]
                )
            ),
            message: message.split(' ').map((part) => {
                const emoteIndex = emoteReplacements.findIndex(({stringToReplace}) => stringToReplace === part)
                return emoteIndex === -1 ? {type: "text", text: `${part} `} : emoteReplacements[emoteIndex].replacement
            })
        }
    }, [badges])

    const connectTwitch = useCallback(() => {
        const ws = new WebSocket("wss://irc-ws.chat.twitch.tv")

        ws.onopen = () => {
            ws.send("CAP REQ :twitch.tv/membership twitch.tv/tags twitch.tv/commands")
            ws.send("PASS SCHMOOPIIE")
            ws.send(`NICK justinfan${75837 + Math.floor(Math.random() * 10000)}`);
        }

        ws.onclose = () => {
            if (!isUnloadingRef.current) {
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
                        pendingChatListRef.current = [
                            ...pendingChatListRef.current,
                            convertChat(parsedMessage)
                        ].slice(-1 *  maxChatLength)
                        break;
                    case 'CLEARCHAT':
                        if (parsedMessage.tags["target-user-id"] == null) break;
                        pendingChatListRef.current = pendingChatListRef.current.filter(
                            (chat) => chat.userId !== parsedMessage.tags["target-user-id"]
                        )
                        setChatList((prevChatList) => prevChatList.filter(
                            (chat) => chat.userId !== parsedMessage.tags["target-user-id"]
                        ))
                        break;
                    case 'CLEARMSG':
                        pendingChatListRef.current = pendingChatListRef.current.filter(
                            (chat) => chat.uid !== parsedMessage.tags["target-msg-id"]
                        )
                        setChatList((prevChatList) => prevChatList.filter(
                            (chat) => chat.uid !== parsedMessage.tags["target-msg-id"]
                        ))
                        break;
                    case 'PING':
                        ws.send('PONG ' + parsedMessage.parameters);
                        break;
                    case '001':
                        ws.send(`JOIN #${chatChannelId}`);
                        break;
                }
            })
        }

        return () => {
            ws.close()
        }
    }, [chatChannelId, convertChat, maxChatLength])

    useEffect(() => {
        return connectTwitch()
    }, [connectTwitch, webSocketBuster])

    useEffect(() => {
        return () => {
            isUnloadingRef.current = true
        }
    }, [])

    useEffect(() => {
        const interval = setInterval(() => {
            if (document.hidden) {
                return
            }
            if (pendingChatListRef.current.length > 0) {
                if (new Date().getTime() - lastSetTimestampRef.current > 1000) {
                    setChatList((prevChatList) => {
                        const newChatList = [...prevChatList, ...pendingChatListRef.current].slice(-1 * maxChatLength)
                        pendingChatListRef.current = []
                        return newChatList
                    })
                } else {
                    setChatList((prevChatList) => {
                        const newChatList = [...prevChatList, pendingChatListRef.current.shift()]
                        if (newChatList.length > maxChatLength) {
                            newChatList.shift()
                        }
                        return newChatList
                    })
                }
            }
            lastSetTimestampRef.current = new Date().getTime()
        }, 75)
        return () => {
            clearInterval(interval)
            lastSetTimestampRef.current = 0
        }
    }, [maxChatLength])

    return chatList
}
