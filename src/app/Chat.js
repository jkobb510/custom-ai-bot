'use client';

import { useState, useRef, useEffect, useSyncExternalStore } from 'react';
import './chat.css';
import BubuModal from '@/components/BubuModal';
import DeleteChatModal from '@/components/DeleteChatModal';
import ChatHeader from '@/components/ChatHeader';
import MessageItem from '@/components/MessageItem';
import ChatInput from '@/components/ChatInput';
import { useChatHandlers } from '@/hooks/useChatHandlers';

function getInitialShowModal() {
  if (typeof window === 'undefined') return true;
  try {
    const dontShowModal = localStorage.getItem('hide_bubu_modal');
    return !(dontShowModal && JSON.parse(dontShowModal));
  } catch (error) {
    console.error('Failed to load hide_bubu_modal from localStorage:', error);
    return true;
  }
}

function getInitialMessages() {
  if (typeof window === 'undefined') return [];
  try {
    const saved = localStorage.getItem('chat_messages');
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    console.error('Failed to load chat_messages from localStorage:', error);
    return [];
  }
}

function useIsClient() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
}

export default function Chat() {
  const isClient = useIsClient();
  const [messages, setMessages] = useState(getInitialMessages);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(getInitialShowModal);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const audioRef = useRef(null);
  const modalJustClosedRef = useRef(false);
  const didMountRef = useRef(false);

  // Preload audio on mount so playback starts instantly on button click
  useEffect(() => {
    const basePath = process.env.NODE_ENV === 'production' ? '/custom-ai-bot' : '';
    audioRef.current = new Audio(`${basePath}/bubu.mp3`);
    audioRef.current.preload = 'auto';
  }, []);

  const { handleCloseModal, handleDeleteChat, handleInputChange, handleKeyDown, handleSubmit, handleAvatarClick } = useChatHandlers(input, setInput, setMessages, setLoading, setShowModal, setShowDeleteModal, messagesEndRef, textareaRef, audioRef, modalJustClosedRef);

  // Save messages to localStorage and scroll to bottom when messages update
  useEffect(() => {
    if (didMountRef.current) {
      try {
        localStorage.setItem('chat_messages', JSON.stringify(messages));
      } catch (error) {
        console.error('Failed to save messages to localStorage:', error);
      }
    } else {
      didMountRef.current = true;
    }
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);


  return (
    <div className="chatContainer" data-testid="chat-container">
      <DeleteChatModal
        isOpen={showDeleteModal}
        onConfirm={handleDeleteChat}
        onCancel={() => setShowDeleteModal(false)}
      />

      <BubuModal
        isOpen={isClient && showModal}
        onClose={handleCloseModal}
      />

      <ChatHeader
        onAvatarClick={handleAvatarClick}
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
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onSubmit={handleSubmit}
        loading={loading}
        textareaRef={textareaRef}
      />
    </div>
  );
}
