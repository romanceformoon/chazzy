"use client"

import {ReactElement, useCallback, useEffect, useMemo, useRef} from "react"
import useChzzkChatList from "../chat/useChzzkChatList"
import useTwitchChatList from "../chat/useTwitchChatList"
import ChatRow from "./ChatRow"
import CheeseChatRow from "./CheeseChatRow"
import EmptyCheeseChatRow from "./EmptyCheeseChatRow"
import "./styles.css"

export interface ChazzyProps {
    chzzkChatChannelId: string;
    chzzkAccessToken: string;
    twitchChatChannelId: string;
    twitchBadges: Record<string, Record<string, string>>[];
}

export default function Chazzy({chzzkChatChannelId, chzzkAccessToken, twitchChatChannelId, twitchBadges}: ChazzyProps): ReactElement {
    const isAutoScrollEnabledRef = useRef<boolean>(true)
    const scrollRef = useRef<HTMLDivElement>(null)
    const endOfScrollRef = useRef<HTMLDivElement>(null)
    const {chatList: chzzkChatList, cheeseChatList} = useChzzkChatList(chzzkChatChannelId, chzzkAccessToken, 500, 5)
    const twitchChatList = useTwitchChatList(twitchChatChannelId, twitchBadges, 500)

    const chatList = useMemo(() => {
        return [...chzzkChatList, ...twitchChatList].sort((a, b) => a.time - b.time)
    }, [chzzkChatList, twitchChatList])

    useEffect(() => {
        if (isAutoScrollEnabledRef.current && endOfScrollRef.current != null) {
            endOfScrollRef.current.scrollIntoView();
        }
    }, [chatList])

    const handleScroll = useCallback(() => {
        if (scrollRef.current == null) return
        isAutoScrollEnabledRef.current =
            scrollRef.current.scrollHeight <= scrollRef.current.scrollTop + scrollRef.current.clientHeight + 120
    }, []);

    const reversedCheeseChatList = useMemo(() => {
        const copied = [...cheeseChatList]
        copied.reverse()
        return copied
    }, [cheeseChatList])

    return <div id="chazzy-container" style={{display: "flex", gap: "8px", padding: "8px"}}>
        <div
            id="chat-list-container"
            ref={(ref) => {
                if (ref == null) return
                if (scrollRef.current != null) {
                    scrollRef.current.removeEventListener("wheel", handleScroll)
                    scrollRef.current.removeEventListener("touchmove", handleScroll)
                }
                ref.addEventListener("wheel", handleScroll)
                ref.addEventListener("touchmove", handleScroll)
                scrollRef.current = ref
            }}
            style={{flex: 2, height: "100%", overflowY: "scroll"}}
        >
            {chatList.map((chat) => (
                <ChatRow key={chat.uid} {...chat} />
            ))}
            <div ref={endOfScrollRef} />
        </div>
        <div
            id="cheese-chat-list-container"
            style={{
                display: "flex",
                flexDirection: "column",
                overflowY: "scroll",
                gap: "8px"
            }}
        >
            {reversedCheeseChatList.length === 0
                ? <EmptyCheeseChatRow />
                : reversedCheeseChatList.map((cheeseChat) => (
                    <CheeseChatRow key={cheeseChat.uid} {...cheeseChat} />
                )
            )}
        </div>
    </div>
}
