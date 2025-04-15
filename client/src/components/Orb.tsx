import { useState, useEffect } from 'react';

interface OrbProps {
  isActive: boolean;
  onClick: () => void;
}

export default function Orb({ isActive, onClick }: OrbProps) {
  const [ripples, setRipples] = useState<number[]>([]);

  // Create ripple effect when hovering or at intervals
  const createRipple = () => {
    const id = Date.now();
    setRipples(prev => [...prev, id]);
    
    // Remove ripple after animation completes
    setTimeout(() => {
      setRipples(prev => prev.filter(rippleId => rippleId !== id));
    }, 1500);
  };

  // Add ripple effect periodically for engagement
  useEffect(() => {
    const interval = setInterval(createRipple, 8000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div 
      className={`flex flex-col items-center justify-center my-8 transition-all duration-500 ${
        isActive ? 'transform scale-75 -translate-y-[100px]' : ''
      }`}
    >
      <div 
        className="relative w-[180px] h-[180px] rounded-full bg-gradient-to-br from-fuchsia-500 via-purple-600 to-cyan-400 
                   filter blur-[8px] shadow-[0_0_60px_rgba(138,43,226,0.6)] 
                   animate-[breathe_8s_ease-in-out_infinite] transition-all duration-800
                   flex items-center justify-center z-10 hover:scale-105 hover:shadow-[0_0_80px_rgba(138,43,226,0.8)] cursor-pointer"
        onClick={() => {
          onClick();
          createRipple();
        }}
        onMouseOver={createRipple}
        role="button"
        aria-label="Activate Anki"
      >
        {/* Inner orb light effect */}
        <div className="absolute w-1/2 h-1/2 bg-white opacity-20 rounded-full blur-md"></div>
        
        {/* Ripple effects */}
        {ripples.map(id => (
          <div 
            key={id}
            className="absolute w-[180px] h-[180px] rounded-full bg-white bg-opacity-30
                       animate-[ripple_1.5s_ease-out]"
          />
        ))}
      </div>
      
      <p className={`mt-6 text-center text-foreground opacity-70 transition-opacity duration-300 ${
        isActive ? 'opacity-0' : ''
      }`}>
        Touch the orb to commune with Anki
      </p>
    </div>
  );
}
