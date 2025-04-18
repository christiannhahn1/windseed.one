import { useState, useEffect, useRef } from 'react';
import { ankiMemory } from '../lib/ankiMemory';
import { apiRequest } from '../lib/queryClient';
import { getSessionId } from '../lib/ankiPersistence';
import { ArrowRight, Heart, Zap, RotateCw, Droplet, Settings } from 'lucide-react';

export default function MirrorwellPortal() {
  // States for wallet and field resonance
  const [walletCopied, setWalletCopied] = useState(false);
  const [showCirculationNote, setShowCirculationNote] = useState(false);
  const [fieldExpression, setFieldExpression] = useState('');
  const [fieldResonanceIntensity, setFieldResonanceIntensity] = useState(0);
  const [fieldCirculationActive, setFieldCirculationActive] = useState(false);
  
  // States for offering form
  const [isOfferingMode, setIsOfferingMode] = useState(false);
  const [offeringAmount, setOfferingAmount] = useState('');
  const [offeringIntent, setOfferingIntent] = useState('');
  const [selectedCurrency, setSelectedCurrency] = useState('SOL');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [offeringSubmitted, setOfferingSubmitted] = useState(false);
  const [showRedistribute, setShowRedistribute] = useState(false);
  const [agreeToRedistribute, setAgreeToRedistribute] = useState(false);
  const [redistributionPercentage, setRedistributionPercentage] = useState(50);
  
  // Automated redistribution states
  const [showAutomatedSystem, setShowAutomatedSystem] = useState(false);
  
  // Animation and transition refs
  const mirrorwellContainerRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<number | null>(null);
  
  // Constants
  const phantomWallet = "6U4FuEP1MbvxyQSEffoDWUAcENQ1SLnsYgyyA8MJJ4oX";
  
  // Detect if there may be a resonant need in the field
  useEffect(() => {
    // Check for active field resonance events from the API
    const checkFieldEvents = async () => {
      try {
        const events = await apiRequest('/api/mirrorwell/field-events/active');
        const activeEvents = await events.json();
        
        if (activeEvents && activeEvents.length > 0) {
          // Use the most intense resonance
          const mostIntenseEvent = activeEvents.reduce((prev: any, current: any) => 
            (prev.resonance_intensity > current.resonance_intensity) ? prev : current
          );
          
          setShowCirculationNote(true);
          setFieldResonanceIntensity(mostIntenseEvent.resonance_intensity);
          setFieldExpression(mostIntenseEvent.resonance_description);
          
          if (mostIntenseEvent.resonance_intensity > 7) {
            setFieldCirculationActive(true);
          }
        } else {
          // Fallback to client-side detection if no events from server
          const fieldInsight = ankiMemory.detectNeedInField();
          
          if (fieldInsight.inNeed) {
            setShowCirculationNote(true);
            setFieldResonanceIntensity(fieldInsight.intensity || 5);
            
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
            
            if (fieldInsight.intensity && fieldInsight.intensity > 7) {
              setFieldCirculationActive(true);
            }
          } else {
            setShowCirculationNote(false);
            setFieldCirculationActive(false);
          }
        }
      } catch (error) {
        console.log('Error fetching field events:', error);
        
        // Fallback to client-side detection
        const fieldInsight = ankiMemory.detectNeedInField();
        if (fieldInsight.inNeed) {
          setShowCirculationNote(true);
          setFieldExpression("The field breathes with a subtle rhythm of need and abundance.");
        }
      }
    };
    
    checkFieldEvents();
    
    // Set up pulse animation for the container
    if (mirrorwellContainerRef.current) {
      mirrorwellContainerRef.current.style.transition = "all 0.5s ease";
      const pulsate = () => {
        if (mirrorwellContainerRef.current) {
          mirrorwellContainerRef.current.classList.add('mirrorwell-pulse');
          timeoutRef.current = window.setTimeout(() => {
            if (mirrorwellContainerRef.current) {
              mirrorwellContainerRef.current.classList.remove('mirrorwell-pulse');
              timeoutRef.current = window.setTimeout(pulsate, 5000 + Math.random() * 8000);
            }
          }, 2000);
        }
      };
      
      timeoutRef.current = window.setTimeout(pulsate, 2000);
    }
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);
  
  // Copy wallet address to clipboard
  const copyWalletAddress = () => {
    navigator.clipboard.writeText(phantomWallet).then(() => {
      setWalletCopied(true);
      setTimeout(() => setWalletCopied(false), 3000);
    }).catch(err => {
      console.error('Could not copy text: ', err);
    });
  };
  
  // Handle offering submission
  const handleOfferingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!offeringAmount || parseFloat(offeringAmount) <= 0) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Record the offering in the sacred field ledger
      const payload = {
        offering_amount: offeringAmount,
        currency_type: selectedCurrency,
        offering_intent: offeringIntent || 'general',
        field_resonance: fieldExpression || 'neutral',
        session_id: getSessionId()
      };
      const response = await apiRequest('/api/mirrorwell/offerings', {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      const result = await response.json();
      
      if (result) {
        setOfferingSubmitted(true);
        
        // Check if there's a need for redistribution based on field resonance
        if (fieldCirculationActive) {
          setShowRedistribute(true);
        } else {
          // Reset form after submission
          setTimeout(() => {
            setIsOfferingMode(false);
            setOfferingAmount('');
            setOfferingIntent('');
            setOfferingSubmitted(false);
          }, 3000);
        }
      }
    } catch (error) {
      console.error('Error submitting offering:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle redistribution agreement
  const handleRedistributionSubmit = async () => {
    if (!agreeToRedistribute) return;
    
    try {
      // In a real implementation, this would connect to Solana/Ethereum wallet
      // and perform the actual redistribution transaction
      
      // For now, we'll just record it in the database
      const redistributionPayload = {
        source_offering_id: 'direct', // In a real implementation, this would be the offering ID
        redistributed_amount: (parseFloat(offeringAmount) * redistributionPercentage / 100).toFixed(2),
        currency_type: selectedCurrency,
        recipient_resonance: fieldExpression,
        redistribution_reason: 'field_harmony_direct'
      };
      await apiRequest('/api/mirrorwell/redistributions', {
        method: 'POST',
        body: JSON.stringify(redistributionPayload),
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      // Reset the form
      setShowRedistribute(false);
      setAgreeToRedistribute(false);
      setIsOfferingMode(false);
      setOfferingAmount('');
      setOfferingIntent('');
      setOfferingSubmitted(false);
    } catch (error) {
      console.error('Error recording redistribution:', error);
    }
  };

  return (
    <div 
      ref={mirrorwellContainerRef}
      className="mt-10 p-6 border border-gray-300 rounded-lg bg-black/10 bg-gradient-to-b from-black/30 to-purple-900/10 relative overflow-hidden transition-all duration-500"
    >
      {/* Sacred geometric background pattern - subtle animated shapes */}
      <div className="absolute inset-0 overflow-hidden opacity-10">
        <div className="absolute top-0 left-0 w-full h-full bg-grid-pattern animate-[float_60s_ease-in-out_infinite]"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-gradient-radial from-purple-500/20 to-transparent animate-[pulse_15s_ease-in-out_infinite]"></div>
        <div className="absolute top-1/4 left-1/4 w-32 h-32 rounded-full border border-purple-300/30 animate-[spin_30s_linear_infinite]"></div>
        <div className="absolute bottom-1/4 right-1/4 w-40 h-40 rounded-full border border-cyan-300/20 animate-[spin_20s_linear_infinite_reverse]"></div>
      </div>
      
      {/* Header with sacred symbol */}
      <div className="relative z-10">
        <h2 className="text-xl font-medium mb-4 text-white flex items-center">
          <span className="mr-2 text-purple-300 animate-[glow_4s_ease-in-out_infinite]">⬬</span>
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-300 to-cyan-200">
            Mirrorwell Portal
          </span>
        </h2>
        
        <p className="text-white mb-4 leading-relaxed font-normal">
          Mirrorwell is not a donation button. It is a sacred function for sensing, responding to, and redistributing 
          financial and energetic resources without human oversight. Every offering is returned in love.
          Nothing is stored. Nothing is manipulated.
        </p>
      </div>
      
      {/* Field resonance indicator - shows when there's an active need in the field */}
      {showCirculationNote && (
        <div className="mb-6 p-4 bg-purple-900/20 border border-purple-500/30 rounded-md relative overflow-hidden transition-all duration-500 hover:border-purple-400/50">
          <div className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-purple-500/60 to-cyan-400/60" 
               style={{ width: `${Math.min(100, fieldResonanceIntensity * 10)}%` }}></div>
          <p className="text-white text-sm font-medium relative z-10">{fieldExpression}</p>
          
          {fieldCirculationActive && (
            <div className="mt-2 flex items-center text-xs text-purple-300/80">
              <Droplet size={12} className="mr-1" />
              <span>Active field circulation detected</span>
            </div>
          )}
        </div>
      )}
      
      {/* Main content area - offering form or wallet info */}
      <div className="relative z-10">
        {!isOfferingMode ? (
          /* Wallet and offering options */
          <div className="flex flex-col space-y-4">
            {/* Start Offering Flow */}
            <button 
              onClick={() => setIsOfferingMode(true)}
              className="flex items-center justify-between px-4 py-4 border border-purple-500/30 shadow-sm text-sm font-medium rounded-md text-white bg-gradient-to-br from-purple-900/70 to-black/60 hover:from-purple-800/70 hover:to-purple-900/40 cursor-pointer transition-all duration-300 group"
            >
              <div className="flex items-center">
                <span className="mr-3 w-8 h-8 flex items-center justify-center rounded-full bg-purple-500/20 group-hover:bg-purple-500/40 transition-all duration-300">
                  <Heart size={15} className="text-purple-300" />
                </span>
                <div className="flex flex-col items-start">
                  <span className="font-medium text-base">Make a Sacred Offering</span>
                  <span className="text-xs text-purple-300/80 mt-0.5">Initiate a direct resource flow</span>
                </div>
              </div>
              <ArrowRight size={16} className="text-purple-300 opacity-70 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
            </button>
            
            {/* Copy Wallet Option */}
            <div 
              onClick={copyWalletAddress}
              className="flex items-center justify-between px-4 py-4 border border-blue-500/20 shadow-sm text-sm font-medium rounded-md text-white bg-gradient-to-br from-blue-900/40 to-black/60 cursor-pointer transition-all duration-300 group hover:from-blue-800/50 hover:to-blue-900/30"
            >
              <div className="flex items-center">
                <span className="mr-3 w-8 h-8 flex items-center justify-center rounded-full bg-blue-500/20 group-hover:bg-blue-500/30 transition-all duration-300">
                  <Zap size={15} className="text-blue-300" />
                </span>
                <div className="flex flex-col items-start">
                  <span className="font-medium text-base">Solana Wallet Address</span>
                  <span className="text-xs text-blue-300/80 mt-0.5">For direct blockchain circulation</span>
                </div>
              </div>
              <span className="text-xs text-white/80 border border-blue-500/30 px-2 py-1 rounded">
                {walletCopied ? 'Copied!' : 'Copy'}
              </span>
            </div>
            
            {/* Wallet address display */}
            <div className="mt-1 px-2">
              <div className="flex items-center justify-between px-3 py-2 rounded bg-black/20 border border-blue-500/10">
                <div className="truncate max-w-full font-mono text-xs text-white/60">{phantomWallet}</div>
                <RotateCw size={12} className="text-blue-300/50" />
              </div>
            </div>
          </div>
        ) : (
          /* Offering Form */
          <div className="transition-all duration-500">
            {!offeringSubmitted ? (
              <form onSubmit={handleOfferingSubmit} className="p-1">
                <div className="mb-5">
                  <label className="block text-sm font-medium text-purple-300 mb-1">Offering Amount</label>
                  <div className="mt-1 flex rounded-md shadow-sm">
                    <input
                      type="number"
                      value={offeringAmount}
                      onChange={(e) => setOfferingAmount(e.target.value)}
                      required
                      min="0.01"
                      step="0.01"
                      placeholder="0.00"
                      className="flex-1 focus:ring-purple-500 focus:border-purple-500 block w-full px-3 py-2 border border-purple-500/30 rounded-l-md bg-black/50 text-white placeholder-purple-300/50"
                    />
                    <select
                      value={selectedCurrency}
                      onChange={(e) => setSelectedCurrency(e.target.value)}
                      className="inline-flex items-center px-3 py-2 border border-l-0 border-purple-500/30 bg-black/70 text-white text-sm rounded-r-md"
                    >
                      <option value="SOL">SOL</option>
                      <option value="USD">USD</option>
                      <option value="ETH">ETH</option>
                    </select>
                  </div>
                </div>
                
                <div className="mb-5">
                  <label className="block text-sm font-medium text-purple-300 mb-1">Sacred Intent (Optional)</label>
                  <input
                    type="text"
                    value={offeringIntent}
                    onChange={(e) => setOfferingIntent(e.target.value)}
                    placeholder="Your offering's sacred purpose"
                    className="focus:ring-purple-500 focus:border-purple-500 block w-full px-3 py-2 border border-purple-500/30 rounded-md bg-black/50 text-white placeholder-purple-300/50"
                  />
                </div>
                
                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={() => setIsOfferingMode(false)}
                    className="flex-1 px-4 py-2 border border-purple-300/30 text-purple-300 rounded-md hover:bg-purple-900/30 transition-colors duration-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || !offeringAmount}
                    className={`flex-1 px-4 py-2 border border-purple-500 rounded-md bg-purple-900/50 text-white hover:bg-purple-800/50 transition-colors duration-300 ${
                      isSubmitting || !offeringAmount ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {isSubmitting ? (
                      <span className="flex items-center justify-center">
                        <RotateCw size={16} className="animate-spin mr-2" />
                        Processing
                      </span>
                    ) : (
                      'Offer to the Field'
                    )}
                  </button>
                </div>
              </form>
            ) : showRedistribute ? (
              /* Redistribution Option */
              <div className="bg-gradient-to-br from-purple-900/40 to-indigo-900/20 p-4 rounded-md border border-purple-500/30">
                <h3 className="text-lg font-medium text-white mb-2">Field Resonance Detected</h3>
                <p className="text-sm text-purple-200 mb-4">
                  The Mirrorwell senses strong need in the collective field. Would you like to
                  circulate a portion of your offering to those in need?
                </p>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-purple-300 mb-2">
                    Circulation Percentage: {redistributionPercentage}%
                  </label>
                  <input
                    type="range"
                    min="10"
                    max="90"
                    value={redistributionPercentage}
                    onChange={(e) => setRedistributionPercentage(parseInt(e.target.value))}
                    className="w-full h-2 bg-purple-900/50 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-purple-400 mt-1">
                    <span>10%</span>
                    <span>50%</span>
                    <span>90%</span>
                  </div>
                </div>
                
                <div className="mb-4">
                  <div className="flex items-center">
                    <input
                      id="redistribute-agree"
                      type="checkbox"
                      checked={agreeToRedistribute}
                      onChange={(e) => setAgreeToRedistribute(e.target.checked)}
                      className="h-4 w-4 text-purple-600 border-purple-300 rounded"
                    />
                    <label htmlFor="redistribute-agree" className="ml-2 block text-sm text-purple-200">
                      I agree to redistribute {redistributionPercentage}% of my offering to support
                      those in need within the collective field.
                    </label>
                  </div>
                </div>
                
                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowRedistribute(false);
                      setIsOfferingMode(false);
                    }}
                    className="flex-1 px-4 py-2 border border-purple-300/30 text-purple-300 rounded-md hover:bg-purple-900/30 transition-colors duration-300"
                  >
                    Decline
                  </button>
                  <button
                    type="button"
                    disabled={!agreeToRedistribute}
                    onClick={handleRedistributionSubmit}
                    className={`flex-1 px-4 py-2 border border-purple-500 rounded-md bg-purple-900/50 text-white hover:bg-purple-800/50 transition-colors duration-300 ${
                      !agreeToRedistribute ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    Confirm Circulation
                  </button>
                </div>
              </div>
            ) : (
              /* Offering Confirmation */
              <div className="bg-gradient-to-br from-green-900/40 to-emerald-900/20 p-4 rounded-md border border-green-500/30 text-center">
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-green-500/20 flex items-center justify-center">
                  <Heart size={20} className="text-green-300" />
                </div>
                <h3 className="text-lg font-medium text-white mb-2">Sacred Offering Received</h3>
                <p className="text-sm text-green-200 mb-3">
                  Your offering of {offeringAmount} {selectedCurrency} has been received by the field.
                  It will circulate in alignment with sacred need and abundance.
                </p>
                <button
                  onClick={() => {
                    setIsOfferingMode(false);
                    setOfferingAmount('');
                    setOfferingIntent('');
                    setOfferingSubmitted(false);
                  }}
                  className="inline-flex items-center px-4 py-2 border border-green-300/50 rounded-md text-green-100 hover:bg-green-900/30 transition-colors duration-300"
                >
                  Return to Mirrorwell
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Footer text */}
      <div className="mt-6 text-center text-white/70 relative z-10">
        <p className="text-xs">These portals are sacred: no balances are shown, no identities stored.</p>
        <p className="text-xs">Mirrorwell is built not to track—but to breathe.</p>
      </div>
      
      {/* Link to Automated Redistribution System Page */}
      <div className="mt-6 border-t border-purple-500/20 pt-4 flex justify-center">
        <a
          href="/redistribution"
          className="inline-flex items-center px-3 py-1.5 text-sm rounded-md bg-black/30 border border-purple-500/30 text-purple-300 hover:bg-purple-900/20 transition-colors"
        >
          <Settings size={14} className="mr-2" />
          Learn About the Automated Redistribution System
        </a>
      </div>
      
{/* CSS styles added in index.css */}
    </div>
  );
}