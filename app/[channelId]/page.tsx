import { ReactElement } from 'react';
import Chazzy from './Chazzy';

export const dynamic = 'force-dynamic';

export default function ChazzyPage({ params: { channelId } }: { params: { channelId: string } }): ReactElement {
  const [chzzkChannelId, twitchChannelId, afreecatvChannelId] = channelId.split('-');

  return (
    <Chazzy
      afreecatvChannelId={afreecatvChannelId !== '' ? afreecatvChannelId : undefined}
      chzzkChannelId={chzzkChannelId !== '' ? chzzkChannelId : undefined}
      twitchChannelId={twitchChannelId !== '' ? twitchChannelId : undefined}
    />
  );
}
