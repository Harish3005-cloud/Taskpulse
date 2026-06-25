import { useState } from 'react';
import api from '../../api/client';

const INITIAL_MESSAGES = [
  {
    role: 'ai',
    content: "Hi! I'm TaskPulse AI. I can help you with task analysis, priority recommendations, and workspace insights. Ask me anything!",
  },
];

/**
 * AskAIPanel — floating AI chat panel (bottom-right), matching Linear's "Ask Linear".
 */
export default function AskAIPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = { role: 'user', content: input };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput('');
    setIsLoading(true);

    try {
      // Exclude the initial greeting if it's the first real message, or just send everything
      // OpenRouter works best if we don't send arbitrary greetings as "assistant" unless necessary,
      // but it's fine for a simple chatbot.
      const payloadMessages = updatedMessages.filter(m => m.content).map(m => ({
        role: m.role,
        content: m.content
      }));

      const { data } = await api.post('/ai/chat', { messages: payloadMessages });
      
      const aiMsg = {
        role: 'ai',
        content: data.reply || "Sorry, I couldn't process that request.",
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      console.error("Failed to chat with AI:", error);
      setMessages(prev => [...prev, { role: 'ai', content: "An error occurred connecting to the AI. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Trigger Button */}
      <button
        className="tp-ask-ai-trigger"
        onClick={() => setIsOpen(!isOpen)}
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M7 1l1.5 3 3 .5-2 2.5.5 3L7 8.5 4 10l.5-3L2.5 4.5l3-.5L7 1z" fill="currentColor" opacity="0.6"/>
        </svg>
        Ask TaskPulse AI
        <span style={{ fontSize: 10, opacity: 0.4, marginLeft: 2 }}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1"/><path d="M6 2v4l2 1" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/></svg>
        </span>
      </button>

      {/* Chat Panel */}
      {isOpen && (
        <div className="tp-ask-ai-panel" style={{ resize: 'both', overflow: 'hidden', minWidth: '320px', minHeight: '400px', maxWidth: '90vw', maxHeight: '90vh' }}>
          {/* Header */}
          <div className="tp-ask-ai-header">
            <span className="tp-ask-ai-title">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M7 1l1.5 3 3 .5-2 2.5.5 3L7 8.5 4 10l.5-3L2.5 4.5l3-.5L7 1z" fill="currentColor"/>
              </svg>
              TaskPulse AI
            </span>
            <button className="tp-icon-btn" onClick={() => setIsOpen(false)}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 3l8 8M11 3l-8 8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
            </button>
          </div>

          {/* Messages */}
          <div className="tp-ask-ai-messages">
            {messages.map((msg, i) => (
              <div key={i} className={`tp-ask-ai-msg ${msg.role}`}>
                {msg.content}
              </div>
            ))}
            {isLoading && (
              <div className="tp-ask-ai-msg ai" style={{ display: 'flex', gap: 4, width: 'fit-content', padding: '12px 16px', background: 'var(--tp-surface)', border: '1px solid var(--tp-border)', borderRadius: '12px 12px 12px 2px' }}>
                <style>{`
                  .tp-dot { width: 6px; height: 6px; border-radius: 50%; background-color: var(--tp-ai); animation: tp-bounce 1.4s infinite ease-in-out both; }
                  .tp-dot:nth-child(1) { animation-delay: -0.32s; }
                  .tp-dot:nth-child(2) { animation-delay: -0.16s; }
                  @keyframes tp-bounce { 0%, 80%, 100% { transform: scale(0); } 40% { transform: scale(1); } }
                `}</style>
                <div className="tp-dot"></div>
                <div className="tp-dot"></div>
                <div className="tp-dot"></div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="tp-ask-ai-input-wrapper">
            <input
              className="tp-ask-ai-input"
              placeholder="Ask about your tasks..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
            />
            <button className="tp-ask-ai-send" onClick={handleSend}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M12 7l-9 5V2l9 5z" fill="currentColor"/></svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
