import { useRef } from 'react';
import { openDB } from 'idb';

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

async function saveToDB(key, value) {
  const db = await initDB();
  return db.put(STORE_NAME, value, key);
}

async function deleteFromDB(key) {
  const db = await initDB();
  return db.delete(STORE_NAME, key);
}

export function useChatHandlers(
  input,
  setInput,
  setMessages,
  setLoading,
  setShowModal,
  setShowDeleteModal,
  messagesEndRef,
  textareaRef,
  audioRef,
  modalJustClosedRef
) {
  const handleCloseModal = (dontShowAgain = false) => {
    setShowModal(false);
    modalJustClosedRef.current = true;
    setTimeout(() => { modalJustClosedRef.current = false; }, 300);
    if (dontShowAgain) {
      saveToDB('hide_bubu_modal', true).catch((error) => {
        console.error('Failed to save hide_bubu_modal to IDB:', error);
      });
    }
  };

  const handleDeleteChat = () => {
    setMessages([]);
    deleteFromDB('chat_messages').catch((error) => {
      console.error('Failed to clear chat_messages from IDB:', error);
    });
    setShowDeleteModal(false);
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    setInput(val);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
    setLoading(true);

    try {
      let aiResponseText = '';

      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
      if (apiKey) {
        const { GoogleGenAI } = await import('@google/genai');
        const ai = new GoogleGenAI({ apiKey });
        const response = await ai.models.generateContent({
          model: 'gemini-flash-latest',
          contents: input,
        });
        aiResponseText = response.text || '';
      } else {
        const basePath = process.env.NODE_ENV === 'production' ? '/custom-ai-bot' : '';
        const response = await fetch(`${basePath}/api/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: input }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `API error: ${response.statusText || response.status}`);
        }

        const data = await response.json();
        aiResponseText = data.cleaned || data.original || '';
      }

      const { validateResponse } = await import('@/lib/responseValidator');
      const validationResult = validateResponse(aiResponseText);

      const aiMessage = {
        role: 'assistant',
        content: validationResult.cleaned,
        metadata: {
          passed: validationResult.passed,
          original: validationResult.original,
          foundPhrases: validationResult.foundPhrases,
          message: validationResult.message,
        },
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `Error: ${error.message}`,
          isError: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarClick = () => {
    if (modalJustClosedRef.current) return;
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch((err) => {
        console.warn('Audio playback failed:', err);
      });
    }
  };

  return {
    handleCloseModal,
    handleDeleteChat,
    handleInputChange,
    handleKeyDown,
    handleSubmit,
    handleAvatarClick,
  };
}
