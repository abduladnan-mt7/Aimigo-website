import React, { useState } from 'react';
import { X, User, Mail, Phone, Target, Send } from 'lucide-react';

interface WaitlistModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const WaitlistModal: React.FC<WaitlistModalProps> = ({ isOpen, onClose }) => {
    const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setStatus('submitting');

        const formData = new FormData(e.currentTarget);
        formData.append("access_key", "a8692f23-a26a-4581-b627-0c471e4a02a7");
        formData.append("subject", "New Waitlist Entry: aimigo");

        try {
            const response = await fetch("https://api.web3forms.com/submit", {
                method: "POST",
                body: formData
            });

            const data = await response.json();

            if (response.ok) {
                setStatus('success');
            } else {
                setErrorMessage(data.message || "Something went wrong.");
                setStatus('error');
            }
        } catch (error) {
            setErrorMessage("Network error. Please try again.");
            setStatus('error');
        }
    };

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose}></div>

            <div className="relative bg-[var(--card)] border border-[var(--border)] w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
                {status === 'success' ? (
                    <div className="p-12 text-center">
                        <div className="w-20 h-20 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Send className="text-accent" size={32} />
                        </div>
                        <h2 className="text-3xl font-display font-bold mb-4">You're in the Loop.</h2>
                        <p className="text-secondary mb-8">
                            We've reserved your spot. Watch your inbox for a transmission from the future.
                        </p>
                        <button
                            onClick={onClose}
                            className="w-full bg-accent text-black font-bold py-4 rounded-xl hover:bg-white transition-colors"
                        >
                            Return to Universe
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="flex justify-between items-center p-6 border-b border-[var(--border)]">
                            <h2 className="text-2xl font-display font-bold">Join the Intelligence.</h2>
                            <button onClick={onClose} className="text-secondary hover:text-white">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-8 space-y-6">
                            {status === 'error' && (
                                <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 text-sm rounded-xl">
                                    {errorMessage}
                                </div>
                            )}
                            <div className="space-y-4">
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary" size={18} />
                                    <input
                                        required
                                        name="name"
                                        type="text"
                                        placeholder="Full Name"
                                        className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl py-4 pl-12 pr-4 outline-none focus:border-accent transition-colors text-[var(--foreground)]"
                                    />
                                </div>

                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary" size={18} />
                                    <input
                                        required
                                        name="email"
                                        type="email"
                                        placeholder="Email Address"
                                        className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl py-4 pl-12 pr-4 outline-none focus:border-accent transition-colors text-[var(--foreground)]"
                                    />
                                </div>

                                <div className="relative">
                                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary" size={18} />
                                    <input
                                        required
                                        name="phone"
                                        type="tel"
                                        placeholder="Phone Number"
                                        className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl py-4 pl-12 pr-4 outline-none focus:border-accent transition-colors text-[var(--foreground)]"
                                    />
                                </div>

                                <div className="relative">
                                    <Target className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary" size={18} />
                                    <select
                                        required
                                        name="goal"
                                        className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl py-4 pl-12 pr-4 outline-none focus:border-accent transition-colors appearance-none text-[var(--foreground)]"
                                    >
                                        <option value="" disabled selected>Primary Goal with aimigo?</option>
                                        <option value="growth">Personal Growth</option>
                                        <option value="mental">Mental Health & Support</option>
                                        <option value="goals">Goal Accountability</option>
                                        <option value="future">Exploring Future Tech</option>
                                    </select>
                                </div>
                            </div>

                            <button
                                disabled={status === 'submitting'}
                                className="w-full bg-accent text-black font-bold py-5 rounded-xl hover:bg-white transition-all transform hover:scale-[1.02] active:scale-95 disabled:opacity-50"
                            >
                                {status === 'submitting' ? 'Transmitting Data...' : 'Join Waitlist'}
                            </button>

                            <p className="text-[10px] text-center text-secondary uppercase tracking-widest">
                                secured transmission to abduladnan007@gmail.com
                            </p>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
};
