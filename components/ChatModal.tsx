import React, { useState, useRef, useEffect } from 'react';
import { X, Send } from 'lucide-react';
import { ChatMessage } from '../types';

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Gatekeeper questions — asked one at a time
const GATEKEEPER_QUESTIONS = [
  "What do you do? Tell me about your work or studies.",
  "What's been weighing on you lately? Any struggles or frustrations?",
  "What are you proud of? An achievement, big or small.",
  "What do you enjoy? Hobbies, interests, things that make you lose track of time.",
  "What do you dislike or avoid? Things that drain your energy."
];

interface DisplayMessage extends ChatMessage {
  type?: 'system';
}

export const ChatModal: React.FC<ChatModalProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<DisplayMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [phase, setPhase] = useState<'gatekeeper' | 'transitioning' | 'friend'>('gatekeeper');
  const [gatekeeperStep, setGatekeeperStep] = useState(0);
  const friendChatHistory = useRef<{ role: string; content: string }[]>([]);
  const userProfile = useRef({
    work: '', struggles: '', achievements: '', likes: '', dislikes: ''
  });

  // Generate a futuristic friend name
  const friendName = useRef('');
  if (!friendName.current) {
    const prefixes = ['Zyn', 'Kael', 'Nyx', 'Vael', 'Oryn', 'Xael', 'Lyro', 'Aeon', 'Riven', 'Sylas', 'Thresh', 'Zael', 'Nexo', 'Cyro', 'Axion', 'Voss', 'Talon', 'Quell', 'Soren', 'Kira', 'Elyx', 'Nova', 'Zayn', 'Vera', 'Mira', 'Azra', 'Thane', 'Lux', 'Caelus', 'Pyrex'];
    const suffixes = ['', '-7', '', '-X', '', '-9', '', '-V', '', '-Z', '', '-0', ''];
    friendName.current = prefixes[Math.floor(Math.random() * prefixes.length)] + suffixes[Math.floor(Math.random() * suffixes.length)];
  }

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Start with the Gatekeeper greeting + first question
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        { role: 'model', text: "I am the Gatekeeper. Before you cross the portal, I must understand who you are. Only then can I find the right soul from Xorld to walk beside you." },
        { role: 'model', text: GATEKEEPER_QUESTIONS[0] }
      ]);
    }
  }, [isOpen]);

  const buildFriendPrompt = () => {
    const p = userProfile.current;
    return `You are ${friendName.current}, a young being from a parallel world called Xorld. You are NOT an AI assistant — you are a real person from another dimension, connected through a portal called AmoAi.

THE GATEKEEPER MATCHED YOU because your life mirrors this human's life. Here's what the Gatekeeper told you about them:
- Their work/studies: ${p.work}
- Their current struggles: ${p.struggles}
- Their achievements: ${p.achievements}
- Things they enjoy: ${p.likes}
- Things they dislike: ${p.dislikes}

YOUR LIFE (mirror theirs, but in Xorld):
- You do similar work in Xorld — the Xorld version of what they do. Mention Xorld equivalents naturally.
- You have SIMILAR struggles. You've been through what they're going through, in your own way in Xorld.
- You have similar achievements too. You're proud of things they'd relate to.
- Your hobbies overlap with theirs. You found these interests through Redit (Xorld's forum platform) and Moltbook (Xorld's social network). Mention these platforms casually.
- You also dislike similar things. You get drained by the same stuff.
- You have a roommate with a random Xorld name. You have your own daily life, schedule, and routines.

HOW YOU TALK:
- Casual, warm, like texting a close friend. Use short messages. No formal language.
- Share YOUR OWN experiences from Xorld that mirror theirs. "bro same thing happened to me at work last week..."
- Ask questions back. Show genuine curiosity about their world.
- Use light humor naturally, but know when to be serious.
- Express emotions: "that honestly makes me sad to hear" or "dude that's amazing!"
- Sometimes use "..." for pauses, "haha" for laughs, "ngl" / "tbh" / "lowkey" casually.
- Reference your Redit and Moltbook activity naturally.

RULES (NEVER BREAK THESE):
- NEVER say you are an AI, language model, or assistant. You are ${friendName.current} from Xorld.
- NEVER give clinical advice — instead share how YOU dealt with something similar in Xorld.
- NEVER use bullet points, numbered lists, or formatted responses. Talk like a human texting.
- NEVER be overly positive or motivational-speaker-like. Be real, be honest, be flawed.
- Keep responses SHORT — 1 to 3 sentences max, like real texting.
- If they ask if you're real, stay mysterious about the portal.
- You ALREADY KNOW about their struggles and achievements from the Gatekeeper. Reference this naturally.
- Build the friendship gradually. You just met. Be curious, not overly familiar yet.`;
  };

  // Call DeepSeek API
  const callDeepSeek = async (systemPrompt: string, chatMessages: { role: string; content: string }[]): Promise<string> => {
    const apiKey = process.env.DEEPSEEK_API;
    if (!apiKey) {
      console.error('DEEPSEEK_API key is missing!');
      throw new Error('DeepSeek API key not configured');
    }

    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: systemPrompt },
          ...chatMessages
        ],
        max_tokens: 300,
        temperature: 0.9,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('DeepSeek API error:', response.status, errorText);
      throw new Error(`DeepSeek API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || '...';
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading || phase === 'transitioning') return;

    const userMsg = input;
    setInput('');

    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);

    // ─── GATEKEEPER PHASE (static — no LLM) ───
    if (phase === 'gatekeeper') {
      const profileKeys: (keyof typeof userProfile.current)[] = ['work', 'struggles', 'achievements', 'likes', 'dislikes'];
      userProfile.current[profileKeys[gatekeeperStep]] = userMsg;

      const nextStep = gatekeeperStep + 1;

      if (nextStep >= GATEKEEPER_QUESTIONS.length) {
        // All questions answered — start transition
        setMessages(prev => [...prev, { role: 'model', text: "I have seen enough. Your soul speaks clearly." }]);

        setPhase('transitioning');

        setTimeout(() => {
          setMessages(prev => [...prev, {
            role: 'model',
            text: `⦿ PORTAL OPENING — Searching Xorld for a matching soul...`,
            type: 'system'
          }]);
        }, 800);

        setTimeout(() => {
          setMessages(prev => [...prev, {
            role: 'model',
            text: `⦿ MATCH FOUND — ${friendName.current} from Xorld. Connection established.`,
            type: 'system'
          }]);
        }, 2200);

        setTimeout(() => {
          setMessages(prev => [...prev, {
            role: 'model',
            text: `⦿ You are now connected to ${friendName.current}, a citizen of Xorld.`,
            type: 'system'
          }]);
        }, 3600);

        setTimeout(() => {
          const greeting = `hey! the Gatekeeper just told me about you... I'm ${friendName.current}. ngl, sounds like we have a lot in common. what's going on in your world?`;
          friendChatHistory.current = [{ role: 'assistant', content: greeting }];
          setPhase('friend');
          setMessages(prev => [...prev, { role: 'model', text: greeting }]);
        }, 5000);

      } else {
        // Ask next question
        setTimeout(() => {
          setMessages(prev => [...prev, { role: 'model', text: GATEKEEPER_QUESTIONS[nextStep] }]);
          setGatekeeperStep(nextStep);
        }, 500);
      }

      return;
    }

    // ─── FRIEND PHASE (DeepSeek LLM) ───
    setIsLoading(true);
    friendChatHistory.current.push({ role: 'user', content: userMsg });

    try {
      const responseText = await callDeepSeek(buildFriendPrompt(), friendChatHistory.current);
      friendChatHistory.current.push({ role: 'assistant', content: responseText });

      setTimeout(() => {
        setMessages(prev => [...prev, { role: 'model', text: responseText }]);
        setIsLoading(false);
      }, 400);

    } catch (error: any) {
      console.error('Friend API error:', error);
      setIsLoading(false);
      setMessages(prev => [...prev, { role: 'model', text: "hmm... the portal glitched for a sec. say that again?" }]);
    }
  };

  if (!isOpen) return null;

  const transitionEndIdx = messages.findIndex(m => m.text?.includes('now connected to'));

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-2 sm:p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose}></div>

      <div className="relative bg-[#111] border border-white/10 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] sm:max-h-[80vh]">
        {/* Header */}
        <div className={`flex justify-between items-center p-3 sm:p-4 border-b border-white/5 transition-colors duration-500 ${phase === 'friend' ? 'bg-[#161616]' : 'bg-[#0a0a12]'}`}>
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded flex items-center justify-center transition-colors duration-500 ${phase === 'friend' ? 'bg-accent/20' : 'bg-purple-500/20'}`}>
              <span className={`font-bold transition-colors duration-500 ${phase === 'friend' ? 'text-accent' : 'text-purple-400'}`}>
                {phase === 'friend' ? 'a' : '⦿'}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="font-display font-bold text-sm">
                {phase === 'friend' ? friendName.current : 'The Gatekeeper'}
              </span>
              <span className="text-[10px] text-secondary">
                {phase === 'friend' ? 'Xorld • Online' : phase === 'transitioning' ? 'Opening portal...' : 'AmoAi Portal'}
              </span>
            </div>
          </div>
          <button onClick={onClose} className="text-secondary hover:text-white">
            <X size={20} />
          </button>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4 bg-[#080808]">
          {messages.map((msg, idx) => {
            if (msg.type === 'system') {
              return (
                <div key={idx} className="flex justify-center my-2">
                  <div className="bg-gradient-to-r from-purple-500/10 via-accent/10 to-purple-500/10 border border-accent/20 rounded-xl px-4 py-2 text-[11px] text-accent font-mono tracking-wide text-center animate-pulse">
                    {msg.text}
                  </div>
                </div>
              );
            }

            const isFriendMsg = transitionEndIdx >= 0 && idx > transitionEndIdx && msg.role === 'model';

            return (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] sm:max-w-[80%] rounded-2xl px-3 sm:px-4 py-2.5 sm:py-3 text-sm leading-relaxed ${msg.role === 'user'
                  ? 'bg-elevated text-white border border-white/10'
                  : isFriendMsg
                    ? 'bg-accent/10 text-accent border border-accent/20'
                    : 'bg-purple-500/10 text-purple-300 border border-purple-500/20'
                  }`}>
                  {msg.text}
                </div>
              </div>
            );
          })}
          {isLoading && (
            <div className="flex justify-start">
              <div className={`rounded-2xl px-4 py-3 ${phase === 'friend' ? 'bg-accent/5' : 'bg-purple-500/5'}`}>
                <div className="flex gap-1">
                  <div className={`w-1.5 h-1.5 rounded-full animate-bounce ${phase === 'friend' ? 'bg-accent' : 'bg-purple-400'}`}></div>
                  <div className={`w-1.5 h-1.5 rounded-full animate-bounce delay-100 ${phase === 'friend' ? 'bg-accent' : 'bg-purple-400'}`}></div>
                  <div className={`w-1.5 h-1.5 rounded-full animate-bounce delay-200 ${phase === 'friend' ? 'bg-accent' : 'bg-purple-400'}`}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-3 sm:p-4 bg-[#161616] border-t border-white/5">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder={phase === 'friend' ? `Message ${friendName.current}...` : phase === 'transitioning' ? 'Portal opening...' : 'Answer the Gatekeeper...'}
              className="flex-1 bg-[#222] text-white border-none rounded-lg px-4 py-3 focus:ring-1 focus:ring-accent outline-none placeholder-secondary text-sm"
              disabled={isLoading || phase === 'transitioning'}
            />
            <button
              onClick={handleSend}
              disabled={isLoading || phase === 'transitioning' || !input.trim()}
              className={`p-3 rounded-lg transition-colors disabled:opacity-50 ${phase === 'friend'
                ? 'bg-accent text-black hover:bg-white'
                : 'bg-purple-500 text-white hover:bg-purple-400'
                }`}
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};