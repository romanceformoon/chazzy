import {Fragment, memo} from "react"
import {Chat} from "../chat/types"

function ChatRow(props: Chat) {
    const {nickname, badges, color, emojis, message} = props

    return (
        <div data-from={nickname}>
            <span className="meta" style={{ color: color }}>
                {badges.map((src, i) => (
                    <img key={i} className="badge" alt="" src={src} />
                ))}
                <span className="name">{nickname}</span>
                <span className="colon">:</span>
            </span>
            <span className="message">
                {message.map((part, i) => (
                    <Fragment key={i}>
                        {part.type === "text"
                            ? part.text
                            : (
                                <span className="emote_wrap">
                                    <img className="emoticon" alt={part.emojiKey} src={emojis[part.emojiKey]}/>
                                </span>
                            )
                        }
                    </Fragment>
                ))}
            </span>
        </div>
    )
}

export default memo(ChatRow)
