import {useEffect, useState} from "react"

export default function useAccessToken(chatChannelId?: string) {
    const [accessToken, setAccessToken] = useState<string>(undefined)

    useEffect(() => {
        if (chatChannelId == null) {
            return
        }

        (async () => {
            await fetch(
                // Use proxy API backend
                `https://comm-api.game.naver.com.proxy.aioo.ooo/nng_main/v1/chats/access-token?channelId=${chatChannelId}&chatType=STREAMING`,
            ).then(
                (response) => response.json()
            ).then(
                (data) => {
                    if (data["code"] === 200) {
                        setAccessToken(data['content']['accessToken'])
                    }
                }
            )
        })()
    }, [chatChannelId])

    return {accessToken}
}
