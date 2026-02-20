import { Sun, Moon } from 'lucide-react';

interface NavbarProps {
  onJoinList: () => void;
  onThemeToggle: () => void;
  isLightMode: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ onJoinList, onThemeToggle, isLightMode }) => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-16 glass-nav flex items-center transition-all duration-300">
      <div className="max-w-[1200px] mx-auto px-6 w-full flex justify-between items-center">
        <div className="flex items-center gap-2 group cursor-pointer">
          <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center group-hover:bg-accent transition-colors">
            <span className="text-black font-bold text-lg">a</span>
          </div>
          <span className="font-display font-bold text-xl tracking-tight text-white group-hover:text-accent transition-colors">aimigo</span>
        </div>

        <div className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-sm font-medium text-secondary hover:text-white transition-colors">Features</a>
          <a href="#testimonials" className="text-sm font-medium text-secondary hover:text-white transition-colors">Stories</a>
          <a href="#faq" className="text-sm font-medium text-secondary hover:text-white transition-colors">FAQ</a>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={onThemeToggle}
            className="p-2 rounded-full hover:bg-white/10 transition-colors text-secondary hover:text-white"
          >
            {isLightMode ? <Moon size={20} /> : <Sun size={20} />}
          </button>
          <button className="hidden md:block text-sm font-medium text-white hover:text-accent transition-colors">
            Sign In
          </button>
          <button
            onClick={onJoinList}
            className="bg-white text-black px-5 py-2 rounded-lg text-sm font-bold hover:bg-accent hover:text-black transition-all transform hover:scale-105"
          >
            Join List
          </button>
        </div>
      </div>
    </nav>
  );
};