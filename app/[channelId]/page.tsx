import {notFound} from "next/navigation"
import ChatBox from "./ChatBox"

export const dynamic = "force-dynamic"

export default async function ChatPage({params: {channelId}}) {
    const {signal} = new AbortController()
    const [chzzkChannelId, twitchChannelId] = channelId.split("-")

    const chzzkChatChannelId = await fetch(
        `https://api.chzzk.naver.com/polling/v1/channels/${chzzkChannelId}/live-status`,
        {signal}
    ).then(r => r.json()).then(data => data['content']?.['chatChannelId'])

    if (!chzzkChatChannelId) return notFound()

    const chzzkAccessToken = await fetch(
        `https://comm-api.game.naver.com/nng_main/v1/chats/access-token?channelId=${chzzkChatChannelId}&chatType=STREAMING`,
        {signal}
    ).then(r => r.json()).then(data => data['content']['accessToken'])

    return (
        <ChatBox chzzkChatChannelId={chzzkChatChannelId} chzzkAccessToken={chzzkAccessToken} twitchChatChannelId={twitchChannelId}/>
    )
}
