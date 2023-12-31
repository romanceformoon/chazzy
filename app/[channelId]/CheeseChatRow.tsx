import {Fragment, memo} from "react"
import {CheeseChat} from "../chat/types"

function CheeseChatRow(props: CheeseChat) {
    const {time, nickname, badges, color, emojis, message, payAmount} = props
    const timestamp = (() => {
        const date = new Date(time)
        return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
    })()

    return (
        <div className="cheese-chat-row">
            <div className="header">
                {badges.length > 0 && badges.map((src, i) => (
                    <img key={i} className="badge" alt="" src={src} />
                ))}
                <span style={{color: color}}>{nickname}</span>
                <span>님이 </span>
                <span className="cheese">{payAmount.toLocaleString("ko-KR")} 치즈 </span>
                <span>후원</span>
            </div>
            <div className="message">
                {message.map((part, i) => (
                    <Fragment key={i}>
                        {part.type === "text"
                            ? <span>{part.text}</span>
                            : <img className="emoji" alt={part.emojiKey} src={emojis[part.emojiKey]}/>
                        }
                    </Fragment>
                ))}
            </div>
            <div className="timestamp">[{timestamp}]</div>
        </div>
    )
}

export default memo(CheeseChatRow)
