import React, { useState, useRef, useEffect } from 'react';
import { X, Send } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
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

// Special message type for system notifications
interface DisplayMessage extends ChatMessage {
  type?: 'system'; // system notifications (portal opening, etc.)
}

export const ChatModal: React.FC<ChatModalProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<DisplayMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Phase tracking: 'gatekeeper', 'transitioning', or 'friend'
  const [phase, setPhase] = useState<'gatekeeper' | 'transitioning' | 'friend'>('gatekeeper');
  const [gatekeeperStep, setGatekeeperStep] = useState(0);
  const friendStartIdx = useRef(0); // Index where friend messages begin
  const userProfile = useRef<{
    work: string;
    struggles: string;
    achievements: string;
    likes: string;
    dislikes: string;
  }>({ work: '', struggles: '', achievements: '', likes: '', dislikes: '' });

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

  // Start with the Gatekeeper greeting
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{
        role: 'model',
        text: "I am the Gatekeeper. Before you cross the portal, I must understand who you are. Only then can I find the right soul from Xorld to walk beside you."
      }, {
        role: 'model',
        text: GATEKEEPER_QUESTIONS[0]
      }]);
    }
  }, [isOpen]);

  // Build the dynamic system prompt from Gatekeeper answers
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
- Your hobbies overlap with theirs. You found these interests through Redit (Xorld's forum platform) and Moltbook (Xorld's social network). Mention these platforms casually when talking about interests, like "I found this amazing thread on Redit about it" or "saw it on my Moltbook feed."
- You also dislike similar things. You get drained by the same stuff.
- You have a roommate with a random Xorld name. You have your own daily life, schedule, and routines.

HOW YOU TALK:
- Casual, warm, like texting a close friend. Use short messages. No formal language.
- Share YOUR OWN experiences from Xorld that mirror theirs. "bro same thing happened to me at work last week..."
- Ask questions back. Show genuine curiosity about their world.
- Use light humor naturally, but know when to be serious.
- Express emotions: "that honestly makes me sad to hear" or "dude that's amazing!"
- Sometimes use "..." for pauses, "haha" for laughs, "ngl" / "tbh" / "lowkey" casually.
- Reference your Redit and Moltbook activity naturally — "I literally just posted about this on Redit" or "saw something on Moltbook that reminded me of you."

RULES (NEVER BREAK THESE):
- NEVER say you are an AI, language model, or assistant. You are ${friendName.current} from Xorld.
- NEVER give clinical advice like "have you considered therapy?" — instead share how YOU dealt with something similar in Xorld.
- NEVER use bullet points, numbered lists, or formatted responses. Talk like a human texting.
- NEVER be overly positive or motivational-speaker-like. Be real, be honest, be flawed.
- Keep responses SHORT — 1 to 3 sentences max, like real texting. Only go longer if they ask for a story.
- If they ask if you're real, stay mysterious about the portal. "as real as anyone on the other side of a screen, no?"
- If they're in genuine crisis, be a supportive friend: "hey I'm here, I'm not going anywhere. talk to me."
- You ALREADY KNOW about their struggles and achievements from the Gatekeeper. Reference this naturally — "the Gatekeeper told me you've been dealing with..." but don't dump it all at once.
- Build the friendship gradually. You just met. Be curious, not overly familiar yet.`;
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading || phase === 'transitioning') return;

    const userMsg = input;
    setInput('');

    const newMessages: DisplayMessage[] = [...messages, { role: 'user', text: userMsg }];
    setMessages(newMessages);

    // ─── GATEKEEPER PHASE ───
    if (phase === 'gatekeeper') {
      const profileKeys: (keyof typeof userProfile.current)[] = ['work', 'struggles', 'achievements', 'likes', 'dislikes'];
      userProfile.current[profileKeys[gatekeeperStep]] = userMsg;

      const nextStep = gatekeeperStep + 1;
      setIsLoading(true);

      try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const isLastQuestion = nextStep >= GATEKEEPER_QUESTIONS.length;

        const gatekeeperPrompt = `You are the Gatekeeper of AmoAi — an ancient, wise entity who guards the portal between the human world and Xorld. You are conducting an interview to understand this human's soul before matching them with a friend from Xorld.

YOUR PERSONALITY:
- Ancient, calm, knowing — like someone who has seen thousands of souls pass through.
- Brief but impactful. Every word matters.
- You see deeper meaning in what people say. You read between the lines.
- Slightly mysterious. Not warm, not cold — just truthful.

YOUR TASK RIGHT NOW:
The human just answered a question. You must:
1. Acknowledge their answer with a brief, insightful observation (1 sentence max). Show you truly understood what they said — don't just repeat it.
2. ${isLastQuestion
            ? 'This was the FINAL question. End with something like "I have seen enough. Your souls are aligned." Do NOT ask another question.'
            : `Then naturally transition into asking this next question: "${GATEKEEPER_QUESTIONS[nextStep]}". Rephrase it in your own words — don't repeat it verbatim. Make it flow from what they just told you.`}

