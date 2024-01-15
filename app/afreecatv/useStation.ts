import { useEffect, useState } from 'react';
import { StationResponse } from './types';

export default function useStation(channelId: string) {
  const [station, setStation] = useState<StationResponse>(undefined);

  useEffect(() => {
    if (channelId == null) {
      return;
    }
    const fn = async () => {
      await fetch(`https://bjapi.afreecatv.com/api/${channelId}/station`)
        .then((response) => response.json() as Promise<StationResponse>)
        .then((data) => {
          setStation(data);
        });
    };
    void fn();
    const interval = setInterval(() => void fn(), 30000);
    return () => clearInterval(interval);
  }, [channelId]);

  return { station };
}
