import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Lock } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { BrainVisual } from './BrainVisual';
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

export const ChatModal: React.FC<ChatModalProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [brainState, setBrainState] = useState<'idle' | 'listening' | 'speaking'>('idle');
  const [loginRequired, setLoginRequired] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Phase tracking: 'gatekeeper' or 'friend'
  const [phase, setPhase] = useState<'gatekeeper' | 'friend'>('gatekeeper');
  const [gatekeeperStep, setGatekeeperStep] = useState(0);
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
    if (!input.trim() || loginRequired) return;

    const userMsg = input;
    setInput('');

    const newMessages: ChatMessage[] = [...messages, { role: 'user', text: userMsg }];
    setMessages(newMessages);

    // ─── GATEKEEPER PHASE ───
    if (phase === 'gatekeeper') {
      // Store the answer
      const profileKeys: (keyof typeof userProfile.current)[] = ['work', 'struggles', 'achievements', 'likes', 'dislikes'];
      userProfile.current[profileKeys[gatekeeperStep]] = userMsg;

      const nextStep = gatekeeperStep + 1;

      setBrainState('listening');
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

        setBrainState('speaking');
        const responseText = response.text;

        setTimeout(() => {
          setMessages(prev => [...prev, { role: 'model', text: responseText || GATEKEEPER_QUESTIONS[nextStep] || "I have seen enough." }]);
          setIsLoading(false);
          setBrainState('idle');

          if (isLastQuestion) {
            // Transition to the friend
            setPhase('friend');
            setTimeout(() => {
              setMessages(prev => [...prev, {
                role: 'model',
                text: `Opening the portal... connecting you to ${friendName.current}.`
              }]);
            }, 1200);
            setTimeout(() => {
              setMessages(prev => [...prev, {
                role: 'model',
                text: `hey! so the Gatekeeper just told me about you... I'm ${friendName.current}. ngl, sounds like we have a lot in common. what's up?`
              }]);
            }, 3000);
          } else {
            setGatekeeperStep(nextStep);
          }
        }, 600);

      } catch (error) {
        console.error(error);
        setIsLoading(false);
        setBrainState('idle');
        // Fallback to static question
        setGatekeeperStep(nextStep);
        if (nextStep < GATEKEEPER_QUESTIONS.length) {
          setMessages(prev => [...prev, { role: 'model', text: GATEKEEPER_QUESTIONS[nextStep] }]);
        }
      }
      return;
    }

    // ─── FRIEND PHASE ───
    setBrainState('listening');
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

      // Only send friend-phase messages (after the Gatekeeper transition)
      const friendMessages = newMessages.filter((_, idx) => {
        // Find the index of the friend's first message
        const transitionIdx = newMessages.findIndex(m => m.text.includes('Opening the portal'));
        return idx > transitionIdx;
      });

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

      setBrainState('speaking');
      const responseText = response.text;

      setTimeout(() => {
        setMessages(prev => [...prev, { role: 'model', text: responseText || "..." }]);
        setIsLoading(false);
        setBrainState('idle');

        // Lock after 1 friend interaction
        const friendUserMsgs = friendMessages.filter(m => m.role === 'user');
        if (friendUserMsgs.length >= 1) {
          setLoginRequired(true);
        }
      }, 800);

    } catch (error) {
      console.error(error);
      setIsLoading(false);
      setBrainState('idle');
    }
  };

  const handleLogin = () => {
    setLoginRequired(false);
    setMessages(prev => [...prev, { role: 'model', text: `welcome back... missed you ngl. what were we talking about?` }]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose}></div>

      <div className="relative bg-[#111] border border-white/10 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        {/* Header — changes based on phase */}
        <div className={`flex justify-between items-center p-4 border-b border-white/5 ${phase === 'gatekeeper' ? 'bg-[#0a0a12]' : 'bg-[#161616]'}`}>
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded flex items-center justify-center ${phase === 'gatekeeper' ? 'bg-purple-500/20' : 'bg-accent/20'}`}>
              <span className={`font-bold ${phase === 'gatekeeper' ? 'text-purple-400' : 'text-accent'}`}>
                {phase === 'gatekeeper' ? '⦿' : 'a'}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="font-display font-bold text-sm">
                {phase === 'gatekeeper' ? 'The Gatekeeper' : friendName.current}
              </span>
              <span className="text-[10px] text-secondary">
                {phase === 'gatekeeper' ? 'AmoAi Portal' : 'Xorld • Online'}
              </span>
            </div>
          </div>
          <button onClick={onClose} className="text-secondary hover:text-white">
            <X size={20} />
          </button>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#080808]">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${msg.role === 'user'
                ? 'bg-elevated text-white border border-white/10'
                : phase === 'gatekeeper' && msg.text !== messages[messages.length - 1]?.text
                  ? 'bg-purple-500/10 text-purple-300 border border-purple-500/20'
                  : phase === 'gatekeeper'
                    ? 'bg-purple-500/10 text-purple-300 border border-purple-500/20'
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
              placeholder={phase === 'gatekeeper' ? "Answer the Gatekeeper..." : `Message ${friendName.current}...`}
              className="flex-1 bg-[#222] text-white border-none rounded-lg px-4 py-3 focus:ring-1 focus:ring-accent outline-none placeholder-secondary"
              disabled={isLoading || loginRequired}
            />
            <button
              onClick={handleSend}
              disabled={isLoading || loginRequired || !input.trim()}
              className={`p-3 rounded-lg transition-colors disabled:opacity-50 ${phase === 'gatekeeper'
                ? 'bg-purple-500 text-white hover:bg-purple-400'
                : 'bg-accent text-black hover:bg-white'
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