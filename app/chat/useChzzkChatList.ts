import {useCallback, useEffect, useRef, useState} from "react"
import {chzzkNicknameColors} from "./constants"
import {Chat, ChatCmd, CheeseChat} from "./types"

const emojiRegex = /{:([a-zA-Z0-9_]+):}/g

export default function useChzzkChatList(chatChannelId: string, accessToken: string, maxChatLength: number = 50, maxCheeseChatLength: number = 5) {
    const isBrowserUnloadingRef = useRef<boolean>(false)
    const lastSetTimestampRef = useRef<number>(0)
    const pendingChatListRef = useRef<Chat[]>([])
    const pendingCheeseChatListRef = useRef<CheeseChat[]>([])
    const [chatList, setChatList] = useState<Chat[]>([])
    const [cheeseChatList, setCheeseChatList] = useState<CheeseChat[]>([])
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
            if (!isBrowserUnloadingRef.current) {
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

                    pendingChatListRef.current = [...pendingChatListRef.current, ...chatList].slice(-1 * maxChatLength)

                    const cheeseChatList: CheeseChat[] = chats
                        .filter(({payAmount}) => payAmount != null)
                        .map(({chat, payAmount}) => ({...chat, payAmount}))

                    pendingCheeseChatListRef.current = [...pendingCheeseChatListRef.current, ...cheeseChatList].slice(-1 * maxCheeseChatLength)

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
    }, [accessToken, chatChannelId, convertChat, maxChatLength, maxCheeseChatLength])

    useEffect(() => {
        return connectChzzk()
    }, [connectChzzk, webSocketBuster])

    useEffect(() => {
        window.addEventListener("beforeunload", () => isBrowserUnloadingRef.current = true)
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
            if (pendingCheeseChatListRef.current.length > 0) {
                if (new Date().getTime() - lastSetTimestampRef.current > 1000) {
                    setCheeseChatList((prevCheeseChatList) => {
                        const newCheeseChatList = [...prevCheeseChatList, ...pendingCheeseChatListRef.current].slice(-1 * maxCheeseChatLength)
                        pendingCheeseChatListRef.current = []
                        return newCheeseChatList
                    })
                } else {
                    setCheeseChatList((prevCheeseChatList) => {
                        const newCheeseChatList = [...prevCheeseChatList, pendingCheeseChatListRef.current.shift()]
                        if (newCheeseChatList.length > maxCheeseChatLength) {
                            newCheeseChatList.shift()
                        }
                        return newCheeseChatList
                    })
                }
            }
            lastSetTimestampRef.current = new Date().getTime()
        }, 75)
        return () => {
            clearInterval(interval)
            lastSetTimestampRef.current = 0
        }
    }, [maxChatLength, maxCheeseChatLength])

    return {chatList, cheeseChatList}
}
