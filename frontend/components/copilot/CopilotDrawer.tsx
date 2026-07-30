'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUIStore } from '../../store/uiStore';
import { Bot, X, Send, Sparkles, User } from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

const PROMPT_PILLS = [
  'Why was Feeder F-04 flagged as critical?',
  'Show highest financial risk meters today',
  'Explain SHAP contribution for Meter #44822',
  'Summarize YTD revenue recovered',
];

export const CopilotDrawer: React.FC = () => {
  const { copilotOpen, toggleCopilot } = useUIStore();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-1',
      sender: 'assistant',
      text: 'Greetings, Operator. I am GridGuard AI Copilot. Ask me any question about live grid topology, SHAP anomaly root causes, or financial loss estimates.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = (textToSend?: string) => {
    const text = textToSend || input;
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setIsTyping(true);

    setTimeout(() => {
      let reply = 'Feeder F-04 currently has 3 downstream transformers showing 32% unmetered energy loss between 18:00 and 22:00. Transformer TR-102 accounts for 80% of this discrepancy due to suspected partial bypass at Meter #44822.';
      if (text.toLowerCase().includes('shap') || text.toLowerCase().includes('44822')) {
        reply = 'Meter #44822 has an overall risk score of 0.94. The top SHAP contributor is Evening Peak Consumption Drop (+0.42 risk contribution) combined with Active Phase Imbalance (+0.28 risk).';
      } else if (text.toLowerCase().includes('revenue') || text.toLowerCase().includes('ytd')) {
        reply = 'Total YTD revenue recovered stands at ₹1.24 Crore across 342 verified field audits with a 96.4% AI model precision score.';
      }

      const assistantMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: 'assistant',
        text: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, assistantMsg]);
      setIsTyping(false);
    }, 1000);
  };

  return (
    <AnimatePresence>
      {copilotOpen && (
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          className="fixed top-0 right-0 w-full sm:w-[400px] h-full bg-slate-950/95 backdrop-blur-xl border-l border-slate-800 z-50 flex flex-col shadow-xl"
        >
          {/* Header */}
          <div className="p-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-900/40">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-violet-950/60 border border-violet-500/30 text-violet-300">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-semibold text-xs text-white">GridGuard AI Copilot</h3>
                <p className="text-[10px] font-mono text-slate-400">TELEMETRY ASSISTANT</p>
              </div>
            </div>
            <button
              onClick={toggleCopilot}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 font-sans text-xs">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'assistant' && (
                  <div className="w-6 h-6 rounded-md bg-violet-950/80 border border-violet-500/30 text-violet-300 flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                )}
                <div
                  className={`p-3 rounded-xl max-w-[84%] leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-blue-600 text-white font-medium rounded-tr-none'
                      : 'glass-panel text-slate-200 border-slate-800 rounded-tl-none bg-slate-900/60'
                  }`}
                >
                  <p>{msg.text}</p>
                  <span className="text-[9px] font-mono text-slate-400 block text-right mt-1 opacity-70">
                    {msg.timestamp}
                  </span>
                </div>
                {msg.sender === 'user' && (
                  <div className="w-6 h-6 rounded-md bg-blue-950/80 border border-blue-500/30 text-blue-300 flex items-center justify-center shrink-0 mt-0.5">
                    <User className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            ))}
            {isTyping && (
              <div className="flex items-center gap-2 text-violet-400 font-mono text-[11px] py-1.5">
                <Sparkles className="w-3.5 h-3.5 animate-spin" />
                <span>Analyzing telemetry SHAP matrix...</span>
              </div>
            )}
          </div>

          {/* Quick Prompt Pills */}
          <div className="p-3 border-t border-slate-800/80 bg-slate-900/20 space-y-2">
            <p className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Suggested Queries</p>
            <div className="flex flex-wrap gap-1.5">
              {PROMPT_PILLS.map((pill, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(pill)}
                  className="text-[10px] text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 px-2.5 py-1 rounded-md text-left transition-colors"
                >
                  {pill}
                </button>
              ))}
            </div>
          </div>

          {/* Input Box */}
          <div className="p-3 border-t border-slate-800 bg-slate-950 flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask Copilot about grid anomalies..."
              className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-slate-700 font-sans"
            />
            <button
              onClick={() => handleSend()}
              className="p-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
