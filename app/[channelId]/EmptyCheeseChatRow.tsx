import {memo} from "react"

function EmptyCheeseChatRow() {
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
                lineHeight: "calc(var(--font-size) * 1.25)",
            }}
        >
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
