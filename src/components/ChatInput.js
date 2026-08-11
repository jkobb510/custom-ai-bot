'use client';

export default function ChatInput({
  input,
  onChange,
  onKeyDown,
  onSubmit,
  loading,
  textareaRef
}) {
  return (
    <form onSubmit={onSubmit} className="inputForm" data-testid="chat-form">
      <textarea
        ref={textareaRef}
        value={input}
        onChange={onChange}
        onKeyDown={onKeyDown}
        placeholder="Type your message..."
        disabled={loading}
        className="input"
        rows={1}
        data-testid="chat-input"
      />
      <button type="submit" disabled={loading} className="submitButton" data-testid="chat-submit-button">
        {loading ? 'Sending...' : 'Send'}
      </button>
    </form>
  );
}
