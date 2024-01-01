import {Fragment, memo} from "react"
import urlRegexSafe from "url-regex-safe"
import {Chat} from "../chat/types"

function ChatRow(props: Chat) {
    const {time, nickname, badges, color, emojis, message} = props
    const timestamp = (() => {
        const date = new Date(time)
        return `[${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}]`
    })()

    return (
        <div className="chat-row">
            <span className="timestamp">{timestamp}</span>
            {badges.length > 0 && badges.map((src, i) => (
                <img key={i} className="badge" alt="" src={src} />
            ))}
            <span className="nickname" style={{color: color}}>{nickname}:</span>
            <span className="message">
                {message.map((part, i) => (
                    <Fragment key={i}>
                        {part.type === "text"
                            ? urlRegexSafe({exact: true}).test(part.text)
                              ? <a href={part.text.startsWith('http') ? part.text : `https://${part.text}`} target="_blank">{part.text}</a>
                              : <span>{part.text}</span>
                            : <img className="emoji" alt={part.emojiKey} src={emojis[part.emojiKey]}/>}
                    </Fragment>
                ))}
            </span>
        </div>
    )
}

export default memo(ChatRow)
