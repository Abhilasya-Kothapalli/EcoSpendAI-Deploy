import React, { useState, useEffect, useRef } from 'react';
import { Send, Sparkles, MessageSquare, Bot, User, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function ChatAdvisor() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([
    {
      role: 'model',
      text: "Hello! I am your EcoSpend AI Sustainability Coach. I've analyzed your recent spending logs.\n\nAsk me anything! For example: \n• *\"How can I reduce my transit footprint based on my logs?\"*\n• *\"What is my carbon breakdown looking like?\"*\n• *\"Give me a 7-day low-carbon grocery layout.\"*"
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const threadEndRef = useRef(null);

  // Auto scroll to latest message
  useEffect(() => {
    threadEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || loading) return;

    const userMessage = { role: 'user', text: inputText };
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setLoading(true);

    try {
      // Package previous messages for chat history context
      const chatHistory = messages.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        text: msg.text
      }));

      const response = await fetch('/api/expenses/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage.text,
          chatHistory: chatHistory
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to reach coach.');

      setMessages(prev => [...prev, { role: 'model', text: data.response }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [
        ...prev,
        { role: 'model', text: `Sorry, I ran into an error connecting to the AI Coach: ${error.message}` }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([
      {
        role: 'model',
        text: "Hello! I am your EcoSpend AI Sustainability Coach. Ask me how to optimize your spending and carbon offset!"
      }
    ]);
  };

  // Basic custom formatter to parse markdown style lists and bolding
  const formatText = (text) => {
    return text.split('\n').map((line, lineIndex) => {
      let content = line;
      
      // Parse bolding (**text**)
      const boldRegex = /\*\*(.*?)\*\*/g;
      const parts = [];
      let lastIndex = 0;
      let match;
      
      while ((match = boldRegex.exec(content)) !== null) {
        if (match.index > lastIndex) {
          parts.push(content.substring(lastIndex, match.index));
        }
        parts.push(<strong key={match.index} className="font-extrabold text-slate-800 dark:text-emerald-300">{match[1]}</strong>);
        lastIndex = boldRegex.lastIndex;
      }
      
      if (lastIndex < content.length) {
        parts.push(content.substring(lastIndex));
      }

      // Check for bullet lines
      const isBullet = line.trim().startsWith('•') || line.trim().startsWith('*') || line.trim().startsWith('-');
      if (isBullet) {
        // Strip bullet char
        const cleanLine = line.replace(/^[•*\-]\s*/, '');
        return (
          <li key={lineIndex} className="list-disc ml-5 mb-1.5 text-xs md:text-sm leading-relaxed">
            {parts.length > 0 ? parts : cleanLine}
          </li>
        );
      }

      return (
        <p key={lineIndex} className="mb-2 text-xs md:text-sm leading-relaxed">
          {parts.length > 0 ? parts : content}
        </p>
      );
    });
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] space-y-4">
      
      {/* Header Panel */}
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-800 dark:text-white">
            AI Carbon Advisor
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Personalized, context-aware sustainable suggestions powered by Gemini.
          </p>
        </div>

        <button
          onClick={clearChat}
          className="flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-850 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold rounded-xl text-xs transition-all duration-200 cursor-pointer"
        >
          <Trash2 className="w-4 h-4" />
          <span>Reset Thread</span>
        </button>
      </div>

      {/* Main Chat Thread container */}
      <div className="flex-1 glass-panel rounded-3xl p-6 shadow-sm overflow-y-auto flex flex-col justify-between min-h-0">
        
        {/* Scrollable list */}
        <div className="flex-1 overflow-y-auto pr-2 space-y-4 no-scrollbar">
          {messages.map((msg, index) => {
            const isModel = msg.role === 'model';
            return (
              <div 
                key={index} 
                className={`flex gap-3 max-w-[85%] md:max-w-[70%] ${
                  isModel ? 'self-start' : 'self-end flex-row-reverse'
                }`}
              >
                {/* Avatar bubble */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center overflow-hidden shrink-0 border ${
                  isModel 
                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' 
                    : 'bg-indigo-500/10 border-indigo-500/20 text-indigo-500'
                }`}>
                  {isModel ? (
                    <Bot className="w-4 h-4" />
                  ) : user?.profilePhoto ? (
                    <img src={user.profilePhoto} alt="User" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-4 h-4" />
                  )}
                </div>

                {/* Message bubble */}
                <div className={`p-4 rounded-2xl ${
                  isModel 
                    ? 'bg-slate-100/50 dark:bg-emerald-950/10 border border-slate-200/50 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-none' 
                    : 'bg-emerald-500 text-white rounded-tr-none shadow-md shadow-emerald-500/10'
                }`}>
                  <div className="space-y-0.5">
                    {isModel ? (
                      formatText(msg.text)
                    ) : (
                      <p className="text-xs md:text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Loader bubble */}
          {loading && (
            <div className="flex gap-3 max-w-[70%] self-start">
              <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 border bg-emerald-500/10 border-emerald-500/20 text-emerald-500">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-slate-100/50 dark:bg-emerald-950/10 border border-slate-200/50 dark:border-slate-800 p-4 rounded-2xl rounded-tl-none flex items-center gap-1.5">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </div>
            </div>
          )}
          <div ref={threadEndRef} />
        </div>

        {/* Text Input area */}
        <form onSubmit={handleSend} className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex gap-3 items-center shrink-0">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={loading}
            placeholder="Ask your AI coach about your logs..."
            className="flex-1 px-4 py-3 bg-slate-50 dark:bg-emerald-950/10 border border-slate-200 dark:border-slate-800/80 rounded-xl text-slate-800 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:border-emerald-500 transition-colors"
          />
          <button
            type="submit"
            disabled={loading || !inputText.trim()}
            className="bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-200 dark:disabled:bg-slate-800 text-white p-3 rounded-xl shadow-lg shadow-emerald-500/5 transition-all duration-200 transform active:scale-95 cursor-pointer shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

    </div>
  );
}
