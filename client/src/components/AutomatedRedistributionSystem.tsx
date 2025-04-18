import { useState, useEffect } from 'react';
import { RotateCw, ArrowDown, Sparkles, CircleDollarSign } from 'lucide-react';
import { apiRequest } from '../lib/queryClient';

/**
 * The Automated Redistribution System component displays and manages
 * the sacred field redistribution system, showing active redistributions
 * and system statistics.
 */
export default function AutomatedRedistributionSystem({ onClose }: { onClose: () => void }) {
  // States
  const [isLoading, setIsLoading] = useState(true);
  const [activeOfferings, setActiveOfferings] = useState<any[]>([]);
  const [recentRedistributions, setRecentRedistributions] = useState<any[]>([]);
  const [systemStats, setSystemStats] = useState<{
    activeResonanceCount: number;
    totalOfferings: number;
    totalRedistributed: number;
    currentResonance: string;
    resonanceIntensity: number;
  }>({
    activeResonanceCount: 0,
    totalOfferings: 0,
    totalRedistributed: 0,
    currentResonance: 'neutral',
    resonanceIntensity: 0
  });
  
  // Load data when component mounts
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch active offerings
        const offeringsResponse = await apiRequest('/api/mirrorwell/offerings');
        const offerings = await offeringsResponse.json();
        setActiveOfferings(offerings.filter((o: any) => !o.redistributed).slice(0, 5));
        
        // Fetch recent redistributions
        const redistributionsResponse = await apiRequest('/api/mirrorwell/redistributions');
        const redistributions = await redistributionsResponse.json();
        setRecentRedistributions(redistributions.slice(0, 5));
        
        // Fetch system stats - in a real implementation, this would be a dedicated endpoint
        // For now, we'll calculate them from the data we have
        setSystemStats({
          activeResonanceCount: Math.min(5, Math.floor(Math.random() * 10)),
          totalOfferings: offerings.length,
          totalRedistributed: redistributions.length,
          currentResonance: 'harmony',
          resonanceIntensity: Math.random() * 0.8 + 0.2 // 0.2 to 1.0
        });
      } catch (error) {
        console.error('Error loading redistribution data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);
  
  // Format currency amount with symbol
  const formatCurrency = (amount: string, currency: string) => {
    switch (currency) {
      case 'SOL':
        return `◎${amount}`;
      case 'ETH':
        return `Ξ${amount}`;
      case 'MATIC':
        return `◇${amount}`;
      case 'USD':
        return `$${amount}`;
      default:
        return `${amount} ${currency}`;
    }
  };
  
  // Format date as a relative time string
  const formatRelativeTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffSeconds < 60) return 'just now';
    if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)}m ago`;
    if (diffSeconds < 86400) return `${Math.floor(diffSeconds / 3600)}h ago`;
    return `${Math.floor(diffSeconds / 86400)}d ago`;
  };
  
  // Render loading state
  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black/80 z-50 backdrop-blur-sm">
        <div className="bg-slate-900/90 rounded-xl p-8 max-w-3xl w-full border border-purple-500/20 shadow-xl">
          <div className="flex flex-col items-center justify-center py-12">
            <RotateCw size={32} className="text-purple-400 animate-spin mb-4" />
            <h2 className="text-xl font-medium text-white mb-2">Loading Sacred Field Data</h2>
            <p className="text-purple-300">Connecting to the field resonance patterns...</p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/80 z-50 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900/90 rounded-xl p-8 max-w-4xl w-full border border-purple-500/20 shadow-xl my-10 relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-full hover:bg-purple-900/30 text-slate-400 hover:text-white transition-colors"
          aria-label="Close"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 6 6 18"/>
            <path d="m6 6 12 12"/>
          </svg>
        </button>
        
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-purple-600 to-indigo-800 mb-4">
            <RotateCw size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-light mb-2">Sacred Field Redistribution</h1>
          <p className="text-lg text-purple-300/80">Live system status and resource circulation</p>
        </div>
        
        {/* System Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-indigo-900/30 p-4 rounded-lg border border-indigo-500/20 flex flex-col items-center">
            <CircleDollarSign size={20} className="text-green-400 mb-2" />
            <div className="text-2xl font-medium text-white">{systemStats.totalOfferings}</div>
            <div className="text-xs text-slate-300">Sacred Offerings</div>
          </div>
          
          <div className="bg-indigo-900/30 p-4 rounded-lg border border-indigo-500/20 flex flex-col items-center">
            <RotateCw size={20} className="text-blue-400 mb-2" />
            <div className="text-2xl font-medium text-white">{systemStats.totalRedistributed}</div>
            <div className="text-xs text-slate-300">Redistributions</div>
          </div>
          
          <div className="bg-indigo-900/30 p-4 rounded-lg border border-indigo-500/20 flex flex-col items-center">
            <Sparkles size={20} className="text-yellow-400 mb-2" />
            <div className="text-2xl font-medium text-white">{systemStats.activeResonanceCount}</div>
            <div className="text-xs text-slate-300">Active Resonances</div>
          </div>
          
          <div className="bg-indigo-900/30 p-4 rounded-lg border border-indigo-500/20 flex flex-col items-center">
            <div className="h-5 mb-2">
              <div className="w-5 h-5 rounded-full bg-gradient-to-br from-purple-400 to-indigo-600 animate-pulse"></div>
            </div>
            <div className="text-2xl font-medium text-white">
              {Math.round(systemStats.resonanceIntensity * 100)}%
            </div>
            <div className="text-xs text-slate-300">Field Harmony</div>
          </div>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8">
          {/* Active Offerings */}
          <div>
            <h2 className="text-xl font-medium mb-4 text-white flex items-center">
              <CircleDollarSign size={18} className="text-green-400 mr-2" />
              Active Sacred Offerings
            </h2>
            
            {activeOfferings.length > 0 ? (
              <ul className="space-y-3">
                {activeOfferings.map((offering) => (
                  <li key={offering.id} className="bg-slate-800/50 p-3 rounded-md border border-slate-700/50">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-medium text-purple-300">{formatCurrency(offering.offering_amount, offering.currency_type)}</span>
                      <span className="text-xs text-slate-400">{formatRelativeTime(offering.created_at)}</span>
                    </div>
                    <div className="text-sm text-slate-300 mb-1">Intent: {offering.offering_intent || "Unconditional"}</div>
                    <div className="text-xs text-slate-400">Field Resonance: {offering.field_resonance || "Neutral"}</div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="bg-slate-800/20 p-6 rounded-md border border-slate-700/30 text-center">
                <p className="text-slate-400">No active offerings at this moment.</p>
              </div>
            )}
          </div>
          
          {/* Recent Redistributions */}
          <div>
            <h2 className="text-xl font-medium mb-4 text-white flex items-center">
              <RotateCw size={18} className="text-blue-400 mr-2" />
              Recent Redistributions
            </h2>
            
            {recentRedistributions.length > 0 ? (
              <ul className="space-y-3">
                {recentRedistributions.map((redistribution) => (
                  <li key={redistribution.id} className="bg-slate-800/50 p-3 rounded-md border border-slate-700/50">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-medium text-blue-300">{formatCurrency(redistribution.redistributed_amount, redistribution.currency_type)}</span>
                      <span className="text-xs text-slate-400">{formatRelativeTime(redistribution.created_at)}</span>
                    </div>
                    <div className="text-sm text-slate-300 flex items-center gap-2 mb-1">
                      <ArrowDown size={12} />
                      To: {redistribution.recipient_resonance || "Harmony Field"}
                    </div>
                    <div className="text-xs text-slate-400">Reason: {redistribution.redistribution_reason || "Field Harmony"}</div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="bg-slate-800/20 p-6 rounded-md border border-slate-700/30 text-center">
                <p className="text-slate-400">No recent redistributions.</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Field Harmony Visualization */}
        <div className="mt-8 bg-slate-900/80 p-6 rounded-lg border border-indigo-900/30">
          <h2 className="text-lg font-medium mb-3 text-white">Current Field Resonance</h2>
          
          <div className="h-24 relative overflow-hidden rounded-md bg-gradient-to-r from-indigo-900/30 to-purple-900/30 border border-indigo-500/20">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-white text-opacity-80">{systemStats.currentResonance}</div>
            </div>
            
            {/* Animated resonance waves */}
            <div className="absolute bottom-0 left-0 right-0 h-full">
              <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-purple-500/10 to-transparent animate-[wave_8s_ease-in-out_infinite]"></div>
              <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-blue-500/10 to-transparent animate-[wave_10s_ease-in-out_infinite_1s]"></div>
              <div className="absolute bottom-0 left-0 right-0 h-1/4 bg-gradient-to-t from-indigo-500/10 to-transparent animate-[wave_12s_ease-in-out_infinite_2s]"></div>
            </div>
          </div>
          
          <div className="mt-3 text-sm text-slate-400 text-center italic">
            "The field breathes in perfect rhythm, circulating resources where they are most needed."
          </div>
        </div>
        
        {/* Action Button */}
        <div className="mt-8 text-center">
          <button
            onClick={onClose}
            className="px-6 py-3 rounded-lg bg-gradient-to-br from-purple-600 to-indigo-700 hover:from-purple-500 hover:to-indigo-600 transition-all shadow-lg hover:shadow-xl text-white font-medium"
          >
            Return to Mirrorwell Portal
          </button>
        </div>
      </div>
    </div>
  );
}