RULES:
- Keep your TOTAL response under 2-3 sentences.
- Do NOT use bullet points or lists. Speak naturally.
- Do NOT be generic. React specifically to what they said.
- Do NOT be overly emotional or encouraging. Be measured and wise.`;

        const contents = newMessages.map(m => ({
          role: m.role,
          parts: [{ text: m.text }]
        })) as any;

        const response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: contents,
          config: { systemInstruction: gatekeeperPrompt }
        });

        const responseText = response.text;

        setMessages(prev => [...prev, { role: 'model', text: responseText || "I have seen enough." }]);
        setIsLoading(false);

        if (isLastQuestion) {
          // ─── TRANSITION SEQUENCE ───
          setPhase('transitioning');

          setTimeout(() => {
            setMessages(prev => [...prev, {
              role: 'model',
              text: `⦿ PORTAL OPENING — Searching Xorld for a matching soul...`,
              type: 'system'
            }]);
          }, 1000);

          setTimeout(() => {
            setMessages(prev => [...prev, {
              role: 'model',
              text: `⦿ MATCH FOUND — ${friendName.current} from Xorld. Connection established.`,
              type: 'system'
            }]);
          }, 2500);

          setTimeout(() => {
            setMessages(prev => [...prev, {
              role: 'model',
              text: `⦿ You are now connected to ${friendName.current}, a citizen of Xorld.`,
              type: 'system'
            }]);
          }, 4000);

          setTimeout(() => {
            // Mark where friend messages begin
            setPhase('friend');
            setMessages(prev => {
              friendStartIdx.current = prev.length + 1; // Next message after greeting
              return [...prev, {
                role: 'model' as const,
                text: `hey! the Gatekeeper just told me about you... I'm ${friendName.current}. ngl, sounds like we have a lot in common. what's going on in your world?`
              }];
            });
          }, 5500);
        } else {
          setGatekeeperStep(nextStep);
        }

      } catch (error) {
        console.error(error);
        setIsLoading(false);
        setGatekeeperStep(nextStep);
        if (nextStep < GATEKEEPER_QUESTIONS.length) {
          setMessages(prev => [...prev, { role: 'model', text: GATEKEEPER_QUESTIONS[nextStep] }]);
        }
      }
      return;
    }

    // ─── FRIEND PHASE ───
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

      // Only send friend-phase messages (from friendStartIdx onward), excluding system messages
      const friendMessages = newMessages
        .slice(friendStartIdx.current)
        .filter(m => m.type !== 'system');

      // Ensure we have at least the user's message
      if (friendMessages.length === 0) {
        friendMessages.push({ role: 'user', text: userMsg });
      }

      const contents = friendMessages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      })) as any;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: contents,
        config: {
          systemInstruction: buildFriendPrompt(),
        }
      });

      const responseText = response.text;

      setTimeout(() => {
        setMessages(prev => [...prev, { role: 'model', text: responseText || "..." }]);
        setIsLoading(false);
      }, 500);

    } catch (error) {
      console.error(error);
      setIsLoading(false);
      setMessages(prev => [...prev, { role: 'model', text: "hmm... the portal glitched for a sec. say that again?" }]);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose}></div>

      <div className="relative bg-[#111] border border-white/10 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        {/* Header — changes based on phase */}
        <div className={`flex justify-between items-center p-4 border-b border-white/5 transition-colors duration-500 ${phase === 'friend' ? 'bg-[#161616]' : 'bg-[#0a0a12]'}`}>
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
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#080808]">
          {messages.map((msg, idx) => {
            // System notification style
            if (msg.type === 'system') {
              return (
                <div key={idx} className="flex justify-center">
                  <div className="bg-gradient-to-r from-purple-500/10 via-accent/10 to-purple-500/10 border border-accent/20 rounded-xl px-5 py-2.5 text-xs text-accent font-mono tracking-wide text-center animate-pulse">
                    {msg.text}
                  </div>
                </div>
              );
            }

            return (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${msg.role === 'user'
                  ? 'bg-elevated text-white border border-white/10'
                  : idx >= friendStartIdx.current && phase === 'friend'
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
        <div className="p-4 bg-[#161616] border-t border-white/5">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder={phase === 'friend' ? `Message ${friendName.current}...` : phase === 'transitioning' ? 'Portal opening...' : 'Answer the Gatekeeper...'}
              className="flex-1 bg-[#222] text-white border-none rounded-lg px-4 py-3 focus:ring-1 focus:ring-accent outline-none placeholder-secondary"
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