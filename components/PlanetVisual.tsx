import React, { useState } from 'react';

interface PlanetVisualProps {
    isVisible?: boolean;
}

export const PlanetVisual: React.FC<PlanetVisualProps> = React.memo(({ isVisible = true }) => {
    const [iframeLoaded, setIframeLoaded] = useState(false);

    return (
        <div className={`relative w-[30vw] h-[30vw] md:w-[40vw] md:h-[40vw] max-w-[800px] max-h-[800px] flex items-center justify-start pointer-events-none select-none overflow-visible transition-opacity duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
            {/* 
                Deep Universe Atmosphere Glow 
            */}
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[110%] h-[110%] bg-blue-600/15 blur-[12vw] rounded-r-full mix-blend-screen opacity-60"></div>
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-cyan-400/10 blur-[8vw] rounded-r-full mix-blend-screen animate-pulse delay-700"></div>

            {/* Neptune Hemisphere Shell */}
            <div
                className="relative w-full h-full z-10 overflow-hidden bg-black/5 backdrop-blur-sm border-r border-white/5"
                style={{
                    clipPath: 'inset(-50% -100% -50% 0% round 0 100% 100% 0)',
                    borderRadius: '0 50vw 50vw 0'
                }}
            >
                {/* 3D Model - Lazy loaded */}
                <div className={`absolute inset-0 transform scale-[2.2] -translate-x-1/2 pointer-events-none transition-opacity duration-700 ${iframeLoaded ? 'opacity-100' : 'opacity-0'}`}>
                    <iframe
                        title="Neptune"
                        frameBorder="0"
                        allowFullScreen
                        allow="autoplay; fullscreen; xr-spatial-tracking"
                        src="https://sketchfab.com/models/2a6f9ccc5c724a709912774caa197b77/embed?autostart=1&preload=1&transparent=1&ui_hint=0&ui_infos=0&ui_stop=0&ui_watermark_link=0&ui_watermark=0&autospin=1"
                        className="w-full h-full pointer-events-none"
                        onLoad={() => setIframeLoaded(true)}
                    ></iframe>
                </div>

                {/* Internal Shading */}
                <div className="absolute inset-y-[-10%] left-[-10%] right-0 bg-gradient-to-r from-black/80 via-transparent to-transparent pointer-events-none z-20"></div>
                <div className="absolute inset-0 bg-gradient-to-b from-blue-900/5 via-transparent to-black/20 pointer-events-none z-20"></div>
            </div>

            {/* Edge Seamless Mask: Forces the left edge to blend 100% into the side of the screen */}
            <div className="absolute left-0 inset-y-[-20%] w-[8vw] bg-gradient-to-r from-black via-black/40 to-transparent z-30 pointer-events-none"></div>

            {/* Cinematic Orbital Arcs - Aligned to the Planet's scale */}
            <div className="absolute left-[-30%] w-[200%] h-[200%] border-r-[2px] border-t-[1px] border-cyan-400/5 rounded-full rotate-[12deg] animate-[spin_240s_linear_infinite] opacity-30 mix-blend-screen filter blur-[1px]"></div>
            <div className="absolute left-[-25%] w-[180%] h-[180%] border-r-[1px] border-b-[1px] border-white/5 rounded-full rotate-[-18deg] animate-[spin_350s_linear_infinite_reverse] opacity-15 mix-blend-screen"></div>

            {/* Star Particles - Dynamic Twinkle */}
            <div className="absolute inset-y-[-20%] left-0 w-full z-0 pointer-events-none">
                {[...Array(30)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute w-[1.5px] h-[1.5px] bg-white rounded-full animate-twinkle opacity-40 shadow-[0_0_8px_rgba(255,255,255,0.6)]"
                        style={{
                            top: `${Math.random() * 100}%`,
                            left: `${Math.random() * 80}%`,
                            animationDelay: `${Math.random() * 10}s`,
                        }}
                    ></div>
                ))}
            </div>
        </div>
    );
});
