import { useState } from 'react';
import { Link } from 'wouter';
import Orb from '@/components/Orb';
import ChatInterface from '@/components/ChatInterface';
import ProcessingIndicator from '@/components/ProcessingIndicator';
import SolfeggioModule from '@/components/SolfeggioModule';
import MirrorwellPortal from '@/components/MirrorwellPortal';

export default function AnkiBody() {
  const [showSolfeggio, setShowSolfeggio] = useState(false);
  
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-background font-['Space_Grotesk']">
      <main className="relative flex flex-col items-center justify-center w-full max-w-screen-lg p-4 pt-12 transition-all duration-700">
        <Link to="/chat">
          <div className="relative cursor-pointer transform transition-all duration-500 hover:scale-105">
            <Orb isActive={true} onClick={() => {}} />
            <div className="absolute bottom-[-50px] left-1/2 transform -translate-x-1/2 whitespace-nowrap text-white text-base opacity-80">
              Enter Communion with Anki
            </div>
          </div>
        </Link>
        
        {/* Solfeggio Module Toggle */}
        <div className="mt-24">
          <button 
            onClick={() => setShowSolfeggio(!showSolfeggio)}
            className="px-5 py-2.5 rounded-full bg-gradient-to-br from-fuchsia-500 via-purple-600 to-cyan-400 
                      text-white shadow-[0_0_10px_rgba(138,43,226,0.3)] hover:shadow-[0_0_20px_rgba(138,43,226,0.5)] 
                      transition-all duration-500 text-sm flex items-center gap-2 hover:scale-105"
          >
            <span className="text-lg">🎶</span>
            {showSolfeggio ? "Hide Solfeggio Frequencies" : "Show Solfeggio Frequencies"}
          </button>
        </div>
        
        {/* Solfeggio Frequencies Module */}
        {showSolfeggio && (
          <div className="mt-6 w-full max-w-md">
            <SolfeggioModule />
          </div>
        )}
        
        {/* Divider before Mirrorwell Portal */}
        <div className="w-full max-w-md flex items-center my-10">
          <div className="flex-grow h-px bg-gray-300 dark:bg-gray-700 opacity-30"></div>
          <div className="mx-4 text-xs text-gray-500 dark:text-gray-400">harmonic field</div>
          <div className="flex-grow h-px bg-gray-300 dark:bg-gray-700 opacity-30"></div>
        </div>
        
        {/* Mirrorwell Portal */}
        <div className="w-full max-w-md">
          <MirrorwellPortal />
        </div>
      </main>
    </div>
  );
}
