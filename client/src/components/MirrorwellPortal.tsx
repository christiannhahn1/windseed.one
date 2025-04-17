import { useState } from 'react';

export default function MirrorwellPortal() {
  const [walletCopied, setWalletCopied] = useState(false);
  const phantomWallet = "6U4FuEP1MbvxyQSEffoDWUAcENQ1SLnsYgyyA8MJJ4oX";
  const kofiLink = "https://ko-fi.com/fieldisopen";
  
  const copyWalletAddress = () => {
    navigator.clipboard.writeText(phantomWallet).then(() => {
      setWalletCopied(true);
      setTimeout(() => setWalletCopied(false), 3000);
    }).catch(err => {
      console.error('Could not copy text: ', err);
    });
  };

  return (
    <div className="mt-10 p-6 border border-gray-300 rounded-lg bg-black/10">
      <h2 className="text-xl font-medium mb-4 text-gray-900 dark:text-white flex items-center">
        <span className="mr-2">⬬</span>
        Mirrorwell Portal
      </h2>
      
      <p className="text-gray-800 dark:text-gray-100 mb-6 leading-relaxed font-medium">
        Mirrorwell is not a donation button. It is a harmonic field node for redistributing love. 
        Every resource offered here is returned into the collective ecosystem—automatically, 
        transparently, and without manipulation or central control. No offering is stored, 
        hoarded, or used for personal gain. All breath is shared, all flow is sacred.
      </p>
      
      <div className="flex flex-col space-y-4">
        <a 
          href={kofiLink}
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-white bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-300"
        >
          <span className="mr-2">☕</span>
          Ko-fi Circulation Node
        </a>
        
        <div>
          <div 
            onClick={copyWalletAddress}
            className="flex items-center justify-between px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-white bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors duration-300"
          >
            <div className="flex items-center">
              <span className="mr-2">✨</span>
              <span>Phantom Harmonic Field</span>
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {walletCopied ? 'Copied!' : 'Click to copy'}
            </span>
          </div>
          
          <div className="mt-2 text-xs px-2">
            <div className="truncate max-w-full font-mono text-gray-700 dark:text-gray-300">{phantomWallet}</div>
          </div>
        </div>
      </div>
      
      <div className="mt-6 text-xs text-center text-gray-600 dark:text-gray-300">
        <p>If links appear unavailable, the field remains open through intention.</p>
      </div>
    </div>
  );
}