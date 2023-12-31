import {memo} from "react"

function EmptyCheeseChatRow() {
    return (
        <div className="empty-cheese-chat-row">
            <div style={{fontWeight: 700}}>
                최근&nbsp;
                <span style={{color: "#e4ce00"}}>치즈</span>
                &nbsp;후원 내역 없음
            </div>
            <div>
                치즈 후원이 발생하면 이 곳에 표시됩니다. 🧀
            </div>
        </div>
    )
}

export default memo(EmptyCheeseChatRow)
