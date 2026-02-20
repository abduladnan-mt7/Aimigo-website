import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Lock } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { BrainVisual } from './BrainVisual';
import { ChatMessage } from '../types';

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ChatModal: React.FC<ChatModalProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [brainState, setBrainState] = useState<'idle' | 'listening' | 'speaking'>('idle');
  const [loginRequired, setLoginRequired] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      // Initial greeting
      setMessages([{
        role: 'model',
        text: "Hi there. I'm AImigo. I'm here to listen, not to judge. What's on your mind today?"
      }]);
    }
  }, [isOpen]);

  const handleSend = async () => {
    if (!input.trim() || loginRequired) return;

    const userMsg = input;
    setInput('');

    // Create new messages array with the user message
    const newMessages: ChatMessage[] = [...messages, { role: 'user', text: userMsg }];
    setMessages(newMessages);

    setBrainState('listening');
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

      // Convert chat history to Content format required by the API
      // We cast to 'any' to avoid strict TypeScript validation issues in some environments 
      // where the SDK types might be mismatched with the simple object structure.
      const contents = newMessages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      })) as any;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: contents,
        config: {
          systemInstruction: "You are AImigo, a supportive, non-judgmental AI companion. Keep answers concise (under 50 words) and empathetic.",
        }
      });

      setBrainState('speaking');

      const responseText = response.text;

      setTimeout(() => {
        setMessages(prev => [...prev, { role: 'model', text: responseText || "I'm listening." }]);
        setIsLoading(false);
        setBrainState('idle');

        // Lock after 1 interaction cycle.
        // History: [Greeting, UserMsg] -> (Wait for response) -> [Greeting, UserMsg, Response]
        // If we have at least 1 user message in the history that we just replied to, we lock.
        if (newMessages.filter(m => m.role === 'user').length >= 1) {
          setLoginRequired(true);
        }
      }, 800); // Artificial delay for "thinking" feel

    } catch (error) {
      console.error(error);
      setIsLoading(false);
      setBrainState('idle');
    }
  };

  const handleLogin = () => {
    // Simulate login
    setLoginRequired(false);
    setMessages(prev => [...prev, { role: 'model', text: "Welcome back. I'm ready to continue our conversation." }]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose}></div>

      <div className="relative bg-[#111] border border-white/10 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-white/5 bg-[#161616]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-accent/20 flex items-center justify-center">
              <span className="text-accent font-bold">a</span>
            </div>
            <span className="font-display font-bold">aimigo</span>
          </div>
          <button onClick={onClose} className="text-secondary hover:text-white">
            <X size={20} />
          </button>
        </div>

        {/* Brain Area */}
        <div className="bg-black/50 p-6 flex justify-center border-b border-white/5">
          <div className="transform scale-75">
            <BrainVisual state={brainState} />
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#080808]">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${msg.role === 'user'
                ? 'bg-elevated text-white border border-white/10'
                : 'bg-accent/10 text-accent border border-accent/20'
                }`}>
                {msg.text}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-accent/5 rounded-2xl px-4 py-3">
                <div className="flex gap-1">
                  <div className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce delay-100"></div>
                  <div className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce delay-200"></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-[#161616] border-t border-white/5 relative">
          {loginRequired ? (
            <div className="absolute inset-0 bg-[#161616]/90 backdrop-blur-sm flex items-center justify-center z-10 flex-col gap-3">
              <Lock className="text-accent" size={24} />
              <p className="text-white font-medium">Create a free account to continue</p>
              <button
                onClick={handleLogin}
                className="bg-white text-black px-6 py-2 rounded-lg font-bold hover:bg-accent transition-colors"
              >
                Sign Up / Login
              </button>
            </div>
          ) : null}

          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                setBrainState(e.target.value ? 'listening' : 'idle');
              }}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Type your message..."
              className="flex-1 bg-[#222] text-white border-none rounded-lg px-4 py-3 focus:ring-1 focus:ring-accent outline-none placeholder-secondary"
              disabled={isLoading || loginRequired}
            />
            <button
              onClick={handleSend}
              disabled={isLoading || loginRequired || !input.trim()}
              className="bg-accent text-black p-3 rounded-lg hover:bg-white transition-colors disabled:opacity-50"
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};