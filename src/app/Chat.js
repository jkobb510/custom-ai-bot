'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import styles from './chat.module.css';
import bubuImage from '@/assets/bubu.png';

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(true);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const audioRef = useRef(null);

  // Preload audio on mount so playback starts instantly on button click
  useEffect(() => {
    audioRef.current = new Audio('/bubu.mp3');
    audioRef.current.preload = 'auto';
  }, []);

  // Load messages from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('chat_messages');
      if (saved) {
        setMessages(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Failed to load messages from localStorage:', error);
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

  const handleCloseModal = () => {
    setShowModal(false);
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch((err) => {
        console.warn('Audio playback was prevented or failed:', err);
      });
    }
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
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `API error: ${response.statusText || response.status}`);
      }

      const data = await response.json();

      // Add AI response to chat
      const aiMessage = {
        role: 'assistant',
        content: data.cleaned,
        metadata: {
          passed: data.passed,
          original: data.original,
          foundPhrases: data.foundPhrases,
          message: data.message,
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
      {showModal && (
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
              onClick={handleCloseModal}
              className={styles.closeModalButton}
              data-testid="close-modal-button"
            >
              Enter Chat
            </button>
          </div>
        </div>
      )}

      <div className={styles.chatHeader} data-testid="chat-header">
        <h1 data-testid="chat-title">Custom AI Chat</h1>
        <Image
          src={bubuImage}
          alt="Bubu"
          className={styles.headerImage}
          width={40}
          height={40}
          data-testid="chat-header-image"
        />
      </div>

      <div className={styles.messagesContainer} data-testid="messages-container">
        {messages.map((msg, idx) => (
          <div key={idx} className={`${styles.message} ${styles[msg.role]}`} data-testid={`message-${msg.role}-${idx}`}>
            <div className={styles.messageRole} data-testid={`message-role-${idx}`}>
              {msg.role === 'user' ? '' : ''}
            </div>
            <div className={styles.messageContent} data-testid={`message-content-${idx}`}>{msg.content}</div>
            
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
                    <p className={styles.originalResponse} data-testid={`original-response-${idx}`}>{msg.metadata.original}</p>
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
