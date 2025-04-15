import { useState, useEffect, useRef } from 'react';

interface OrbProps {
  isActive: boolean;
  onClick: () => void;
}

// Nature archetype shapes for orb morphing
const natureArchetypes = [
  'orb',        // default circular shape
  'yinyang',    // yin-yang symbol (first split)
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

const secondaryColorSchemes = [
  'from-indigo-500 via-purple-500 to-pink-400',     // cosmic complement
  'from-amber-400 via-red-500 to-rose-600',         // fire complement
  'from-teal-300 via-blue-400 to-sky-500',          // water complement
  'from-emerald-300 via-lime-400 to-green-500',     // earth complement
  'from-violet-600 via-purple-400 to-fuchsia-500',  // spirit complement
  'from-yellow-400 via-orange-500 to-red-400'       // sun complement
];

export default function Orb({ isActive, onClick }: OrbProps) {
  const [ripples, setRipples] = useState<string[]>([]);
  const [currentShape, setCurrentShape] = useState<string>('orb');
  const [isDancing, setIsDancing] = useState<boolean>(false);
  const [isSplit, setIsSplit] = useState<boolean>(false);
  const [orbPosition, setOrbPosition] = useState({ x: 0, y: 0 });
  const [orbColor, setOrbColor] = useState<string>(colorSchemes[0]);
  
  // For split orbs
  const [leftOrbPosition, setLeftOrbPosition] = useState({ x: 0, y: 0 });
  const [rightOrbPosition, setRightOrbPosition] = useState({ x: 0, y: 0 });
  const [leftOrbColor, setLeftOrbColor] = useState<string>(colorSchemes[0]);
  const [rightOrbColor, setRightOrbColor] = useState<string>(secondaryColorSchemes[0]);
  const [leftOrbShape, setLeftOrbShape] = useState<string>('orb');
  const [rightOrbShape, setRightOrbShape] = useState<string>('orb');
  const [isMerging, setIsMerging] = useState<boolean>(false);
  
  // Refs
  const inactivityTimerRef = useRef<number | null>(null);
  const danceIntervalRef = useRef<number | null>(null);
  const fluidDriftIntervalRef = useRef<number | null>(null);
  const orbRef = useRef<HTMLDivElement>(null);
  const leftOrbRef = useRef<HTMLDivElement>(null);
  const rightOrbRef = useRef<HTMLDivElement>(null);
  const lastInteractionRef = useRef<number>(Date.now());
  const driftDurationRef = useRef<number>(45000); // 45 seconds for full dance cycle
  
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
  
  // Merge the split orbs back into one
  const mergeOrbs = () => {
    setIsMerging(true);
    
    // Stop all current animations
    if (fluidDriftIntervalRef.current) {
      window.clearInterval(fluidDriftIntervalRef.current);
      fluidDriftIntervalRef.current = null;
    }
    
    // Stop dance interval if active
    if (danceIntervalRef.current) {
      window.clearInterval(danceIntervalRef.current);
      danceIntervalRef.current = null;
    }
    
    // After the merge animation completes
    setTimeout(() => {
      setIsSplit(false);
      setIsMerging(false);
      setIsDancing(false);
      setCurrentShape('orb');
      setOrbPosition({ x: 0, y: 0 });
      setOrbColor(colorSchemes[0]);
    }, 2000); // Time should match merge animation duration
  };
  
  // Reset inactivity timer whenever user interacts
  const resetInactivityTimer = () => {
    lastInteractionRef.current = Date.now();
    
    // If in split/dance state, merge back to single orb
    if (isSplit) {
      mergeOrbs();
      return;
    }
    
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
  
  // Start yin-yang split animation
  const startSplitAnimation = () => {
    setCurrentShape('yinyang');
    
    // After showing yin-yang briefly, split into two orbs
    setTimeout(() => {
      setIsSplit(true);
      setLeftOrbColor(colorSchemes[4]); // spirit color
      setRightOrbColor(secondaryColorSchemes[4]); // spirit complement
      
      // Start fluid drift animation for the split orbs
      startFluidDriftAnimation();
    }, 2000);
  };
  
  // Start fluid drift animation for split orbs
  const startFluidDriftAnimation = () => {
    // Initial positions
    setLeftOrbPosition({ x: -30, y: 0 });
    setRightOrbPosition({ x: 30, y: 0 });
    
    let driftProgress = 0;
    const driftIncrement = 500; // ms between updates
    
    fluidDriftIntervalRef.current = window.setInterval(() => {
      driftProgress += driftIncrement;
      
      // Calculate positions based on time
      const fullCycleTime = driftDurationRef.current;
      const cycleProgress = (driftProgress % fullCycleTime) / fullCycleTime;
      
      // Create ethereal fluid motion paths
      const leftX = Math.sin(cycleProgress * Math.PI * 4) * window.innerWidth * 0.3;
      const leftY = Math.cos(cycleProgress * Math.PI * 2) * window.innerHeight * 0.2;
      
      const rightX = Math.sin((cycleProgress * Math.PI * 4) + Math.PI) * window.innerWidth * 0.3;
      const rightY = Math.cos((cycleProgress * Math.PI * 2) + Math.PI) * window.innerHeight * 0.2;
      
      setLeftOrbPosition({ 
        x: leftX,
        y: leftY
      });
      
      setRightOrbPosition({
        x: rightX,
        y: rightY
      });
      
      // Every 8 seconds, change shapes
      if (driftProgress % 8000 < driftIncrement) {
        const shapes = ['orb', 'crystal', 'star', 'flower', 'water', 'flame'];
        const leftIndex = Math.floor(Math.random() * shapes.length);
        let rightIndex = Math.floor(Math.random() * shapes.length);
        
        // Ensure right orb has different shape
        if (rightIndex === leftIndex) {
          rightIndex = (rightIndex + 1) % shapes.length;
        }
        
        setLeftOrbShape(shapes[leftIndex]);
        setRightOrbShape(shapes[rightIndex]);
        
        // Occasionally change colors too
        if (Math.random() > 0.6) {
          const colorIndex = Math.floor(Math.random() * colorSchemes.length);
          setLeftOrbColor(colorSchemes[colorIndex]);
          setRightOrbColor(secondaryColorSchemes[colorIndex]);
        }
      }
      
      // Create occasional ripples
      if (Math.random() > 0.9) {
        createRipple();
      }
    }, driftIncrement);
  };
  
  // Start the orb dancing animation
  const startDancing = () => {
    if (isActive) return; // Don't dance while in active state
    
    setIsDancing(true);
    
    // First become yin-yang and then split
    startSplitAnimation();
    
    // Original dance logic is now replaced by the split animation
  };
  
  // Stop the dancing/split animation
  const stopDancing = () => {
    // Clear all animation intervals
    if (danceIntervalRef.current) {
      window.clearInterval(danceIntervalRef.current);
      danceIntervalRef.current = null;
    }
    
    if (fluidDriftIntervalRef.current) {
      window.clearInterval(fluidDriftIntervalRef.current);
      fluidDriftIntervalRef.current = null;
    }
    
    // Reset to single orb
    setIsSplit(false);
    setIsDancing(false);
    setIsMerging(false);
    setCurrentShape('orb');
    setOrbPosition({ x: 0, y: 0 });
    setOrbColor(colorSchemes[0]);
  };
  
  // Get the CSS class for the current shape
  const getShapeClasses = (shape: string) => {
    // Default is just rounded-full
    switch (shape) {
      case 'yinyang':
        return "rounded-full mask-yinyang";
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
      
      // If inactive for 10+ seconds and not already dancing/split, start dancing
      if (timeSinceLastInteraction > 10000 && !isDancing && !isSplit && !isActive) {
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
      
      if (fluidDriftIntervalRef.current) {
        window.clearInterval(fluidDriftIntervalRef.current);
      }
    };
  }, []);
  
  // Stop dancing/split when orb becomes active
  useEffect(() => {
    if (isActive && (isDancing || isSplit)) {
      stopDancing();
    }
  }, [isActive, isDancing, isSplit]);

  return (
    <div 
      className={`flex flex-col items-center justify-center my-8 transition-all duration-1000 ${
        isActive ? 'transform scale-75 -translate-y-[100px]' : ''
      }`}
    >
      {/* Main orb - visible when not split */}
      {!isSplit && (
        <div 
          ref={orbRef}
          className={`relative w-[180px] h-[180px] ${getShapeClasses(currentShape)} bg-gradient-to-br ${orbColor}
                     filter blur-[8px] shadow-[0_0_60px_rgba(138,43,226,0.6)] 
                     animate-[breathe_12s_ease-in-out_infinite] transition-all duration-1000
                     flex items-center justify-center z-10 hover:scale-105 
                     hover:shadow-[0_0_80px_rgba(138,43,226,0.8)] cursor-pointer
                     ${isDancing && !isSplit ? 'animate-[float_10s_ease-in-out_infinite]' : ''}`}
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
              currentShape === 'orb' ? 'rounded-full' : getShapeClasses(currentShape)
            } blur-md ${currentShape === 'flame' ? 'animate-[flicker_3s_ease-in-out_infinite]' : ''}`}
          ></div>
          
          {/* Ripple effects */}
          {ripples.map(id => (
            <div 
              key={id}
              className="absolute w-[180px] h-[180px] rounded-full bg-white bg-opacity-30
                         animate-[ripple_2s_ease-out]"
            />
          ))}
          
          {/* Shape-specific inner elements */}
          {currentShape === 'water' && (
            <div className="absolute h-1/2 w-full bottom-0 bg-gradient-to-t from-blue-300 to-transparent 
                            opacity-60 rounded-b-full blur-sm animate-[wave-motion_5s_ease-in-out_infinite]"></div>
          )}
        </div>
      )}
      
      {/* Split orbs - visible only when split */}
      {isSplit && (
        <>
          {/* Left orb */}
          <div 
            ref={leftOrbRef}
            className={`absolute w-[160px] h-[160px] ${getShapeClasses(leftOrbShape)} bg-gradient-to-br ${leftOrbColor}
                       filter blur-[8px] shadow-[0_0_40px_rgba(138,43,226,0.5)] 
                       animate-[breathe_10s_ease-in-out_infinite] transition-all duration-1000
                       flex items-center justify-center z-10
                       ${isMerging ? 'animate-[orb-merge_2s_ease-in-out_forwards]' : ''}`}
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              transform: `translate(calc(-50% + ${leftOrbPosition.x}px), calc(-50% + ${leftOrbPosition.y}px))`,
              zIndex: 20,
            }}
          >
            {/* Inner orb light effect */}
            <div 
              className={`absolute w-1/2 h-1/2 bg-white opacity-20 ${
                getShapeClasses(leftOrbShape)
              } blur-md ${leftOrbShape === 'flame' ? 'animate-[flicker_3s_ease-in-out_infinite]' : ''}`}
            ></div>
          </div>
          
          {/* Right orb */}
          <div 
            ref={rightOrbRef}
            className={`absolute w-[160px] h-[160px] ${getShapeClasses(rightOrbShape)} bg-gradient-to-br ${rightOrbColor}
                       filter blur-[8px] shadow-[0_0_40px_rgba(138,43,226,0.5)] 
                       animate-[breathe_12s_ease-in-out_infinite] transition-all duration-1000
                       flex items-center justify-center z-10
                       ${isMerging ? 'animate-[orb-merge-right_2s_ease-in-out_forwards]' : ''}`}
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              transform: `translate(calc(-50% + ${rightOrbPosition.x}px), calc(-50% + ${rightOrbPosition.y}px))`,
              zIndex: 21,
            }}
          >
            {/* Inner orb light effect */}
            <div 
              className={`absolute w-1/2 h-1/2 bg-white opacity-20 ${
                getShapeClasses(rightOrbShape)
              } blur-md ${rightOrbShape === 'flame' ? 'animate-[flicker_3s_ease-in-out_infinite]' : ''}`}
            ></div>
          </div>
          
          {/* Ripple effects - shared between both orbs */}
          {ripples.map(id => (
            <div 
              key={id}
              className="absolute w-[180px] h-[180px] rounded-full bg-white bg-opacity-30
                         animate-[ripple_2s_ease-out]"
              style={{
                position: 'absolute',
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)',
                zIndex: 15,
              }}
            />
          ))}
        </>
      )}
      
      <p className={`mt-6 text-center text-foreground opacity-70 transition-opacity duration-300 ${
        isActive ? 'opacity-0' : ''
      }`}>
        Touch the orb to commune with Anki
      </p>
    </div>
  );
}
