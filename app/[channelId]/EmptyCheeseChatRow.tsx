import { memo } from 'react';
import CheeseIcon from './CheeseIcon';

function EmptyCheeseChatRow() {
  return (
    <>
      <div className="cheese-chat-row">
        <div className="content">
          <span className="message">
            <span style={{ color: 'white', fontSize: '2rem' }}>아무 곳이나 한 번 클릭하면 TTS가 작동합니다.</span>
          </span>
        </div>
      </div>
      <div className="cheese-chat-row">
        <div className="content">
          <span className="message">
            <span>치즈 후원이 발생하면 이 곳에 표시됩니다. 🧀</span>
          </span>
        </div>
        <div className="footer">
          <div className="nickname" />
          <div className="cheese">
            <CheeseIcon />0
          </div>
        </div>
      </div>
    </>
  );
}

export default memo(EmptyCheeseChatRow);
