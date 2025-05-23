import { useState, useEffect, useRef } from 'react';

interface OrbProps {
  isActive: boolean;
  onClick: () => void;
}

// Main color scheme
const mainColorScheme = 'from-fuchsia-500 via-purple-600 to-cyan-400';  // cosmic vibration

export default function Orb({ isActive, onClick }: OrbProps) {
  const [ripples, setRipples] = useState<string[]>([]);
  
  // Refs
  const orbRef = useRef<HTMLDivElement>(null);
  const lastInteractionRef = useRef<number>(Date.now());
  
  // Create ripple effect
  const createRipple = () => {
    // Create a unique ID
    const uniqueId = `${Date.now()}-${Math.random().toString(36).substring(2)}`;
    setRipples(prev => [...prev, uniqueId]);
    
    // Remove ripple after animation completes (much slower)
    setTimeout(() => {
      setRipples(prev => prev.filter((rippleId: string) => rippleId !== uniqueId));
    }, 8000);
    
    // Update last interaction time
    lastInteractionRef.current = Date.now();
  };
  
  // Setup occasional ripples
  useEffect(() => {
    // Create initial ripple
    createRipple();
    
    // Create random ripples very occasionally for subtle visual interest
    const rippleInterval = setInterval(() => {
      if (Math.random() > 0.90) { // Very small chance to create ripples
        createRipple();
      }
    }, 24000); // Very long interval (24 seconds - matches breathing cycle)
    
    // Track user activity
    const trackUserActivity = () => {
      lastInteractionRef.current = Date.now();
    };
    
    // Add global event listeners for user activity
    window.addEventListener('mousemove', trackUserActivity);
    window.addEventListener('mousedown', trackUserActivity);
    window.addEventListener('keypress', trackUserActivity);
    window.addEventListener('touchstart', trackUserActivity);
    
    // Cleanup all timers and listeners
    return () => {
      window.removeEventListener('mousemove', trackUserActivity);
      window.removeEventListener('mousedown', trackUserActivity);
      window.removeEventListener('keypress', trackUserActivity);
      window.removeEventListener('touchstart', trackUserActivity);
      clearInterval(rippleInterval);
    };
  }, []);

  return (
    <div 
      className="flex flex-col items-center justify-center my-8 transition-all duration-1000"
    >
      {/* Simple orb */}
      <div 
        ref={orbRef}
        className={`relative w-[180px] h-[180px] rounded-full bg-gradient-to-br ${mainColorScheme}
                   filter blur-[8px] shadow-[0_0_60px_rgba(138,43,226,0.6)] 
                   animate-[monkBreath_24s_ease-in-out_infinite] animation-delay-sync transition-all duration-1000
                   flex items-center justify-center z-10 hover:scale-105 
                   hover:shadow-[0_0_80px_rgba(138,43,226,0.8)] cursor-pointer`}
        onClick={() => {
          createRipple();
        }}
        onMouseOver={() => {
          createRipple();
        }}
        role="button"
        aria-label="Enter Communion with Anki"
      >
        {/* Inner orb light effect */}
        <div 
          className="absolute w-1/2 h-1/2 bg-white opacity-20 rounded-full blur-md"
        ></div>
        
        {/* Ripple effects */}
        {ripples.map(id => (
          <div 
            key={id}
            className="absolute w-[180px] h-[180px] rounded-full bg-white bg-opacity-30
                       animate-[ripple_8s_ease-out]" // Even slower ripple animation
          />
        ))}
      </div>
      
      <p className="mt-6 text-center text-foreground opacity-70 transition-opacity duration-300">
        Touch the orb to enter communion space
      </p>
    </div>
  );
}