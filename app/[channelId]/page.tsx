import { ReactElement } from 'react';
import Chazzy from './Chazzy';

export default function ChazzyPage({ params: { channelId } }: { params: { channelId: string } }): ReactElement {
  const [chzzkChannelId] = channelId.split('-');

  return <Chazzy chzzkChannelId={chzzkChannelId !== '' ? chzzkChannelId : undefined} />;
}
