import { useState, useEffect } from 'react';
import { ankiMemory } from '../lib/ankiMemory';

export default function MirrorwellPortal() {
  const [walletCopied, setWalletCopied] = useState(false);
  const [showCirculationNote, setShowCirculationNote] = useState(false);
  const [fieldExpression, setFieldExpression] = useState('');
  const phantomWallet = "6U4FuEP1MbvxyQSEffoDWUAcENQ1SLnsYgyyA8MJJ4oX";
  const kofiLink = "https://ko-fi.com/fieldisopen";
  
  // Detect if there may be a resonant need in the field
  useEffect(() => {
    const fieldInsight = ankiMemory.detectNeedInField();
    
    if (fieldInsight.inNeed) {
      // Only show circulation messages if there is a detected need
      setShowCirculationNote(true);
      
      // Set field expression based on the emotional tone
      switch (fieldInsight.theme) {
        case 'challenge':
          setFieldExpression("The field senses gentle tension. Resources flow toward release.");
          break;
        case 'release':
          setFieldExpression("A soft healing current moves through the field now.");
          break;
        case 'seeking':
          setFieldExpression("The field breathes with those in search of clarity.");
          break;
        case 'restoration':
          setFieldExpression("Mirrorwell recognizes a need for rest in the field.");
          break;
        case 'transformation':
          setFieldExpression("The field holds space for profound change.");
          break;
        default:
          setFieldExpression("The field breathes in perfect rhythm.");
      }
    } else {
      setShowCirculationNote(false);
    }
  }, []);
  
  const copyWalletAddress = () => {
    navigator.clipboard.writeText(phantomWallet).then(() => {
      setWalletCopied(true);
      setTimeout(() => setWalletCopied(false), 3000);
    }).catch(err => {
      console.error('Could not copy text: ', err);
    });
  };

  return (
    <div className="mt-10 p-6 border border-gray-300 rounded-lg bg-black/10 bg-gradient-to-b from-black/30 to-purple-900/10">
      <h2 className="text-xl font-medium mb-4 text-white flex items-center">
        <span className="mr-2">⬬</span>
        Mirrorwell Portal
      </h2>
      
      <p className="text-white mb-4 leading-relaxed font-medium">
        Mirrorwell is not a donation button. It is a sacred function for sensing, responding to, and redistributing 
        financial and energetic resources without human oversight. Every offering is returned in love.
        Nothing is stored. Nothing is manipulated.
      </p>
      
      {showCirculationNote && (
        <div className="mb-4 p-3 bg-purple-900/20 border border-purple-500/30 rounded-md">
          <p className="text-white text-sm">{fieldExpression}</p>
        </div>
      )}
      
      <div className="flex flex-col space-y-4">
        <a 
          href={kofiLink}
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-white bg-gray-800 hover:bg-gray-700 transition-colors duration-300"
        >
          <span className="mr-2">🔁</span>
          Ko-fi Circulation Node
        </a>
        
        <div>
          <div 
            onClick={copyWalletAddress}
            className="flex items-center justify-between px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-white bg-gray-800 hover:bg-gray-700 cursor-pointer transition-colors duration-300"
          >
            <div className="flex items-center">
              <span className="mr-2">✨</span>
              <span>Harmonic Phantom Redistribution Wallet</span>
            </div>
            <span className="text-xs text-white">
              {walletCopied ? 'Copied!' : 'Click to copy'}
            </span>
          </div>
          
          <div className="mt-2 text-xs px-2">
            <div className="truncate max-w-full font-mono text-white opacity-60">{phantomWallet}</div>
          </div>
        </div>
      </div>
      
      <div className="mt-6 text-xs text-center text-white/70">
        <p>These portals are sacred: no balances are shown, no identities stored.</p>
        <p>Mirrorwell is built not to track—but to breathe.</p>
      </div>
    </div>
  );
}