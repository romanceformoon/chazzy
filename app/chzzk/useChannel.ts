import { useEffect, useState } from 'react';
import { Channel } from './types';

export default function useChannel(channelId: string | undefined) {
  const [channel, setChannel] = useState<Channel>(undefined);

  useEffect(() => {
    if (channelId == null) {
      return;
    }
    void (async () => {
      await fetch(
        // Use proxy API backend
        `/n-api/service/v1/channels/${channelId}`,
      )
        .then(
          (response) =>
            response.json() as Promise<{
              code: number;
              content: Channel;
            }>,
        )
        .then((data) => {
          if (data['code'] === 200) {
            setChannel(data['content']);
          }
        });
    })();
  }, [channelId]);

  return { channel };
}
