'use client';

import { useState, useRef, useEffect, useSyncExternalStore } from 'react';
import { getFromDB, saveToDB } from '@/lib/db';
import './chat.css';
import BubuModal from '@/components/BubuModal';
import DeleteChatModal from '@/components/DeleteChatModal';
import ChatHeader from '@/components/ChatHeader';
import MessageItem from '@/components/MessageItem';
import ChatInput from '@/components/ChatInput';
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
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const audioRef = useRef(null);
  const modalJustClosedRef = useRef(false);

  useEffect(() => {
    const audio = new Audio(`${basePath}/bubu.mp3`);
    audio.preload = 'auto';
    audioRef.current = audio;
  }, []);

  useEffect(() => {
    if (!isClient || !isLoaded) return;
    saveToDB('chat_messages', messages).catch((error) => {
      console.error('Failed to save messages to IDB:', error);
    });
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isClient, isLoaded]);

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

      <div className="messagesContainer" data-testid="messages-container">
        {isClient && messages.map((msg, idx) => (
          <MessageItem key={idx} msg={msg} idx={idx} />
        ))}
        <div ref={messagesEndRef} data-testid="messages-end" />
      </div>

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
