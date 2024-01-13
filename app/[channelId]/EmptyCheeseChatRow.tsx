import { memo } from 'react';
import CheeseIcon from './CheeseIcon';

function EmptyCheeseChatRow() {
  return (
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
  );
}

export default memo(EmptyCheeseChatRow);
