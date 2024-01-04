import {useEffect, useState} from "react"
import {User} from "./types"

export default function useUser(id: string) {
    const [user, setUser] = useState<User>(undefined)

    const twitchClientId = process.env.NEXT_PUBLIC_TWITCH_CLIENT_ID
    const twitchAccessToken = process.env.NEXT_PUBLIC_TWITCH_ACCESS_TOKEN

    useEffect(() => {
        (async () => {
            await fetch(
                `https://api.twitch.tv/helix/users?id=${id}`,
            {
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${twitchAccessToken}`,
                        "Client-Id": twitchClientId
                    }
                }
            ).then(
                (response) => response.json()
            ).then(
                (data) => {
                    setUser(data['data']?.[0])
                }
            )
        })()
    }, [id])

    return {user}
}
