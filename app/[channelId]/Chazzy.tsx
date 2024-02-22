'use client';

import { CSSProperties, ReactElement, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Chat, ClearMessage } from '../chat/types';
import useMergedList from '../chat/useMergedList';
import useChzzkChannel from '../chzzk/useChannel';
import useChzzkChatList from '../chzzk/useChatList';
import useLiveStatus from '../chzzk/useLiveStatus';
import ChatRow from './ChatRow';
import ChazzyMenu from './ChazzyMenu';
import CheeseChatRow from './CheeseChatRow';
import EmptyCheeseChatRow from './EmptyCheeseChatRow';
import Status from './Status';
import './styles.css';

export interface ChazzyProps {
  chzzkChannelId: string | undefined;
}

export default function Chazzy(props: ChazzyProps): ReactElement {
  const { chzzkChannelId } = props;

  const isChatAutoScrollEnabledRef = useRef<boolean>(true);
  const chatScrollRef = useRef<HTMLDivElement>(null);
  const endOfChatScrollRef = useRef<HTMLDivElement>(null);
  const cheeseChatScrollRef = useRef<HTMLDivElement>(null);
  const [cheeseChatStyle, setCheeseChatStyle] = useState<CSSProperties>(undefined);

  const { channel: chzzkChannel } = useChzzkChannel(chzzkChannelId);
  const { liveStatus: chzzkLiveStatus } = useLiveStatus(chzzkChannelId);

  const handleClearChzzkMessage = useCallback((clearMessage: ClearMessage) => {
    setChatList((prevChatList) => {
      const findFn = ({ userId }: Chat) =>
        clearMessage.type === 'message'
          ? clearMessage.method.type === 'chzzk' && clearMessage.method.userId === userId
          : false;
      const lastIndexOnPendingChatList = pendingChzzkChatListRef.current.findLastIndex(findFn);
      const lastChatOnPendingChatList = pendingChzzkChatListRef.current[lastIndexOnPendingChatList];
      const lastIndexOnChatList = prevChatList.findLastIndex(findFn);
      const lastChatOnChatList = prevChatList[lastIndexOnChatList];
      const newChatList = [...prevChatList];
      if (lastChatOnPendingChatList == null && lastChatOnChatList != null) {
        newChatList.splice(lastIndexOnChatList, 1, {
          ...lastChatOnChatList,
          deletionReason: '클린봇이 부적절한 표현을 감지했습니다.',
        });
        return newChatList;
      } else if (lastChatOnPendingChatList != null && lastChatOnChatList == null) {
        pendingChzzkChatListRef.current.splice(lastIndexOnPendingChatList, 1, {
          ...lastChatOnPendingChatList,
          deletionReason: '클린봇이 부적절한 표현을 감지했습니다.',
        });
        return prevChatList;
      } else if (lastChatOnPendingChatList != null && lastChatOnChatList != null) {
        if (lastChatOnChatList.time > lastChatOnPendingChatList.time) {
          newChatList.splice(lastIndexOnChatList, 1, {
            ...lastChatOnChatList,
            deletionReason: '클린봇이 부적절한 표현을 감지했습니다.',
          });
          return newChatList;
        } else {
          pendingChzzkChatListRef.current.splice(lastIndexOnPendingChatList, 1, {
            ...lastChatOnPendingChatList,
            deletionReason: '클린봇이 부적절한 표현을 감지했습니다.',
          });
          return prevChatList;
        }
      }
      return prevChatList;
    });
  }, []);

  const { pendingChatListRef: pendingChzzkChatListRef, pendingCheeseChatListRef } = useChzzkChatList(
    chzzkLiveStatus?.chatChannelId,
    handleClearChzzkMessage,
  );

  const pendingChatListRefs = useMemo(() => [pendingChzzkChatListRef], [pendingChzzkChatListRef]);

  const pendingCheeseChatListRefs = useMemo(() => [pendingCheeseChatListRef], [pendingCheeseChatListRef]);

  const { list: chatList, setList: setChatList } = useMergedList({
    pendingListRefs: pendingChatListRefs,
    maxLength: 1000,
  });

  const { list: cheeseChatList } = useMergedList({
    pendingListRefs: pendingCheeseChatListRefs,
    maxLength: 10,
  });

  useEffect(() => {
    if (isChatAutoScrollEnabledRef.current && endOfChatScrollRef.current != null) {
      endOfChatScrollRef.current.scrollIntoView();
    }
  }, [chatList, cheeseChatList]);

  const handleChatScroll = useCallback(() => {
    if (chatScrollRef.current == null) return;
    isChatAutoScrollEnabledRef.current =
      chatScrollRef.current.scrollHeight <= chatScrollRef.current.scrollTop + chatScrollRef.current.clientHeight + 120;
  }, []);

  const handleCheeseChatScroll = useCallback(() => {
    if (cheeseChatScrollRef.current == null) return;
    const isTop = cheeseChatScrollRef.current.scrollTop <= 0;
    const isBottom =
      cheeseChatScrollRef.current.scrollTop >=
      cheeseChatScrollRef.current.scrollHeight - cheeseChatScrollRef.current.clientHeight;
    setCheeseChatStyle({
      maskImage: `linear-gradient(to bottom, ${isTop ? 'red' : 'transparent'} 0, red 1em calc(100% - 1em), ${isBottom ? 'red' : 'transparent'} 100%)`,
    });
  }, []);

  useLayoutEffect(() => {
    handleCheeseChatScroll();
  }, [cheeseChatList]);

  const arrangedCheeseChatList = useMemo(() => {
    const copied = cheeseChatList.filter((cheeseChat) => new Date().getTime() - cheeseChat.time < 60 * 5 * 1000);
    copied.reverse();
    return copied;
  }, [cheeseChatList]);

  return (
    <div id="chazzy-container">
      <div id="chat-container">
        <div
          id="chat-list-container"
          ref={(ref) => {
            if (ref == null) return;
            if (chatScrollRef.current != null) {
              chatScrollRef.current.removeEventListener('wheel', handleChatScroll);
              chatScrollRef.current.removeEventListener('touchmove', handleChatScroll);
            }
            ref.addEventListener('wheel', handleChatScroll);
            ref.addEventListener('touchmove', handleChatScroll);
            chatScrollRef.current = ref;
          }}
          style={{ flex: 2, height: '100%', overflowY: 'scroll' }}
        >
          {chatList.map((chat) => chat && <ChatRow key={chat.uid} {...chat} />)}
          <div ref={endOfChatScrollRef} />
        </div>
        {chzzkChannelId != null && (
          <div
            id="cheese-chat-list-container"
            ref={(ref) => {
              if (ref == null) return;
              if (cheeseChatScrollRef.current != null) {
                cheeseChatScrollRef.current.removeEventListener('scroll', handleCheeseChatScroll);
              }
              ref.addEventListener('scroll', handleCheeseChatScroll);
              cheeseChatScrollRef.current = ref;
            }}
            style={cheeseChatStyle}
          >
            {arrangedCheeseChatList.length === 0 ? (
              <EmptyCheeseChatRow />
            ) : (
              arrangedCheeseChatList.map((cheeseChat) => <CheeseChatRow key={cheeseChat.uid} {...cheeseChat} />)
            )}
          </div>
        )}
      </div>
      <div id="status-container">
        {chzzkChannelId != null && chzzkChannel != null && (
          <>
            <Status
              provider="chzzk"
              channelName={chzzkChannel.channelName}
              channelImageUrl={chzzkChannel.channelImageUrl}
              concurrentUserCount={chzzkLiveStatus?.concurrentUserCount}
              liveCategoryValue={chzzkLiveStatus?.liveCategoryValue}
              isLive={chzzkLiveStatus?.status === 'OPEN'}
            />
            <div className="divider" />
          </>
        )}
        <ChazzyMenu />
      </div>
    </div>
  );
}
