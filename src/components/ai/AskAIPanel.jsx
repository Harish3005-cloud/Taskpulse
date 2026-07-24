import { useState, useRef, useEffect } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import api from '../../api/client';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, Send, AlertTriangle } from 'lucide-react';
import { cn } from '../../lib/utils';

const INITIAL_MESSAGES = [
  {
    role: 'ai',
    content: "Hi! I'm TaskPulse AI. I can help you with task analysis, priority recommendations, and workspace insights. Ask me anything!",
  },
];

const PROMPT_CHIPS = [
  "What are my top priorities today?",
  "Detect any project risks",
  "Summarize workspace health"
];

export default function AskAIPanel() {
  const { activeWorkspace } = useWorkspace();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSend = async (text = input) => {
    if (!text.trim() || isLoading) return;

    const userMsg = { role: 'user', content: text };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput('');
    setIsLoading(true);

    try {
      const payloadMessages = updatedMessages.filter(m => m.content).map(m => ({
        role: m.role,
        content: m.content
      }));

      const { data } = await api.post('/ai/chat', { 
        messages: payloadMessages,
        workspaceId: activeWorkspace?._id
      });
      
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

  const renderMessageContent = (content) => {
    if (content.includes("RISK DETECTED:")) {
      const [intro, riskText] = content.split("RISK DETECTED:");
      return (
        <div className="space-y-3">
          {intro && <p className="text-sm leading-relaxed">{intro.trim()}</p>}
          <div className="bg-tp-danger-soft border border-tp-danger/20 rounded-xl p-3 flex gap-3 items-start">
            <AlertTriangle className="text-tp-danger shrink-0 mt-0.5" size={16} />
            <div className="text-sm text-tp-danger-strong">{riskText.trim()}</div>
          </div>
        </div>
      );
    }
    return <p className="text-sm leading-relaxed whitespace-pre-wrap">{content}</p>;
  };

  return (
    <>
      {/* Floating Trigger Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-tp-surface border border-tp-border shadow-tp-lg rounded-full px-4 py-2.5 text-tp-foreground font-medium text-sm hover:border-tp-accent hover:text-tp-accent transition-colors group"
        onClick={() => setIsOpen(true)}
      >
        <Sparkles size={16} className="text-tp-accent group-hover:animate-pulse" />
        Ask AI
        <kbd className="hidden md:inline-flex items-center gap-1 ml-2 px-2 py-0.5 rounded bg-tp-bg text-[10px] text-tp-muted font-mono border border-tp-border">
          ⌘ K
        </kbd>
      </motion.button>

      {/* Chat Panel Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-20 right-6 z-50 w-[380px] h-[600px] max-h-[80vh] flex flex-col bg-tp-surface/95 backdrop-blur-xl border border-tp-border shadow-2xl rounded-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex-none px-4 py-3 border-b border-tp-border flex items-center justify-between bg-tp-surface">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-tp-accent-soft flex items-center justify-center">
                  <Sparkles size={16} className="text-tp-accent" />
                </div>
                <div>
                  <h3 className="font-semibold text-tp-foreground text-sm">TaskPulse AI</h3>
                  <p className="text-[10px] text-tp-success flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-tp-success animate-pulse"></span>
                    Online
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-tp-muted hover:text-tp-foreground hover:bg-tp-bg rounded-lg transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-tp-surface to-tp-bg">
              {messages.map((msg, i) => (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={i} 
                  className={cn(
                    "flex flex-col max-w-[85%]",
                    msg.role === 'user' ? "ml-auto items-end" : "mr-auto items-start"
                  )}
                >
                  <div className={cn(
                    "px-4 py-2.5 rounded-2xl",
                    msg.role === 'user' 
                      ? "bg-tp-accent text-white rounded-br-sm shadow-tp-sm" 
                      : "bg-tp-surface border border-tp-border rounded-bl-sm shadow-sm text-tp-foreground"
                  )}>
                    {renderMessageContent(msg.content)}
                  </div>
                </motion.div>
              ))}
              
              {isLoading && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col max-w-[85%] mr-auto items-start"
                >
                  <div className="px-4 py-3.5 bg-tp-surface border border-tp-border rounded-2xl rounded-bl-sm shadow-sm flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-tp-accent animate-bounce" />
                    <div className="w-1.5 h-1.5 rounded-full bg-tp-accent animate-bounce" style={{ animationDelay: '0.15s' }} />
                    <div className="w-1.5 h-1.5 rounded-full bg-tp-accent animate-bounce" style={{ animationDelay: '0.3s' }} />
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="flex-none p-3 border-t border-tp-border bg-tp-surface">
              {/* Prompt Chips */}
              {messages.length === 1 && (
                <div className="flex gap-2 overflow-x-auto pb-3 scrollbar-hide">
                  {PROMPT_CHIPS.map((chip, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSend(chip)}
                      className="whitespace-nowrap px-3 py-1.5 bg-tp-bg border border-tp-border rounded-full text-xs font-medium text-tp-foreground hover:border-tp-accent hover:text-tp-accent transition-colors"
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              )}

              <div className="relative">
                <textarea
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder="Ask me anything..."
                  className="w-full bg-tp-bg border border-tp-border rounded-xl py-3 pl-4 pr-12 text-sm text-tp-foreground placeholder-tp-muted focus:outline-none focus:border-tp-accent transition-colors resize-none max-h-32 min-h-[44px]"
                  rows={1}
                  disabled={isLoading}
                />
                <button
                  onClick={() => handleSend()}
                  disabled={isLoading || !input.trim()}
                  className="absolute right-2 bottom-2 p-1.5 bg-tp-accent text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send size={16} />
                </button>
              </div>
              <p className="text-center text-[9px] text-tp-muted mt-2">AI can make mistakes. Verify important information.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
