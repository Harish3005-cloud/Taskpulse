import React, { useState, useRef, useEffect } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import api from '../../api/client';

export default function AIPage() {
  const { activeWorkspace } = useWorkspace();
  const [messages, setMessages] = useState([
    {
      role: 'ai',
      content: "Hello! I am TaskPulse AI. How can I help you manage your projects and tasks today?",
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = { role: 'user', content: input };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput('');
    setIsLoading(true);

    try {
      const payloadMessages = updatedMessages.filter(m => m.content).map(m => ({
        role: m.role,
        content: m.content
      }));

      const { data } = await api.post('/ai/chat', { messages: payloadMessages, workspaceId: activeWorkspace?._id });
      
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
    <div className="flex flex-col h-full bg-[var(--bg-base)] text-[var(--text-primary)]">
      {/* Header */}
      <div className="flex-none p-6 border-b border-[var(--border-subtle)] bg-[var(--bg-surface)]">
        <h1 className="text-2xl font-bold tracking-tight">TaskPulse AI</h1>
        <p className="text-[var(--text-muted)] text-sm mt-1">Your intelligent assistant for project management.</p>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-2xl p-4 ${
                msg.role === 'user' 
                  ? 'bg-[var(--accent)] text-white rounded-br-none' 
                  : 'bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-bl-none shadow-sm'
              }`}>
                {msg.role === 'ai' && (
                  <div className="flex items-center gap-2 mb-2 font-semibold text-sm text-indigo-500">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83"/></svg>
                    TaskPulse AI
                  </div>
                )}
                <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.content}</p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl rounded-bl-none p-4 shadow-sm flex items-center gap-2">
                <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Box */}
      <div className="flex-none p-6 border-t border-[var(--border-subtle)] bg-[var(--bg-surface)]">
        <div className="max-w-4xl mx-auto">
          <div className="relative">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              placeholder="Ask me to summarize tasks, prioritize work, or suggest resources..."
              className="w-full bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded-xl py-4 pl-4 pr-12 text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] transition-colors shadow-sm"
              disabled={isLoading}
            />
            <button
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className="absolute right-2 top-2 bottom-2 p-2 bg-[var(--accent)] text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M22 2L11 13M22 2L15 22L11 13M11 13L2 9L22 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
          </div>
          <p className="text-center text-xs text-[var(--text-muted)] mt-3">AI can make mistakes. Verify important information.</p>
        </div>
      </div>
    </div>
  );
}
