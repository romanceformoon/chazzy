import {memo, ReactElement} from "react"

type Provider = 'chzzk' | 'twitch'

interface Props {
    provider: Provider;
    channelName: string;
    channelImageUrl: string;
    liveCategoryValue?: string;
    concurrentUserCount?: number;
    isLive?: boolean;
}

function Status(props: Props): ReactElement {
    const {provider, channelName, channelImageUrl, liveCategoryValue, concurrentUserCount, isLive} = props

    const ringColor = provider === 'chzzk' ? '#00ffa3,#027f80' : '#bf94ff,#772ce8'

    return (
        <div style={{flex: "1", display: "flex", alignItems: "center", padding: "4px 8px 4px 5px", minWidth: 0, maxWidth: "240px"}}>
            <div
                style={{
                    flex: "none",
                    backgroundClip: "content-box,border-box",
                    backgroundOrigin: "border-box",
                    border: "1px solid transparent",
                    borderRadius: "50%",
                    boxSizing: "border-box",
                    minWidth: 0,
                    ...(isLive ? {
                        backgroundImage: `linear-gradient(#141517,#141517),linear-gradient(180deg,${ringColor})`
                    } : {
                        filter: "grayscale(100%) contrast(85%)",
                        opacity: 0.8
                    })
                }}
            >
                <img
                    alt={channelName}
                    src={channelImageUrl}
                    width="26"
                    height="26"
                    style={{borderRadius: "50%", margin: "2px", verticalAlign: "top", objectFit: "cover"}}
                />
            </div>
            <div style={{flex: "1", display: "flex", flexDirection: "column", marginLeft: "8px", minWidth: 0}}>
                <div style={{fontSize: "13px", fontWeight: 900, lineHeight: "16px", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap"}}>{channelName}</div>
                {isLive && liveCategoryValue != null && (
                    <div style={{fontSize: "11px", lineHeight: "13px", marginTop: "3px", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap"}}>{liveCategoryValue}</div>
                )}
            </div>
            {isLive && concurrentUserCount != null && (
                <div style={{
                    color: "#FF5454",
                    fontSize: "12px",
                    fontWeight: 600,
                    lineHeight: "14px",
                    marginLeft: "8px",
                    paddingLeft: "8px",
                    position: "relative"
                }}>
                    <div style={{
                        backgroundColor: "currentColor",
                        borderRadius: "50%",
                        height: "4px",
                        left: 0,
                        position: "absolute",
                        top: "50%",
                        transform: "translateY(-50%)",
                        width: "4px"
                    }}/>
                    {concurrentUserCount.toLocaleString("ko-KR")}
                </div>
            )}
        </div>
    )
}

export default memo(Status)
