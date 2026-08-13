import { saveToDB, deleteFromDB } from '@/lib/db';

async function fetchAiResponse(input) {
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

  if (apiKey) {
    const { GoogleGenAI } = await import('@google/genai');
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-flash-latest',
      contents: input,
    });
    return response.text || '';
  }

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
  return data.cleaned || data.original || '';
}

export function useChatHandlers({
  input,
  setInput,
  setMessages,
  setLoading,
  setShowModal,
  setShowDeleteModal,
  textareaRef,
  audioRef,
  modalJustClosedRef,
}) {
  const resizeTextarea = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  };

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
    setInput(e.target.value);
    resizeTextarea();
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

    setMessages((prev) => [...prev, { role: 'user', content: input }]);
    setInput('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
    setLoading(true);

    try {
      const aiResponseText = await fetchAiResponse(input);

      const { validateResponse } = await import('@/lib/responseValidator');
      const result = validateResponse(aiResponseText);

      setMessages((prev) => [...prev, {
        role: 'assistant',
        content: result.cleaned,
        metadata: {
          passed: result.passed,
          original: result.original,
          foundPhrases: result.foundPhrases,
          message: result.message,
        },
      }]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages((prev) => [...prev, {
        role: 'assistant',
        content: `Error: ${error.message}`,
        isError: true,
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarClick = () => {
    if (modalJustClosedRef.current || !audioRef.current) return;
    audioRef.current.currentTime = 0;
    audioRef.current.play().catch((error) => {
      console.warn('Audio playback failed:', error);
    });
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
