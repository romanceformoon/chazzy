"use client"

import {useCallback, useEffect, useMemo} from "react"
import {useSearchParams} from "next/navigation"
import {clsx} from "clsx"
import useChzzkChatList from "../chat/useChzzkChatList"
import useTwitchChatList from "../chat/useTwitchChatList"
import ChatRow from "./ChatRow"
import useNotice from "@/src/hooks/use-notice"

export default function ChatBox({chzzkChatChannelId, chzzkAccessToken, twitchChatChannelId}) {
    const searchParams = useSearchParams()
    const small = searchParams.has("small")

    const chzzkChatList = useChzzkChatList(chzzkChatChannelId, chzzkAccessToken)
    const twitchChatList = useTwitchChatList(twitchChatChannelId)

    const chatList = useMemo(() => {
        return [...chzzkChatList, ...twitchChatList].sort((a, b) => a.time - b.time)
    }, [chzzkChatList, twitchChatList])

    const handleObsStreamingStarted = useCallback(() => {
        window.location.reload()
    }, [])

    // requires obs 30.0.1+
    useEffect(() => {
        window.addEventListener("obsStreamingStarted", handleObsStreamingStarted)

        return () => {
            window.removeEventListener("obsStreamingStarted", handleObsStreamingStarted)
        }
    }, [handleObsStreamingStarted])

    useNotice()

    return (
        <div id="log" className={clsx(small && "small")}>
            {chatList.map((chat) => (
                <ChatRow key={chat.uid} {...chat} />
            ))}
        </div>
    )
}
