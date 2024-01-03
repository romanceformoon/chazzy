import {ReactElement} from "react"
import {notFound} from "next/navigation"
import Chazzy from "./Chazzy"

export const dynamic = "force-dynamic"

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

    const twitchClientId = process.env.NEXT_PUBLIC_TWITCH_CLIENT_ID
    const twitchAccessToken = process.env.NEXT_PUBLIC_TWITCH_ACCESS_TOKEN

    const twitchBroadcasterId: string = await fetch(
        `https://api.twitch.tv/helix/users?login=${twitchChannelId}`,
        {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${twitchAccessToken}`,
                "Client-Id": twitchClientId
            },
            signal
        }
    ).then(r => r.json()).then(data => data['data']?.[0]?.['id'])

    if (twitchBroadcasterId == null) return notFound()

    const globalBadges = await fetch(
        "https://api.twitch.tv/helix/chat/badges/global",
        {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${twitchAccessToken}`,
                "Client-Id": twitchClientId
            },
            signal
        }
    ).then(r => r.json()).then(data => data['data'] ?? [])

    const broadcasterBadges = await fetch(
        `https://api.twitch.tv/helix/chat/badges?broadcaster_id=${twitchBroadcasterId}`,
        {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${twitchAccessToken}`,
                "Client-Id": twitchClientId
            },
            signal
        }
    ).then(r => r.json()).then(data => data['data'] ?? [])

    const badgeSetIds = new Set([...globalBadges, ...broadcasterBadges].map((badge): string => badge.set_id))

    const twitchBadges = Object.fromEntries(
        Array.from(badgeSetIds).map((setId) => [
            setId,
            Object.fromEntries(
                [
                    globalBadges.find((badge) => badge.set_id === setId),
                    broadcasterBadges.find((badge) => badge.set_id === setId),
                ].map(
                    (badge): [string, string][] => (
                        badge != null ? badge.versions.map((version) => [version.id, version.image_url_4x]) : []
                    )
                ).flat()
            )
        ])
    )

    return (
        <Chazzy
            chzzkChatChannelId={chzzkChatChannelId}
            chzzkAccessToken={chzzkAccessToken}
            twitchChatChannelId={twitchChannelId}
            twitchBadges={twitchBadges}
        />
    )
}
