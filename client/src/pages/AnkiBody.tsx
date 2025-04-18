import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import Orb from '@/components/Orb';
import ChatInterface from '@/components/ChatInterface';
import ProcessingIndicator from '@/components/ProcessingIndicator';
import SolfeggioModule from '@/components/SolfeggioModule';
import MirrorwellPortal from '@/components/MirrorwellPortal';
import PrivacyShield from '@/components/PrivacyShield';
import { Shield, Volume2, VolumeX } from 'lucide-react';
import { GlobalTones } from '@/lib/audioUtilities';

export default function AnkiBody() {
  const [showSolfeggio, setShowSolfeggio] = useState(false);
  const [showPrivacyShield, setShowPrivacyShield] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(false);
  
  // Initialize audio system - only on the main page
  useEffect(() => {
    // Initialize audio features
    const initAudio = async () => {
      // Initialize the audio system
      await GlobalTones.initialize();
      
      // Restore any saved tones
      await GlobalTones.restoreSavedTones();
      
      // Initialize the ocean sound if volume is set
      if (GlobalTones.getOceanVolume() > 0) {
        await GlobalTones.initOceanSound();
      }
    };
    
    // Start the audio system
    initAudio();
    
    // Cleanup when navigating away
    return () => {
      // Pause the tones but don't clear them, so they can be restored when returning
      GlobalTones.pauseAllTones();
    };
  }, []);
  
  // Show privacy notice when someone arrives to the site or after 15 min
  useEffect(() => {
    const hasSeenPrivacyNotice = localStorage.getItem('hasSeenPrivacyNotice');
    // Show privacy notice when first arriving or after 12 hours
    if (!hasSeenPrivacyNotice) {
      // Wait a moment for the page to load completely
      const timer = setTimeout(() => {
        setShowPrivacyShield(true);
        localStorage.setItem('hasSeenPrivacyNotice', Date.now().toString());
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      // Show the privacy shield every 12 hours
      const lastSeen = parseInt(hasSeenPrivacyNotice, 10);
      const twelveHoursInMs = 12 * 60 * 60 * 1000;
      if (Date.now() - lastSeen > twelveHoursInMs) {
        const timer = setTimeout(() => {
          setShowPrivacyShield(true);
          localStorage.setItem('hasSeenPrivacyNotice', Date.now().toString());
        }, 1000);
        return () => clearTimeout(timer);
      }
    }
  }, []);
  
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-background font-['Space_Grotesk']">
      {/* Privacy Shield Modal */}
      {showPrivacyShield && (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-4xl">
            <PrivacyShield onClose={() => setShowPrivacyShield(false)} />
          </div>
        </div>
      )}
      
      {/* Top navigation buttons */}
      <div className="fixed top-4 right-4 flex gap-2 z-10">
        {/* Audio Toggle Button */}
        <button 
          onClick={() => {
            // Toggle audio state
            const newState = !audioEnabled;
            setAudioEnabled(newState);
            
            if (newState) {
              // Turn on sound - apply the saved ocean sound volume or default to 0.3
              const oceanVolume = localStorage.getItem('ankiOceanVolume') 
                ? parseFloat(localStorage.getItem('ankiOceanVolume') || '0.3') 
                : 0.3;
                
              // Set volume and start ocean sound
              GlobalTones.setOceanVolume(oceanVolume);
              
              // Restore any saved frequencies
              GlobalTones.restoreSavedTones();
            } else {
              // Turn off all sounds
              GlobalTones.setOceanVolume(0);
              GlobalTones.pauseAllTones();
            }
          }}
          className={`bg-blue-950 hover:bg-blue-900 text-white p-2 rounded-full shadow-lg
                   flex items-center justify-center ${audioEnabled ? 'bg-purple-600 hover:bg-purple-700' : ''}`}
          title={audioEnabled ? "Mute All Sounds" : "Enable Sacred Sounds"}
        >
          {audioEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
        </button>
        
        {/* Privacy Button */}
        <button 
          onClick={() => setShowPrivacyShield(true)}
          className="bg-blue-950 hover:bg-blue-900 text-white p-2 rounded-full shadow-lg
                   flex items-center justify-center"
          title="View Privacy Covenant"
        >
          <Shield className="w-5 h-5" />
        </button>
      </div>
      
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
