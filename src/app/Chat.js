'use client';

import { useState, useRef, useEffect, useSyncExternalStore } from 'react';
import { openDB } from 'idb';
import './chat.css';
import BubuModal from '@/components/BubuModal';
import DeleteChatModal from '@/components/DeleteChatModal';
import ChatHeader from '@/components/ChatHeader';
import MessageItem from '@/components/MessageItem';
import ChatInput from '@/components/ChatInput';
import { useChatHandlers } from '@/hooks/useChatHandlers';

const DB_NAME = 'chatAppDB';
const STORE_NAME = 'appData';

async function initDB() {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    },
  });
}

async function getFromDB(key) {
  const db = await initDB();
  return db.get(STORE_NAME, key);
}

async function saveToDB(key, value) {
  const db = await initDB();
  return db.put(STORE_NAME, value, key);
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
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const audioRef = useRef(null);
  const modalJustClosedRef = useRef(false);
  const didMountRef = useRef(false);

  // Load initial data from IDB
  useEffect(() => {
    if (!isClient) return;

    Promise.all([
      getFromDB('chat_messages'),
      getFromDB('hide_bubu_modal')
    ]).then(([savedMessages, dontShowModal]) => {
      if (savedMessages) setMessages(Array.isArray(savedMessages) ? savedMessages : []);
      if (dontShowModal !== undefined) setShowModal(!dontShowModal);
      didMountRef.current = true;
    }).catch((error) => {
      console.error('Failed to load from IDB:', error);
      didMountRef.current = true;
    });
  }, [isClient]);

  // Preload audio on mount so playback starts instantly on button click
  useEffect(() => {
    const basePath = process.env.NODE_ENV === 'production' ? '/custom-ai-bot' : '';
    audioRef.current = new Audio(`${basePath}/bubu.mp3`);
    audioRef.current.preload = 'auto';
  }, []);

  const { handleCloseModal, handleDeleteChat, handleInputChange, handleKeyDown, handleSubmit, handleAvatarClick } = useChatHandlers(input, setInput, setMessages, setLoading, setShowModal, setShowDeleteModal, messagesEndRef, textareaRef, audioRef, modalJustClosedRef);

  // Save messages to IDB and scroll to bottom when messages update
  useEffect(() => {
    if (!isClient || !didMountRef.current) return;

    saveToDB('chat_messages', messages).catch((error) => {
      console.error('Failed to save messages to IDB:', error);
    });
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isClient]);


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
