import { useEffect, useState } from 'react';
import { Badge } from './types';

export default function useBroadcasterBadges(broadcasterId: string | undefined) {
  const [badges, setBadges] = useState<Badge[]>([]);

  const twitchClientId = process.env.NEXT_PUBLIC_TWITCH_CLIENT_ID;
  const twitchAccessToken = process.env.NEXT_PUBLIC_TWITCH_ACCESS_TOKEN;

  useEffect(() => {
    if (broadcasterId == null) {
      return;
    }
    void (async () => {
      await fetch(`https://api.twitch.tv/helix/chat/badges?broadcaster_id=${broadcasterId}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${twitchAccessToken}`,
          'Client-Id': twitchClientId,
        },
      })
        .then((r) => r.json() as Promise<{ data: Badge[] }>)
        .then((data) => setBadges(data.data ?? []));
    })();
  }, [broadcasterId]);

  return { badges };
}
