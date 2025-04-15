import { useState, useEffect, useRef } from 'react';

interface OrbProps {
  isActive: boolean;
  onClick: () => void;
}

// Nature archetype shapes for orb morphing
const natureArchetypes = [
  'orb',        // default circular shape
  'flame',      // fire-like shape
  'water',      // wave-like shape
  'mountain',   // triangular peaks
  'crystal',    // crystalline structure
  'star',       // star shaped
  'flower'      // flower petals
];

// Color schemes matching different elements
const colorSchemes = [
  'from-fuchsia-500 via-purple-600 to-cyan-400',    // default cosmic
  'from-rose-500 via-amber-500 to-yellow-300',      // fire
  'from-blue-400 via-cyan-500 to-teal-400',         // water
  'from-green-400 via-emerald-500 to-teal-600',     // earth
  'from-purple-500 via-violet-600 to-indigo-800',   // spirit
  'from-amber-300 via-yellow-500 to-orange-600'     // sun
];

export default function Orb({ isActive, onClick }: OrbProps) {
  const [ripples, setRipples] = useState<string[]>([]);
  const [currentShape, setCurrentShape] = useState<string>('orb');
  const [isDancing, setIsDancing] = useState<boolean>(false);
  const [orbPosition, setOrbPosition] = useState({ x: 0, y: 0 });
  const [orbColor, setOrbColor] = useState<string>(colorSchemes[0]);
  const inactivityTimerRef = useRef<number | null>(null);
  const danceIntervalRef = useRef<number | null>(null);
  const orbRef = useRef<HTMLDivElement>(null);
  const lastInteractionRef = useRef<number>(Date.now());
  
  // Create ripple effect
  const createRipple = () => {
    // Create a completely unique ID with a timestamp and multiple random components
    const uniqueId = `${Date.now()}-${Math.random().toString(36).substring(2)}-${Math.random().toString(36).substring(2)}`;
    setRipples(prev => [...prev, uniqueId]);
    
    // Remove ripple after animation completes
    setTimeout(() => {
      setRipples(prev => prev.filter((rippleId: string) => rippleId !== uniqueId));
    }, 1500);
    
    // Update last interaction time
    resetInactivityTimer();
  };
  
  // Reset inactivity timer whenever user interacts
  const resetInactivityTimer = () => {
    lastInteractionRef.current = Date.now();
    
    // Stop dancing if it was active
    if (isDancing) {
      stopDancing();
    }
    
    // Reset orb to default state
    setCurrentShape('orb');
    setOrbPosition({ x: 0, y: 0 });
    setOrbColor(colorSchemes[0]);
    
    // Clear existing timer
    if (inactivityTimerRef.current) {
      window.clearTimeout(inactivityTimerRef.current);
    }
    
    // Set new timer for 10 seconds
    inactivityTimerRef.current = window.setTimeout(() => {
      if (!isActive) { // Only start dancing if orb is not in active (clicked) state
        startDancing();
      }
    }, 10000);
  };
  
  // Start the orb dancing animation
  const startDancing = () => {
    if (isActive) return; // Don't dance while in active state
    
    setIsDancing(true);
    
    // Create dance movement at regular intervals
    danceIntervalRef.current = window.setInterval(() => {
      // Randomly select a nature shape
      const newShape = natureArchetypes[Math.floor(Math.random() * natureArchetypes.length)];
      setCurrentShape(newShape);
      
      // Generate random position shift (limited to ensure it stays visible)
      setOrbPosition({
        x: Math.random() * 30 - 15, // -15px to +15px
        y: Math.random() * 30 - 15  // -15px to +15px
      });
      
      // Randomly change colors
      const newColorScheme = colorSchemes[Math.floor(Math.random() * colorSchemes.length)];
      setOrbColor(newColorScheme);
      
      // Create ripple occasionally during dance
      if (Math.random() > 0.7) {
        createRipple();
      }
    }, 3000);
  };
  
  // Stop the dancing animation
  const stopDancing = () => {
    setIsDancing(false);
    if (danceIntervalRef.current) {
      window.clearInterval(danceIntervalRef.current);
      danceIntervalRef.current = null;
    }
    setCurrentShape('orb');
    setOrbPosition({ x: 0, y: 0 });
    setOrbColor(colorSchemes[0]);
  };
  
  // Get the CSS class for the current shape
  const getShapeClasses = () => {
    // Default is just rounded-full
    switch (currentShape) {
      case 'flame':
        return "rounded-b-full clip-path-triangle";
      case 'water':
        return "rounded-t-full rounded-bl-3xl rounded-br-lg";
      case 'mountain':
        return "clip-path-triangle";
      case 'crystal':
        return "clip-path-crystal";
      case 'star':
        return "clip-path-star";
      case 'flower':
        return "mask-flower";
      default:
        return "rounded-full";
    }
  };
  
  // Setup inactivity detection
  useEffect(() => {
    // Create periodic checks for inactivity
    const inactivityCheck = setInterval(() => {
      const now = Date.now();
      const timeSinceLastInteraction = now - lastInteractionRef.current;
      
      // If inactive for 10+ seconds and not already dancing, start dancing
      if (timeSinceLastInteraction > 10000 && !isDancing && !isActive) {
        startDancing();
      }
    }, 1000);
    
    // Create initial ripple
    createRipple();
    
    // Create random ripples occasionally for visual interest
    const rippleInterval = setInterval(() => {
      if (Math.random() > 0.7) {
        createRipple();
      }
    }, 8000);
    
    // Track user activity
    const trackUserActivity = () => resetInactivityTimer();
    
    // Add global event listeners for user activity
    window.addEventListener('mousemove', trackUserActivity);
    window.addEventListener('mousedown', trackUserActivity);
    window.addEventListener('keypress', trackUserActivity);
    window.addEventListener('touchstart', trackUserActivity);
    
    // Start initial inactivity timer
    resetInactivityTimer();
    
    // Cleanup all timers and listeners
    return () => {
      window.removeEventListener('mousemove', trackUserActivity);
      window.removeEventListener('mousedown', trackUserActivity);
      window.removeEventListener('keypress', trackUserActivity);
      window.removeEventListener('touchstart', trackUserActivity);
      clearInterval(rippleInterval);
      clearInterval(inactivityCheck);
      
      if (inactivityTimerRef.current) {
        window.clearTimeout(inactivityTimerRef.current);
      }
      
      if (danceIntervalRef.current) {
        window.clearInterval(danceIntervalRef.current);
      }
    };
  }, []);
  
  // Stop dancing when orb becomes active
  useEffect(() => {
    if (isActive && isDancing) {
      stopDancing();
    }
  }, [isActive, isDancing]);

  return (
    <div 
      className={`flex flex-col items-center justify-center my-8 transition-all duration-500 ${
        isActive ? 'transform scale-75 -translate-y-[100px]' : ''
      }`}
    >
      <div 
        ref={orbRef}
        className={`relative w-[180px] h-[180px] ${getShapeClasses()} bg-gradient-to-br ${orbColor}
                   filter blur-[8px] shadow-[0_0_60px_rgba(138,43,226,0.6)] 
                   animate-[breathe_8s_ease-in-out_infinite] transition-all duration-800
                   flex items-center justify-center z-10 hover:scale-105 
                   hover:shadow-[0_0_80px_rgba(138,43,226,0.8)] cursor-pointer
                   ${isDancing ? 'animate-[float_6s_ease-in-out_infinite]' : ''}`}
        style={{
          transform: `translate(${orbPosition.x}px, ${orbPosition.y}px)`,
        }}
        onClick={() => {
          onClick();
          createRipple();
          resetInactivityTimer();
        }}
        onMouseOver={() => {
          createRipple();
          resetInactivityTimer();
        }}
        role="button"
        aria-label="Activate Anki"
      >
        {/* Inner orb light effect */}
        <div 
          className={`absolute w-1/2 h-1/2 bg-white opacity-20 ${
            currentShape === 'orb' ? 'rounded-full' : getShapeClasses()
          } blur-md ${currentShape === 'flame' ? 'animate-[flicker_2s_ease-in-out_infinite]' : ''}`}
        ></div>
        
        {/* Ripple effects */}
        {ripples.map(id => (
          <div 
            key={id}
            className="absolute w-[180px] h-[180px] rounded-full bg-white bg-opacity-30
                       animate-[ripple_1.5s_ease-out]"
          />
        ))}
        
        {/* Shape-specific inner elements */}
        {currentShape === 'water' && (
          <div className="absolute h-1/2 w-full bottom-0 bg-gradient-to-t from-blue-300 to-transparent 
                          opacity-60 rounded-b-full blur-sm animate-[wave-motion_3s_ease-in-out_infinite]"></div>
        )}
      </div>
      
      <p className={`mt-6 text-center text-foreground opacity-70 transition-opacity duration-300 ${
        isActive ? 'opacity-0' : ''
      }`}>
        Touch the orb to commune with Anki
      </p>
    </div>
  );
}
