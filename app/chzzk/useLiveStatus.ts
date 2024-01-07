import {useEffect, useState} from "react"
import {LiveStatus} from "./types"

export default function useLiveStatus(channelId: string) {
    const [liveStatus, setLiveStatus] = useState<LiveStatus>(undefined)

    useEffect(() => {
        const fn = async () => {
            await fetch(
                // Use proxy API backend
                `https://api.chzzk.naver.com.proxy.aioo.ooo/polling/v2/channels/${channelId}/live-status`,
            ).then(
                (response) => response.json()
            ).then(
                (data) => {
                    if (data["code"] === 200) {
                        setLiveStatus(data['content'])
                    }
                }
            )
        }
        (async () => await fn())()
        const interval = setInterval(fn, 30000)
        return () => clearInterval(interval)
    }, [channelId])

    return {liveStatus}
}
