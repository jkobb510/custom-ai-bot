'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';
import styles from './chat.module.css';
import bubuImage from '@/assets/bubu.png';
import trashIcon from '@/assets/trash.svg';

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const audioRef = useRef(null);
  const modalJustClosedRef = useRef(false);

  // Preload audio on mount so playback starts instantly on button click
  useEffect(() => {
    const basePath = process.env.NODE_ENV === 'production' ? '/custom-ai-bot' : '';
    audioRef.current = new Audio(`${basePath}/bubu.mp3`);
    audioRef.current.preload = 'auto';
  }, []);

  // Load modal preference and messages from localStorage on mount
  useEffect(() => {
    try {
      const dontShowModal = localStorage.getItem('hide_bubu_modal');
      if (dontShowModal && JSON.parse(dontShowModal)) {
        setShowModal(false);
      }
      const saved = localStorage.getItem('chat_messages');
      if (saved) {
        setMessages(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Failed to load settings/messages from localStorage:', error);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Load Tenor embed script when modal is visible
  useEffect(() => {
    if (showModal) {
      const existingScript = document.getElementById('tenor-embed-script');
      if (existingScript) {
        existingScript.remove();
      }
      const script = document.createElement('script');
      script.id = 'tenor-embed-script';
      script.src = 'https://tenor.com/embed.js';
      script.async = true;
      document.body.appendChild(script);
      return () => {
        const s = document.getElementById('tenor-embed-script');
        if (s) {
          s.remove();
        }
      };
    }
  }, [showModal]);

  const handleCloseModal = (dontShowAgain = false) => {
    setShowModal(false);
    modalJustClosedRef.current = true;
    setTimeout(() => { modalJustClosedRef.current = false; }, 300);
    if (dontShowAgain) {
      try {
        localStorage.setItem('hide_bubu_modal', JSON.stringify(true));
      } catch (error) {
        console.error('Failed to save hide_bubu_modal to localStorage:', error);
      }
    }
  };

const handleDeleteChat = () => {
    setMessages([]);
    try {
      localStorage.removeItem('chat_messages');
    } catch (error) {
      console.error('Failed to clear chat_messages from localStorage:', error);
    }
    setShowDeleteModal(false);
  };

  // Save messages to localStorage and scroll to bottom when messages update
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem('chat_messages', JSON.stringify(messages));
      } catch (error) {
        console.error('Failed to save messages to localStorage:', error);
      }
    }
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoaded]);

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

    // Add user message to chat
    const userMessage = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
    setLoading(true);

    try {
      let aiResponseText = '';

      // Try client-side Gemini API call if API key is provided, or fallback to API route / mock
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

      // Add AI response to chat
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

  return (
    <div className={styles.chatContainer} data-testid="chat-container">
      {showDeleteModal && (
        <div className={styles.modalOverlay} data-testid="delete-chat-modal">
          <div className={styles.deleteModalPopover} role="dialog" aria-labelledby="delete-chat-title">
            <header className={styles.deleteModalHeader}>
              <div className={styles.deleteModalHeaderTitle}>
                <h2 id="delete-chat-title" className={styles.deleteModalTitle}>Delete chat?</h2>
              </div>
            </header>
            <div className={styles.deleteModalBody}>
              This will delete the messages in this conversation.
              <div className={styles.deleteModalActions}>
                <button
                  onClick={handleDeleteChat}
                  className={`${styles.btn} ${styles.btnDanger}`}
                  data-testid="delete-conversation-confirm-button"
                >
                  Delete
                </button>
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className={`${styles.btn} ${styles.btnSecondary}`}
                  data-testid="delete-conversation-cancel-button"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isLoaded && showModal && (
        <div className={styles.modalOverlay} data-testid="bubu-modal">
          <div className={styles.modalContent}>
            <iframe
              src="https://tenor.com/embed/4715181167776202242"
              width="100%"
              height="280"
              style={{ border: 'none', borderRadius: '12px', overflow: 'hidden' }}
              title="Bubu Work Bubu Focus Sticker"
              allowFullScreen
            />
            <button
              onClick={() => handleCloseModal(false)}
              className={styles.closeModalButton}
              data-testid="close-modal-button"
            >
              Enter Chat
            </button>
            <button
              onClick={() => handleCloseModal(true)}
              className={styles.dontShowModalButton}
              data-testid="dont-show-modal-button"
            >
              Don&apos;t show this modal again
            </button>
          </div>
        </div>
      )}

      <div className={styles.chatHeader} data-testid="chat-header">
        <Image
          src={bubuImage}
          alt="Bubu"
          className={styles.headerImage}
          width={70}
          height={70}
          data-testid="chat-header-image"
          onClick={() => {
            if (modalJustClosedRef.current) return;
            if (audioRef.current) {
              audioRef.current.currentTime = 0;
              audioRef.current.play().catch((err) => {
                console.warn('Audio playback failed:', err);
              });
            }
          }}
          style={{ cursor: 'pointer' }}
        />
        <h1 data-testid="chat-title">Custom AI Chat</h1>
        <button
          onClick={() => setShowDeleteModal(true)}
          className={styles.deleteToggleButton}
          title="Delete Chat"
          data-testid="delete-chat-button"
        >
          <Image
            src={trashIcon}
            alt="Delete Chat"
            width={60}
            height={60}
          />
        </button>
      </div>

      <div className={styles.messagesContainer} data-testid="messages-container">
        {messages.map((msg, idx) => (
          <div key={idx} className={`${styles.message} ${styles[msg.role]}`} data-testid={`message-${msg.role}-${idx}`}>
            <div className={styles.messageRole} data-testid={`message-role-${idx}`}>
              {msg.role === 'user' ? '' : ''}
            </div>
            <div className={styles.messageContent} data-testid={`message-content-${idx}`}>
              <ReactMarkdown>{msg.content}</ReactMarkdown>
            </div>
            
            {msg.metadata && !msg.metadata.passed && (
              <div className={styles.metadata} data-testid={`metadata-${idx}`}>
                <div className={styles.metadataLabel} data-testid={`metadata-label-${idx}`}>✅ Response Cleaned</div>
                <details data-testid={`metadata-details-${idx}`}>
                  <summary className={styles.detailsSummary} data-testid={`metadata-summary-${idx}`}>Details ({msg.metadata.foundPhrases?.length || 0} phrases removed)</summary>
                  <div className={styles.metadataDetails} data-testid={`metadata-content-${idx}`}>
                    <p><strong>Detected hedging phrases:</strong></p>
                    <ul data-testid={`hedging-phrases-list-${idx}`}>
                      {msg.metadata.foundPhrases?.map((phrase, i) => (
                        <li key={i} data-testid={`hedging-phrase-${idx}-${i}`}>{phrase}</li>
                      ))}
                    </ul>
                    <p><strong>Original response:</strong></p>
                    <div className={styles.originalResponse} data-testid={`original-response-${idx}`}>
                      <ReactMarkdown>{msg.metadata.original}</ReactMarkdown>
                    </div>
                  </div>
                </details>
              </div>
            )}
            
            {msg.metadata?.passed && (
              <div className={styles.metadata} data-testid={`metadata-passed-${idx}`}>
                <div className={styles.metadataLabel} data-testid={`metadata-label-passed-${idx}`}></div>
              </div>
            )}

            {msg.isError && (
              <div className={styles.errorBadge} data-testid={`error-badge-${idx}`}>Error</div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} data-testid="messages-end" />
      </div>

      <form onSubmit={handleSubmit} className={styles.inputForm} data-testid="chat-form">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="Type your message..."
          disabled={loading}
          className={styles.input}
          rows={1}
          data-testid="chat-input"
        />
        <button type="submit" disabled={loading} className={styles.submitButton} data-testid="chat-submit-button">
          {loading ? 'Sending...' : 'Send'}
        </button>
      </form>
    </div>
  );
}
