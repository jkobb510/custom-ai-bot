'use client';

import { useState, useRef, useSyncExternalStore } from 'react';
import './chat.css';
import BubuModal from '@/components/BubuModal';
import DeleteChatModal from '@/components/DeleteChatModal';
import ChatHeader from '@/components/ChatHeader';
import ChatInput from '@/components/ChatInput';
import MessagesContainer from '@/components/MessagesContainer';
import { useAutoScroll } from '@/hooks/useAutoScroll';
import { useChatAudio } from '@/hooks/useChatAudio';
import { useChatHandlers } from '@/hooks/useChatHandlers';
import { useChatPersistence } from '@/hooks/useChatPersistence';
const basePath = process.env.NODE_ENV === 'production' ? '/custom-ai-bot' : '';
function useIsClient() {
  return useSyncExternalStore(
    () => () => {}, 
    () => true, 
    () => false
  );
}

export default function Chat() {
  const isClient = useIsClient();
  const { messages, setMessages, showModal, setShowModal, isLoaded } = useChatPersistence(isClient);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const textareaRef = useRef(null);
  const modalJustClosedRef = useRef(false);

  const audioRef = useChatAudio(`${basePath}/bubu.mp3`);
  const messagesEndRef = useAutoScroll(messages, isClient && isLoaded);

  const handlers = useChatHandlers({ 
    input, 
    setInput, 
    setMessages, 
    setLoading, 
    setShowModal, 
    setShowDeleteModal, 
    textareaRef, 
    audioRef, 
    modalJustClosedRef 
  });


  return (
    <div className="chatContainer" data-testid="chat-container">
      <DeleteChatModal
        isOpen={showDeleteModal}
        onConfirm={handlers.handleDeleteChat}
        onCancel={() => setShowDeleteModal(false)}
      />

      <BubuModal
        isOpen={isClient && showModal}
        onClose={handlers.handleCloseModal}
      />

      <ChatHeader
        onAvatarClick={handlers.handleAvatarClick}
        onDeleteClick={() => setShowDeleteModal(true)}
      />

      <MessagesContainer
        isClient={isClient}
        messages={messages}
        messagesEndRef={messagesEndRef}
      />

      <ChatInput
        input={input}
        onChange={handlers.handleInputChange}
        onKeyDown={handlers.handleKeyDown}
        onSubmit={handlers.handleSubmit}
        loading={loading}
        textareaRef={textareaRef}
      />
    </div>
  );
}
