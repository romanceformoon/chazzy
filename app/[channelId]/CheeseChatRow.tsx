import {Fragment, memo} from "react"
import {CheeseChat} from "../chat/types"
import CheeseIcon from "@/app/[channelId]/CheeseIcon"

function CheeseChatRow(props: CheeseChat) {
    const {time, nickname, badges, emojis, message, payAmount} = props
    const timestamp = (() => {
        const date = new Date(time)
        return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
    })()
    const tier = (() => {
        if (payAmount >= 100000) {
            return "tier3"
        } else if (payAmount >= 10000) {
            return "tier2"
        } else {
            return "tier1"
        }
    })()

    return (
        <div className={`cheese-chat-row ${tier}`}>
            <div className="content">
                <span className="timestamp">[{timestamp}]</span>
                <span className="message">
                    {message.map((part, i) => (
                        <Fragment key={i}>
                            {part.type === "text"
                                ? <span>{part.text}</span>
                                : <img className="emoji" alt={part.emojiKey} src={emojis[part.emojiKey]}/>
                            }
                        </Fragment>
                    ))}
                </span>
            </div>
            <div className="footer">
                <div className="nickname">
                    {badges.length > 0 && badges.map((src, i) => (
                        <img key={i} className="badge" alt="" src={src}/>
                    ))}
                    <span>{nickname}</span>
                </div>
                <div className="cheese">
                    <CheeseIcon/>
                    {payAmount.toLocaleString("ko-KR")}
                </div>
            </div>
        </div>
    )
}

export default memo(CheeseChatRow)
