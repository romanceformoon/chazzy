"use client"

import {CSSProperties, ReactElement, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState} from "react"
import {Chat, ClearMessage} from "../chat/types"
import useChzzkChatList from "../chat/useChzzkChatList"
import useMergedList from "../chat/useMergedList"
import useTwitchChatList from "../chat/useTwitchChatList"
import {default as useChzzkChannel} from "../chzzk/useChannel"
import useLiveStatus from "../chzzk/useLiveStatus"
import {default as useTwitchChannel} from "../twitch/useUser"
import useStream from "../twitch/useStream"
import ChatRow from "./ChatRow"
import CheeseChatRow from "./CheeseChatRow"
import EmptyCheeseChatRow from "./EmptyCheeseChatRow"
import Status from "./Status"
import "./styles.css"

export interface ChazzyProps {
    chzzkChannelId: string;
    chzzkChatChannelId: string;
    chzzkAccessToken: string;
    twitchBroadcasterId: string;
    twitchChatChannelId: string;
    twitchBadges: Record<string, Record<string, string>>;
}

export default function Chazzy(props: ChazzyProps): ReactElement {
    const {
        chzzkChannelId,
        chzzkChatChannelId,
        chzzkAccessToken,
        twitchBroadcasterId,
        twitchChatChannelId,
        twitchBadges
    } = props

    const isChatAutoScrollEnabledRef = useRef<boolean>(true)
    const chatScrollRef = useRef<HTMLDivElement>(null)
    const endOfChatScrollRef = useRef<HTMLDivElement>(null)
    const cheeseChatScrollRef = useRef<HTMLDivElement>(null)
    const [cheeseChatStyle, setCheeseChatStyle] = useState<CSSProperties>(undefined)

    const handleClearChzzkMessage = useCallback((clearMessage: ClearMessage) => {
        setChatList((prevChatList) => {
            const findFn = ({userId}: Chat) => (
                clearMessage.type === "message" &&  clearMessage.method.type === "chzzk"
                    ? clearMessage.method.userId === userId
                    : false
            )
            const lastChatOnPendingChatList = pendingChzzkChatListRef.current.findLast(findFn)
            const lastChatOnChatList = prevChatList.findLast(findFn)
            if (lastChatOnPendingChatList == null && lastChatOnChatList != null) {
                return prevChatList.filter(
                    ({uid}: Chat) => uid !== lastChatOnChatList.uid
                )
            } else if (lastChatOnPendingChatList != null && lastChatOnChatList == null) {
                pendingChzzkChatListRef.current = pendingChzzkChatListRef.current.filter(
                    ({uid}: Chat) => uid !== lastChatOnPendingChatList.uid
                )
                return prevChatList
            } else if (lastChatOnPendingChatList != null && lastChatOnChatList != null) {
                if (lastChatOnChatList.time > lastChatOnPendingChatList.time) {
                    return prevChatList.filter(
                        ({uid}: Chat) => uid !== lastChatOnChatList.uid
                    )
                } else {
                    pendingChzzkChatListRef.current = pendingChzzkChatListRef.current.filter(
                        ({uid}: Chat) => uid !== lastChatOnPendingChatList.uid
                    )
                    return prevChatList
                }
            }
            return prevChatList
        })
    },[])

    const handleClearTwitchMessage = useCallback((clearMessage: ClearMessage) => {
        const filterFn = ({uid, userId}: Chat) => (
            clearMessage.type === "message"
                ? clearMessage.method.type !== "twitch" || clearMessage.method.uid !== uid
                : clearMessage.userId !== userId
        )
        setChatList((prevChatList) => prevChatList.filter(filterFn))
        pendingTwitchChatListRef.current = pendingTwitchChatListRef.current.filter(filterFn)
    },[])

    const {
        pendingChatListRef: pendingChzzkChatListRef,
        pendingCheeseChatListRef,
        refreshWebSocket
    } = useChzzkChatList({
        chatChannelId: chzzkChatChannelId, accessToken: chzzkAccessToken, onClearMessage: handleClearChzzkMessage
    })
    const {
        pendingChatListRef: pendingTwitchChatListRef
    } = useTwitchChatList({
        chatChannelId: twitchChatChannelId, badges: twitchBadges, onClearMessage: handleClearTwitchMessage
    })

    const pendingChatListRefs = useMemo(
        () => [pendingChzzkChatListRef, pendingTwitchChatListRef],
        [pendingChzzkChatListRef, pendingTwitchChatListRef]
    )

    const pendingCheeseChatListRefs = useMemo(
        () => [pendingCheeseChatListRef],
        [pendingCheeseChatListRef]
    )

    const {
        list: chatList,
        setList: setChatList,
    } = useMergedList({pendingListRefs: pendingChatListRefs, maxLength: 1000})

    const {
        list: cheeseChatList
    } = useMergedList({pendingListRefs: pendingCheeseChatListRefs, maxLength: 5})

    useEffect(() => {
        if (isChatAutoScrollEnabledRef.current && endOfChatScrollRef.current != null) {
            endOfChatScrollRef.current.scrollIntoView();
        }
    }, [chatList, cheeseChatList])

    const handleChatScroll = useCallback(() => {
        if (chatScrollRef.current == null) return
        isChatAutoScrollEnabledRef.current =
            chatScrollRef.current.scrollHeight <= chatScrollRef.current.scrollTop + chatScrollRef.current.clientHeight + 120
    }, []);

    const handleCheeseChatScroll = useCallback(() => {
        if (cheeseChatScrollRef.current == null) return
        const isTop = cheeseChatScrollRef.current.scrollTop <= 0
        const isBottom = cheeseChatScrollRef.current.scrollTop >= cheeseChatScrollRef.current.scrollHeight - cheeseChatScrollRef.current.clientHeight
        setCheeseChatStyle({
            maskImage: `linear-gradient(to bottom, ${isTop ? "red" : "transparent"} 0, red 1em calc(100% - 1em), ${isBottom ? "red" : "transparent"} 100%)`
        })
    }, []);

    useLayoutEffect(() => {
        handleCheeseChatScroll()
    }, [cheeseChatList])

    const reversedCheeseChatList = useMemo(() => {
        const copied = cheeseChatList.filter(
            (cheeseChat) => new Date().getTime() - cheeseChat.time < 60 * 5 * 1000
        )
        copied.reverse()
        return copied
    }, [cheeseChatList])

    const {channel: chzzkChannel} = useChzzkChannel(chzzkChannelId)
    const {liveStatus} = useLiveStatus(chzzkChannelId)
    const {user} = useTwitchChannel(twitchBroadcasterId)
    const {stream} = useStream(twitchBroadcasterId)

    useEffect(() => refreshWebSocket(), [liveStatus?.status, refreshWebSocket])

    return (
        <div id="chazzy-container">
            <div id="chat-container">
                <div
                    id="chat-list-container"
                    ref={(ref) => {
                        if (ref == null) return
                        if (chatScrollRef.current != null) {
                            chatScrollRef.current.removeEventListener("wheel", handleChatScroll)
                            chatScrollRef.current.removeEventListener("touchmove", handleChatScroll)
                        }
                        ref.addEventListener("wheel", handleChatScroll)
                        ref.addEventListener("touchmove", handleChatScroll)
                        chatScrollRef.current = ref
                    }}
                    style={{flex: 2, height: "100%", overflowY: "scroll"}}
                >
                    {chatList.map((chat) => (
                        chat && <ChatRow key={chat.uid} {...chat} />
                    ))}
                    <div ref={endOfChatScrollRef}/>
                </div>
                <div
                    id="cheese-chat-list-container"
                    ref={(ref) => {
                        if (ref == null) return
                        if (cheeseChatScrollRef.current != null) {
                            cheeseChatScrollRef.current.removeEventListener("scroll", handleCheeseChatScroll)
                        }
                        ref.addEventListener("scroll", handleCheeseChatScroll)
                        cheeseChatScrollRef.current = ref
                    }}
                    style={cheeseChatStyle}
                >
                    {reversedCheeseChatList.length === 0
                        ? <EmptyCheeseChatRow/>
                        : reversedCheeseChatList.map((cheeseChat) => (
                                <CheeseChatRow key={cheeseChat.uid} {...cheeseChat} />
                            )
                        )}
                </div>
            </div>
            <div id="status-container">
                {chzzkChannel != null && (
                    <Status
                        provider="chzzk"
                        channelName={chzzkChannel.channelName}
                        channelImageUrl={chzzkChannel.channelImageUrl}
                        concurrentUserCount={liveStatus?.concurrentUserCount}
                        liveCategoryValue={liveStatus?.liveCategoryValue}
                        isLive={liveStatus?.status === "OPEN"}
                    />
                )}
                <div style={{width: "1.5px", height: "16px", backgroundColor: "white", opacity: 0.1}}/>
                {user != null && (
                    <Status
                        provider="twitch"
                        channelName={user.display_name}
                        channelImageUrl={user.profile_image_url}
                        concurrentUserCount={stream?.viewer_count}
                        liveCategoryValue={stream?.game_name}
                        isLive={stream != null}
                    />
                )}
            </div>
        </div>
    )
}
