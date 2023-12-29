import {Fragment, memo} from "react"
import {CheeseChat} from "../chat/types"

function CheeseChatRow(props: CheeseChat) {
    const {time, nickname, badges, color, emojis, message, payAmount} = props
    const timestamp = (() => {
        const date = new Date(time)
        return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
    })()

    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                background: "rgba(255, 255, 255, 0.125)",
                color: "white",
                padding: "12px",
                gap: "4px",
                borderRadius: "4px",
                opacity: "0.35",
                animation: "20s linear fadeout",
                lineHeight: "calc(var(--font-size) * 1.25)"
            }}
        >
            <div style={{fontWeight: 700}}>
                {badges.length > 0 && badges.map((src, i) => (
                    <img key={i} alt="" src={src} style={{height: "var(--font-size)", paddingTop: "calc(var(--font-size) * 0.125)", paddingRight: "4px", verticalAlign: "top"}} />
                ))}
                <span style={{color: color}}>{nickname}</span>
                님이&nbsp;
                <span style={{color: "#e4ce00"}}>{payAmount.toLocaleString("ko-KR")} 치즈</span>
                &nbsp;후원
            </div>
            <div>
                {message.map((part, i) => (
                    <Fragment key={i}>
                        {part.type === "text"
                            ? part.text
                            : (
                                <span style={{position: "relative", padding: "1px"}}>
                                    <img alt={part.emojiKey} src={emojis[part.emojiKey]} style={{height: "calc(var(--font-size) * 1.25)", verticalAlign: "top"}}/>
                                </span>
                            )}
                    </Fragment>
                ))}
            </div>
            <div style={{textAlign: "right", fontWeight: 100}}>[{timestamp}]</div>
        </div>
    )
}

export default memo(CheeseChatRow)
