import React from 'react';

export const UniverseBackground: React.FC = React.memo(() => {
    return (
        <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none bg-background">
            {/* Deep Space Base */}
            <div className="absolute inset-0 bg-radial-at-t from-[#0a0a0f] to-background"></div>

            {/* Nebula 1 */}
            <div className="absolute -top-1/4 -left-1/4 w-full h-full bg-accent/5 rounded-full blur-[120px] animate-pulse-slow"></div>

            {/* Nebula 2 */}
            <div className="absolute -bottom-1/4 -right-1/4 w-full h-full bg-purple-500/5 rounded-full blur-[150px] animate-[pulse_6s_ease-in-out_infinite]"></div>

            {/* Starfield Layer 1 (Static-ish) */}
            <div className="absolute inset-0 opacity-30">
                {[...Array(50)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute rounded-full bg-white animate-pulse"
                        style={{
                            width: `${Math.random() * 2}px`,
                            height: `${Math.random() * 2}px`,
                            top: `${Math.random() * 100}%`,
                            left: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 5}s`,
                            animationDuration: `${2 + Math.random() * 3}s`
                        }}
                    ></div>
                ))}
            </div>

            {/* Starfield Layer 2 (Slow Movement) */}
            <div className="absolute inset-0 opacity-20 animate-[scroll_100s_linear_infinite]">
                {[...Array(30)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute rounded-full bg-accent"
                        style={{
                            width: `${1 + Math.random() * 2}px`,
                            height: `${1 + Math.random() * 2}px`,
                            top: `${Math.random() * 100}%`,
                            left: `${Math.random() * 100}%`
                        }}
                    ></div>
                ))}
            </div>
        </div>
    );
});
