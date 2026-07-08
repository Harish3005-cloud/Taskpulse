import React, { useState, useRef, useEffect } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import api from '../../api/client';
import { motion } from 'framer-motion';
import { Sparkles, Send, AlertTriangle, ArrowRight, Lightbulb, TrendingUp, ShieldAlert } from 'lucide-react';
import { cn } from '../../lib/utils';
import Avatar from '../shared/Avatar';

const INITIAL_MESSAGES = [
  {
    role: 'ai',
    content: "Hello! I am TaskPulse AI, your intelligent workspace assistant. How can I help you manage your projects and tasks today?",
  }
];

const PROMPT_SUGGESTIONS = [
  {
    title: "Task Recommendations",
    description: "What should I focus on today?",
    icon: Lightbulb,
    color: "text-tp-warning"
  },
  {
    title: "Workspace Insights",
    description: "Summarize our team's performance",
    icon: TrendingUp,
    color: "text-tp-success"
  },
  {
    title: "Risk Detection",
    description: "Are any of our projects falling behind?",
    icon: ShieldAlert,
    color: "text-tp-danger"
  }
];

export default function AIPage() {
  const { activeWorkspace } = useWorkspace();
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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

  const renderMessageContent = (content) => {
    if (content.includes("RISK DETECTED:")) {
      const [intro, riskText] = content.split("RISK DETECTED:");
      return (
        <div className="space-y-4">
          {intro && <p className="text-sm leading-relaxed">{intro.trim()}</p>}
          <div className="bg-tp-danger-soft border border-tp-danger/20 rounded-xl p-4 flex gap-3 items-start shadow-sm">
            <div className="p-2 bg-tp-bg rounded-lg shrink-0">
              <AlertTriangle className="text-tp-danger" size={20} />
            </div>
            <div>
              <h4 className="font-semibold text-tp-danger-strong text-sm mb-1">Project Risk Identified</h4>
              <div className="text-sm text-tp-danger-strong/90 leading-relaxed">{riskText.trim()}</div>
            </div>
          </div>
        </div>
      );
    }
    return <p className="text-sm leading-relaxed whitespace-pre-wrap">{content}</p>;
  };

  return (
    <div className="flex flex-col h-full bg-tp-bg text-tp-foreground">
      {/* Header */}
      <div className="flex-none p-6 border-b border-tp-border bg-tp-surface flex justify-between items-center z-10 relative shadow-sm">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-tp-accent/10 flex items-center justify-center">
              <Sparkles className="text-tp-accent" size={20} />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-tp-foreground">TaskPulse AI</h1>
              <p className="text-tp-muted text-sm mt-0.5">Your intelligent assistant for project management</p>
            </div>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-tp-bg rounded-full border border-tp-border">
          <span className="w-2 h-2 rounded-full bg-tp-success animate-pulse"></span>
          <span className="text-xs font-medium text-tp-muted">AI is online</span>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-8 relative">
        <div className="max-w-4xl mx-auto space-y-8">
          
          {messages.map((msg, idx) => (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={idx} 
              className={cn(
                "flex gap-4",
                msg.role === 'user' ? "flex-row-reverse" : "flex-row"
              )}
            >
              {msg.role === 'ai' ? (
                <div className="w-8 h-8 rounded-full bg-tp-accent flex items-center justify-center shrink-0 shadow-tp-sm">
                  <Sparkles size={14} className="text-white" />
                </div>
              ) : (
                <div className="shrink-0">
                  <Avatar name="User" size={32} />
                </div>
              )}
              
              <div className={cn(
                "max-w-[80%] rounded-2xl p-5",
                msg.role === 'user' 
                  ? "bg-tp-accent text-white rounded-tr-sm shadow-tp-md" 
                  : "bg-tp-surface border border-tp-border rounded-tl-sm shadow-sm"
              )}>
                {renderMessageContent(msg.content)}
              </div>
            </motion.div>
          ))}
          
          {isLoading && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-4 flex-row"
            >
              <div className="w-8 h-8 rounded-full bg-tp-accent flex items-center justify-center shrink-0 shadow-tp-sm">
                <Sparkles size={14} className="text-white" />
              </div>
              <div className="bg-tp-surface border border-tp-border rounded-2xl rounded-tl-sm p-5 shadow-sm flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-tp-accent animate-bounce" />
                <div className="w-2 h-2 rounded-full bg-tp-accent animate-bounce" style={{ animationDelay: '0.15s' }} />
                <div className="w-2 h-2 rounded-full bg-tp-accent animate-bounce" style={{ animationDelay: '0.3s' }} />
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Empty State Prompt Chips */}
        {messages.length === 1 && !isLoading && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="max-w-4xl mx-auto mt-8 grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            {PROMPT_SUGGESTIONS.map((suggestion, idx) => {
              const Icon = suggestion.icon;
              return (
                <button
                  key={idx}
                  onClick={() => handleSend(suggestion.description)}
                  className="group flex flex-col items-start p-5 bg-tp-surface border border-tp-border rounded-2xl hover:border-tp-accent hover:shadow-tp-md transition-all text-left"
                >
                  <div className="p-2 bg-tp-bg rounded-lg mb-3 group-hover:scale-110 transition-transform">
                    <Icon size={18} className={suggestion.color} />
                  </div>
                  <h3 className="font-semibold text-tp-foreground text-sm mb-1">{suggestion.title}</h3>
                  <p className="text-tp-muted text-xs line-clamp-2">"{suggestion.description}"</p>
                </button>
              );
            })}
          </motion.div>
        )}
      </div>

      {/* Input Box */}
      <div className="flex-none p-6 bg-gradient-to-t from-tp-bg via-tp-bg to-transparent z-10 relative">
        <div className="max-w-4xl mx-auto">
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-tp-accent to-indigo-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative flex items-center bg-tp-surface border border-tp-border rounded-2xl shadow-tp-lg">
              <textarea
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Ask me to summarize tasks, prioritize work, or detect risks..."
                className="w-full bg-transparent py-4 pl-5 pr-14 text-sm text-tp-foreground placeholder-tp-muted focus:outline-none resize-none max-h-32 min-h-[56px] rounded-2xl"
                rows={1}
                disabled={isLoading}
              />
              <button
                onClick={() => handleSend()}
                disabled={isLoading || !input.trim()}
                className="absolute right-2 bottom-2 top-2 px-3 bg-tp-accent text-white rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
          <p className="text-center text-xs text-tp-muted mt-4 flex items-center justify-center gap-1.5">
            <ShieldAlert size={12} />
            AI can make mistakes. Please verify important workspace information.
          </p>
        </div>
      </div>
    </div>
  );
}
