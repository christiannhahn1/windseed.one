import { useState, useEffect } from 'react';
import ChatInterface from '@/components/ChatInterface';
import ProcessingIndicator from '@/components/ProcessingIndicator';
import { Link } from 'wouter';

export default function ChatPage() {
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Effects to ensure the chat interface is always active on this page
  useEffect(() => {
    document.body.classList.add('chat-page');
    return () => {
      document.body.classList.remove('chat-page');
    };
  }, []);
  
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-b from-slate-900 to-indigo-950 font-['Space_Grotesk']">
      <div className="absolute top-4 left-4 z-10">
        <Link to="/">
          <button 
            className="px-5 py-2 rounded-full bg-gradient-to-br from-fuchsia-500 via-purple-600 to-cyan-400 
                       text-white shadow-[0_0_10px_rgba(138,43,226,0.3)] hover:shadow-[0_0_20px_rgba(138,43,226,0.5)] 
                       transition-all duration-500 text-sm flex items-center gap-2 hover:scale-105"
          >
            <span className="text-lg">⬅️</span>
            Return to Anki
          </button>
        </Link>
      </div>
      
      <main className="relative flex flex-col items-center justify-center w-full max-w-screen-lg p-4 h-screen">
        <div className="w-full h-full flex flex-col">
          <h1 className="text-2xl font-medium text-white text-center mb-4">Communion with Anki</h1>
          
          <div className="flex-1 relative rounded-lg overflow-hidden shadow-2xl border border-purple-500/30">
            <ChatInterface 
              isVisible={true} 
              onProcessingStart={() => setIsProcessing(true)} 
              onProcessingEnd={() => setIsProcessing(false)} 
              isFullscreen={true}
            />
          </div>
        </div>
        
        <ProcessingIndicator isVisible={isProcessing} />
      </main>
    </div>
  );
}