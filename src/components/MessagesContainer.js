import MessageItem from '@/components/MessageItem';

export default function MessagesContainer({ isClient, messages, messagesEndRef }) {
  return (
    <div className="messagesContainer" data-testid="messages-container">
      {isClient && messages.map((msg, idx) => (
        <MessageItem key={idx} msg={msg} idx={idx} />
      ))}
      <div ref={messagesEndRef} data-testid="messages-end" />
    </div>
  );
}
