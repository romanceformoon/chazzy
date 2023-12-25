import {Fragment, memo} from "react"
import {Chat} from "../chat/types"

function ChatRow(props: Chat) {
    const {time, nickname, badges, color, emojis, message} = props
    const timestamp = (() => {
        const date = new Date(time)
        return `[${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}]`
    })()

    return (
        <div style={{lineHeight: "calc(var(--font-size) * 1.5)", wordWrap: "break-word", fontWeight: 400, color: "white"}}>
            <span style={{paddingRight: "8px", fontWeight: 100}}>{timestamp}</span>
            {badges.length > 0 && badges.map((src, i) => (
                <img key={i} alt="" src={src} style={{height: "var(--font-size)", paddingTop: "calc(var(--font-size) * 0.25)", paddingRight: "8px", verticalAlign: "top"}} />
            ))}
            <span style={{color: color, paddingRight: "8px"}}>{nickname}:</span>
            <span>
                {message.map((part, i) => (
                    <Fragment key={i}>
                        {part.type === "text"
                            ? part.text
                            : (
                                <span style={{position: "relative", padding: "1px"}}>
                                    <img alt={part.emojiKey} src={emojis[part.emojiKey]} style={{height: "var(--font-size)", paddingTop: "calc(var(--font-size) * 0.25)", verticalAlign: "top"}}/>
                                </span>
                            )}
                    </Fragment>
                ))}
            </span>
        </div>
    )
}

export default memo(ChatRow)
