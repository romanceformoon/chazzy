export interface Channel {
    channelId: string;
    channelName: string;
    channelImageUrl: string;
    verifiedMark: boolean;
    channelType: string;
    channelDescription: string;
    followerCount: number;
    openLive: boolean;
}

export interface LiveStatus {
    liveTitle: string;
    status: string;
    concurrentUserCount: number;
    accumulateCount: number;
    paidPromotion: boolean;
    adult: boolean;
    chatChannelId: string;
    categoryType: string;
    liveCategory: string;
    liveCategoryValue: string;
    livePollingStatusJson: string;
    faultStatus: unknown;
}
