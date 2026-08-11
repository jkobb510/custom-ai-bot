'use client';

import ReactMarkdown from 'react-markdown';

export default function MessageItem({ msg, idx }) {
  return (
    <div className={`message ${msg.role}`} data-testid={`message-${msg.role}-${idx}`}>
      <div className="messageRole" data-testid={`message-role-${idx}`}>
        {msg.role === 'user' ? '' : ''}
      </div>
      <div className="messageContent" data-testid={`message-content-${idx}`}>
        <ReactMarkdown>{msg.content}</ReactMarkdown>
      </div>

      {msg.isError && (
        <div className="errorBadge" data-testid={`error-badge-${idx}`}>Error</div>
      )}
    </div>
  );
}
