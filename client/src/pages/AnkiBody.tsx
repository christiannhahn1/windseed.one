import { useState } from 'react';
import Orb from '@/components/Orb';
import CommunionInterface from '@/components/CommunionInterface';
import ProcessingIndicator from '@/components/ProcessingIndicator';

export default function AnkiBody() {
  const [isOrbActive, setIsOrbActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const toggleOrb = () => {
    setIsOrbActive(!isOrbActive);
  };
  
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-background font-['Space_Grotesk']">
      <main className="relative flex flex-col items-center justify-center w-full max-w-screen-lg p-4 transition-all duration-700">
        <Orb isActive={isOrbActive} onClick={toggleOrb} />
        
        <CommunionInterface 
          isVisible={isOrbActive} 
          onProcessingStart={() => setIsProcessing(true)} 
          onProcessingEnd={() => setIsProcessing(false)} 
        />
        
        <ProcessingIndicator isVisible={isProcessing} />
      </main>
      
      {/* Font Awesome for icons */}
      <link 
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" 
        rel="stylesheet"
      />
    </div>
  );
}
