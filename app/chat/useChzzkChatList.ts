import {useCallback, useEffect, useRef, useState} from "react"
import {chzzkNicknameColors} from "./constants"
import {Chat, ChatCmd, CheeseChat} from "./types"

const INTERNAL_MAX_LENGTH = 10000

const emojiRegex = /{:([a-zA-Z0-9_]+):}/g

interface Props {
    chatChannelId: string;
    accessToken: string;
}

export default function useChzzkChatList(props: Props) {
    const {chatChannelId, accessToken} = props
    const isUnloadingRef = useRef<boolean>(false)
    const pendingChatListRef = useRef<Chat[]>([])
    const pendingCheeseChatListRef = useRef<CheeseChat[]>([])
    const [webSocketBuster, setWebSocketBuster] = useState<number>(0)

    const convertChat = useCallback((raw: any): {chat: Chat, payAmount: number | undefined} => {
        const profile = JSON.parse(raw['profile'])
        const extras = JSON.parse(raw['extras'])
        const nickname = profile.nickname
        const badge = profile.badge?.imageUrl
        const donationBadge = profile.streamingProperty?.realTimeDonationRanking?.badge?.imageUrl
        const badges = [badge, donationBadge].concat(
            profile.activityBadges?.filter(badge => badge.activated)?.map(badge => badge.imageUrl) ?? []
        ).filter(badge => badge != null)
        const channelId = raw["cid"] || raw["channelId"]
        const color = profile.title?.color ?? chzzkNicknameColors[
            (profile.userIdHash + channelId)
                .split("")
                .map(c => c.charCodeAt(0))
                .reduce((a, b) => a + b, 0) % chzzkNicknameColors.length
        ]
        const emojis = extras?.emojis || {}
        const message = raw['msg'] || raw['content'] || ''
        const match = message.match(emojiRegex)

        return {
            chat: {
                uid: Math.random().toString(36).substring(2, 12),
                time: raw['msgTime'] || raw['messageTime'],
                userId: profile.userIdHash,
                nickname,
                badges,
                color,
                emojis,
                message: match
                    ? message.split(emojiRegex).map(
                        (part, i) => i % 2 == 0 ? {type: "text", text: part} : {type: "emoji", emojiKey: part}
                    )
                    : [{type: "text", text: message}]
            },
            payAmount: extras?.payAmount
        }
    }, [])

    const connectChzzk = useCallback(() => {
        const ws = new WebSocket("wss://kr-ss1.chat.naver.com/chat")

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
                ws.send(JSON.stringify({
                    ver: "2",
                    cmd: ChatCmd.PING
                }))
            }
        }

        ws.onopen = () => {
            ws.send(JSON.stringify({
                bdy: {
                    accTkn: accessToken,
                    auth: "READ",
                    devType: 2001,
                    uid: null
                },
                cmd: ChatCmd.CONNECT,
                tid: 1,
                cid: chatChannelId,
                svcid: "game",
                ver: "2"
            }))
        }

        ws.onclose = () => {
            if (!isUnloadingRef.current) {
                setTimeout(() => setWebSocketBuster(new Date().getTime()), 1000)
            }
        }

        ws.onmessage = (event: MessageEvent) => {
            const json = JSON.parse(event.data)

            switch (json.cmd) {
                case ChatCmd.PING:
                    ws.send(JSON.stringify({
                        ver: "2",
                        cmd: ChatCmd.PONG,
                    }))
                    break
                case ChatCmd.CHAT:
                case ChatCmd.CHEESE_CHAT:
                    const chats: {chat: Chat, payAmount: number | undefined}[] =
                        json['bdy']
                            .filter(chat => (chat['msgStatusType'] || chat['messageStatusType']) !== "HIDDEN")
                            .filter(chat => {
                                const messageTypeCode = chat['msgTypeCode'] || chat['messageTypeCode']
                                return messageTypeCode === 1 || messageTypeCode === 10
                            })
                            .map(convertChat)

                    const chatList = chats
                        .filter(({payAmount}) => payAmount == null)
                        .map(({chat}) => chat)

                    pendingChatListRef.current =
                        [...pendingChatListRef.current, ...chatList].slice(-1 * INTERNAL_MAX_LENGTH)

                    const cheeseChatList: CheeseChat[] = chats
                        .filter(({payAmount}) => payAmount != null)
                        .map(({chat, payAmount}) => ({...chat, payAmount}))

                    pendingCheeseChatListRef.current =
                        [...pendingCheeseChatListRef.current, ...cheeseChatList].slice(-1 * INTERNAL_MAX_LENGTH)

                    break
            }

            if (json.cmd !== ChatCmd.PONG) {
                worker.postMessage("startPingTimer")
            }
        }

        worker.postMessage("startPingTimer")

        return () => {
            worker.postMessage("stop")
            worker.terminate()
            ws.close()
        }
    }, [accessToken, chatChannelId, convertChat])

    useEffect(() => {
        return connectChzzk()
    }, [connectChzzk, webSocketBuster])

    useEffect(() => {
        return () => {
            isUnloadingRef.current = true
        }
    }, [])

    return {pendingChatListRef, pendingCheeseChatListRef}
}
