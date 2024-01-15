import { useEffect, useState } from 'react';
import { LiveStatus } from './types';

export default function useLiveStatus(channelId: string | undefined) {
  const [liveStatus, setLiveStatus] = useState<LiveStatus>(undefined);

  useEffect(() => {
    if (channelId == null) {
      return;
    }
    const fn = async () => {
      await fetch(
        // Use proxy API backend
        `https://api.chzzk.naver.com.proxy.aioo.ooo/polling/v2/channels/${channelId}/live-status`,
      )
        .then(
          (response) =>
            response.json() as Promise<{
              code: number;
              content: LiveStatus;
            }>,
        )
        .then((data) => {
          if (data['code'] === 200) {
            setLiveStatus(data['content']);
          }
        });
    };
    void fn();
    const interval = setInterval(() => void fn(), 30000);
    return () => clearInterval(interval);
  }, [channelId]);

  return { liveStatus };
}
