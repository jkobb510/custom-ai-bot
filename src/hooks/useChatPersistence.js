import { useEffect, useState } from 'react';
import { getFromDB, saveToDB } from '@/lib/db';

function isIndexedDBAvailable() {
  return typeof indexedDB !== 'undefined';
}

function loadPersistedState() {
  return Promise.all([
    getFromDB('chat_messages'),
    getFromDB('hide_bubu_modal'),
  ]);
}

export function useChatPersistence(isClient) {
  const [messages, setMessages] = useState([]);
  const [showModal, setShowModal] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function loadState() {
      if (!isClient || !isIndexedDBAvailable()) {
        setIsLoaded(true);
        return;
      }

      try {
        const [savedMessages, hideBubuModal] = await loadPersistedState();
        if (cancelled) return;
        if (savedMessages != null) setMessages(savedMessages);
        if (hideBubuModal != null) setShowModal(!hideBubuModal);
      } catch (error) {
        console.error('Failed to load from IDB:', error);
      } finally {
        if (!cancelled) setIsLoaded(true);
      }
    }

    loadState();

    return () => {
      cancelled = true;
    };
  }, [isClient]);

  useEffect(() => {
    if (!isClient || !isLoaded) return;
    saveToDB('chat_messages', messages).catch((error) => {
      console.error('Failed to save messages to IDB:', error);
    });
  }, [messages, isClient, isLoaded]);

  return { messages, setMessages, showModal, setShowModal, isLoaded };
}
