import {ReactElement} from "react"
import {notFound} from "next/navigation"
import Chazzy from "./Chazzy"

export default async function ChazzyPage({params: {channelId}}): Promise<ReactElement> {
    const {signal} = new AbortController()
    const [chzzkChannelId, twitchChannelId] = channelId.split("-")

    const chzzkChatChannelId: string = await fetch(
        `https://api.chzzk.naver.com/polling/v1/channels/${chzzkChannelId}/live-status`,
        {signal}
    ).then(r => r.json()).then(data => data['content']?.['chatChannelId'])

    if (!chzzkChatChannelId) return notFound()

    const chzzkAccessToken: string = await fetch(
        `https://comm-api.game.naver.com/nng_main/v1/chats/access-token?channelId=${chzzkChatChannelId}&chatType=STREAMING`,
        {signal}
    ).then(r => r.json()).then(data => data['content']['accessToken'])

    return (
        <Chazzy
            chzzkChatChannelId={chzzkChatChannelId}
            chzzkAccessToken={chzzkAccessToken}
            twitchChatChannelId={twitchChannelId}
        />
    )
}
