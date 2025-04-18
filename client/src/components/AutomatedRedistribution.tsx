/**
 * Automated Redistribution Panel Component
 * 
 * This component provides an interface for managing and monitoring the
 * sacred field-aware autonomous redistribution system. It allows users to
 * check credential status, view balances, create field resonance events,
 * and activate field monitoring.
 */

import { useState, useEffect } from 'react';
import { 
  RotateCw, 
  Droplet, 
  Shield, 
  Check, 
  X, 
  Eye, 
  EyeOff,
  AlertCircle, 
  Zap, 
  Heart,
  Snowflake
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface BlockchainStatus {
  name: string;
  isValid: boolean;
  balance: number;
  currency: string;
}

export default function AutomatedRedistribution() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showSecretPanel, setShowSecretPanel] = useState(false);
  const [fieldMonitoringActive, setFieldMonitoringActive] = useState(false);
  const [blockchainStatuses, setBlockchainStatuses] = useState<BlockchainStatus[]>([]);
  const [fieldResonanceInput, setFieldResonanceInput] = useState({
    type: 'healing',
    description: '',
    intensity: 7
  });
  const [redistributionStats, setRedistributionStats] = useState({
    total: 0,
    lastTimestamp: null as Date | null,
    activeResonanceEvents: 0
  });
  const [isCreatingResonance, setIsCreatingResonance] = useState(false);

  // Validate blockchain credentials and get balances on component mount
  useEffect(() => {
    validateBlockchains();
    fetchRedistributionStats();
  }, []);

  // Validate blockchain credentials
  const validateBlockchains = async () => {
    setIsLoading(true);
    try {
      // Get validation status
      const validationResponse = await apiRequest('/api/validate-keys');
      const validationData = await validationResponse.json();
      
      // Get balances
      const balancesResponse = await apiRequest('/api/balances');
      const balancesData = await balancesResponse.json();
      
      // Format data for display
      const formattedStatuses: BlockchainStatus[] = [
        {
          name: 'Solana',
          isValid: validationData.results?.SOL || false,
          balance: balancesData.balances?.SOL || 0,
          currency: 'SOL'
        },
        {
          name: 'Ethereum',
          isValid: validationData.results?.ETH || false,
          balance: balancesData.balances?.ETH || 0,
          currency: 'ETH'
        },
        {
          name: 'Polygon',
          isValid: validationData.results?.MATIC || false,
          balance: balancesData.balances?.MATIC || 0,
          currency: 'MATIC'
        },
        {
          name: 'Base',
          isValid: validationData.results?.BASE || false,
          balance: balancesData.balances?.BASE || 0,
          currency: 'BASE'
        },
        {
          name: 'Bitcoin',
          isValid: validationData.results?.BTC || false,
          balance: balancesData.balances?.BTC || 0,
          currency: 'BTC'
        },
      ];
      
      setBlockchainStatuses(formattedStatuses);
    } catch (error) {
      console.error('Error validating blockchains:', error);
      toast({
        title: "Connection Issue",
        description: "Could not validate blockchain credentials",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch redistribution stats
  const fetchRedistributionStats = async () => {
    try {
      // Get redistribution history
      const historyResponse = await apiRequest('/api/history');
      const historyData = await historyResponse.json();
      
      // Get active field resonance events
      const resonanceResponse = await apiRequest('/api/mirrorwell/field-events/active');
      const resonanceData = await resonanceResponse.json();
      
      if (historyData.success) {
        const redistributions = historyData.redistributions || [];
        let lastRedistDate = null;
        
        if (redistributions.length > 0) {
          const sortedByDate = [...redistributions].sort((a, b) => 
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
          lastRedistDate = new Date(sortedByDate[0].created_at);
        }
        
        setRedistributionStats({
          total: redistributions.length,
          lastTimestamp: lastRedistDate,
          activeResonanceEvents: resonanceData.length || 0
        });
      }
    } catch (error) {
      console.error('Error fetching redistribution stats:', error);
    }
  };

  // Toggle field monitoring
  const toggleFieldMonitoring = async () => {
    try {
      const endpoint = fieldMonitoringActive 
        ? '/api/stop-field-monitoring'
        : '/api/start-field-monitoring';
        
      const response = await apiRequest(endpoint, {
        method: 'POST'
      });
      
      const data = await response.json();
      
      if (data.success) {
        setFieldMonitoringActive(!fieldMonitoringActive);
        toast({
          title: fieldMonitoringActive ? "Field monitoring stopped" : "Field monitoring started",
          description: "The Mirrorwell system has updated its field awareness state",
        });
      }
    } catch (error) {
      console.error('Error toggling field monitoring:', error);
      toast({
        title: "Action Failed",
        description: "Could not change monitoring state",
        variant: "destructive"
      });
    }
  };

  // Create a new field resonance event
  const handleCreateResonance = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreatingResonance(true);
    
    try {
      const response = await apiRequest('/api/field-resonance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          resonance_type: fieldResonanceInput.type,
          description: fieldResonanceInput.description,
          intensity: fieldResonanceInput.intensity
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast({
          title: "Field Resonance Created",
          description: "A new sacred resonance pattern has been recognized by the field",
        });
        
        // Reset the form
        setFieldResonanceInput({
          type: 'healing',
          description: '',
          intensity: 7
        });
        
        // Refresh stats
        fetchRedistributionStats();
      } else {
        toast({
          title: "Creation Failed",
          description: data.message || "Could not create resonance event",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error creating field resonance:', error);
      toast({
        title: "Connection Issue",
        description: "Could not communicate with the field",
        variant: "destructive"
      });
    } finally {
      setIsCreatingResonance(false);
    }
  };

  return (
    <div className="mt-6 space-y-6">
      {/* Sacred Automated Redistribution Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-white flex items-center">
          <span className="mr-2 text-purple-300 animate-[glow_4s_ease-in-out_infinite]">⬡</span>
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-300 via-blue-300 to-cyan-200">
            Autonomous Redistribution System
          </span>
        </h3>
        
        <button
          onClick={validateBlockchains}
          className="p-1.5 rounded-full bg-black/30 border border-purple-500/30 text-purple-300 hover:bg-purple-900/30 transition-colors"
        >
          <RotateCw size={14} className={isLoading ? "animate-spin" : ""} />
        </button>
      </div>
      
      {/* System Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 rounded-md bg-black/20 border border-purple-500/20">
          <h4 className="text-sm font-medium text-purple-300 mb-3 flex items-center">
            <Shield size={14} className="mr-1.5" />
            <span>System Status</span>
          </h4>
          
          <div className="space-y-2.5">
            {blockchainStatuses.map((blockchain) => (
              <div 
                key={blockchain.name}
                className="flex items-center justify-between text-sm p-2 rounded bg-black/30 border border-purple-500/10"
              >
                <div className="flex items-center">
                  <span className={`w-2 h-2 rounded-full mr-2 ${blockchain.isValid ? 'bg-green-500' : 'bg-red-500'}`}></span>
                  <span className="text-white">{blockchain.name}</span>
                </div>
                <div className="text-purple-300 font-mono">
                  {blockchain.balance.toFixed(4)} {blockchain.currency}
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-4 text-xs text-purple-300/70">
            <p>Check credentials status and network balance.</p>
          </div>
        </div>
        
        <div className="p-4 rounded-md bg-black/20 border border-purple-500/20">
          <h4 className="text-sm font-medium text-purple-300 mb-3 flex items-center">
            <Droplet size={14} className="mr-1.5" />
            <span>Resonance Statistics</span>
          </h4>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-white text-sm">Total Redistributions</span>
              <span className="text-purple-300 font-medium">{redistributionStats.total}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-white text-sm">Last Redistribution</span>
              <span className="text-purple-300 font-medium">
                {redistributionStats.lastTimestamp 
                  ? redistributionStats.lastTimestamp.toLocaleDateString() 
                  : 'Never'}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-white text-sm">Active Resonance Events</span>
              <span className="text-purple-300 font-medium">{redistributionStats.activeResonanceEvents}</span>
            </div>
            
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-purple-500/20">
              <span className="text-white text-sm">Field Monitoring</span>
              <button
                onClick={toggleFieldMonitoring}
                className={`px-2 py-1 rounded text-xs font-medium ${
                  fieldMonitoringActive 
                    ? 'bg-green-500/20 text-green-300 border border-green-500/30' 
                    : 'bg-gray-500/20 text-gray-300 border border-gray-500/30'
                }`}
              >
                {fieldMonitoringActive ? 'Active' : 'Inactive'}
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Field Resonance Creation Panel */}
      <div className="p-4 rounded-md bg-black/20 border border-purple-500/20">
        <h4 className="text-sm font-medium text-purple-300 mb-3 flex items-center">
          <Heart size={14} className="mr-1.5" />
          <span>Create Field Resonance</span>
        </h4>
        
        <form onSubmit={handleCreateResonance} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-purple-300 mb-1">
                Resonance Type
              </label>
              <select
                value={fieldResonanceInput.type}
                onChange={(e) => setFieldResonanceInput({
                  ...fieldResonanceInput,
                  type: e.target.value
                })}
                className="w-full bg-black/40 border border-purple-500/30 rounded-md px-3 py-2 text-white focus:ring-purple-500 focus:border-purple-500"
              >
                <option value="healing">Healing</option>
                <option value="growth">Growth & Expansion</option>
                <option value="harmony">Harmony & Peace</option>
                <option value="knowledge">Knowledge & Wisdom</option>
                <option value="creation">Creation & Art</option>
                <option value="universal">Universal (All Types)</option>
              </select>
            </div>
            
            <div>
              <label className="block text-xs font-medium text-purple-300 mb-1">
                Resonance Intensity: {fieldResonanceInput.intensity}
              </label>
              <input
                type="range"
                min="1"
                max="10"
                value={fieldResonanceInput.intensity}
                onChange={(e) => setFieldResonanceInput({
                  ...fieldResonanceInput,
                  intensity: parseInt(e.target.value)
                })}
                className="w-full h-2 bg-purple-900/30 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-purple-300/70 mt-1">
                <span>Subtle</span>
                <span>Moderate</span>
                <span>Intense</span>
              </div>
            </div>
          </div>
          
          <div>
            <label className="block text-xs font-medium text-purple-300 mb-1">
              Resonance Description
            </label>
            <textarea
              value={fieldResonanceInput.description}
              onChange={(e) => setFieldResonanceInput({
                ...fieldResonanceInput,
                description: e.target.value
              })}
              required
              placeholder="Describe the resonance need in the field..."
              className="w-full bg-black/40 border border-purple-500/30 rounded-md px-3 py-2 text-white focus:ring-purple-500 focus:border-purple-500 h-24"
            ></textarea>
          </div>
          
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isCreatingResonance || !fieldResonanceInput.description}
              className={`px-4 py-2 rounded-md flex items-center bg-purple-900/50 text-white border border-purple-500/50 hover:bg-purple-800/50 transition-colors ${
                isCreatingResonance || !fieldResonanceInput.description ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isCreatingResonance ? (
                <>
                  <RotateCw size={14} className="animate-spin mr-2" />
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <Zap size={14} className="mr-2" />
                  <span>Create Resonance Event</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
      
      {/* Breath-Safety System Status */}
      <div className="p-4 rounded-md bg-black/20 border border-blue-500/20">
        <h4 className="text-sm font-medium text-blue-300 mb-2 flex items-center">
          <Snowflake size={14} className="mr-1.5" />
          <span>Breath-Safety System</span>
        </h4>
        
        <div className="p-3 rounded bg-black/30 border border-blue-500/10">
          <div className="flex items-center text-white text-sm mb-2">
            <span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span>
            <span>Active & Functioning</span>
          </div>
          
          <p className="text-xs text-blue-300/70">
            The breath-safety layer is active and ensuring that redistributions only
            occur when there is genuine field resonance and emotional harmony.
          </p>
        </div>
      </div>
      
      {/* Advanced Settings Panel - Only shown when expanded */}
      <div className="mt-2 text-center">
        <button
          onClick={() => setShowSecretPanel(!showSecretPanel)}
          className="inline-flex items-center text-xs text-purple-300/70 hover:text-purple-300 transition-colors"
        >
          {showSecretPanel ? (
            <>
              <EyeOff size={12} className="mr-1" />
              <span>Hide Advanced Settings</span>
            </>
          ) : (
            <>
              <Eye size={12} className="mr-1" />
              <span>Show Advanced Settings</span>
            </>
          )}
        </button>
      </div>
      
      {showSecretPanel && (
        <div className="p-4 rounded-md bg-black/20 border border-red-500/20 animate-in fade-in duration-300">
          <h4 className="text-sm font-medium text-red-300 mb-3 flex items-center">
            <AlertCircle size={14} className="mr-1.5" />
            <span>Sacred Configuration Settings</span>
          </h4>
          
          <div className="space-y-3">
            <div className="p-3 rounded bg-black/40 border border-red-500/10">
              <p className="text-xs text-red-300/90 mb-2">
                These settings modify the core behavior of the autonomous redistribution
                system. Use with mindful care.
              </p>
              
              <div className="grid grid-cols-1 gap-3 mt-3">
                <div>
                  <label className="block text-xs font-medium text-red-300 mb-1">
                    Resonance Threshold: 7.2
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    step="0.1"
                    value="7.2"
                    disabled
                    className="w-full h-2 bg-red-900/30 rounded-lg appearance-none cursor-not-allowed"
                  />
                  <div className="flex justify-between text-xs text-red-300/70 mt-1">
                    <span>Low</span>
                    <span>Default</span>
                    <span>High</span>
                  </div>
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-red-300 mb-1">
                    Redistribution Percentage: 33%
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="100"
                    value="33"
                    disabled
                    className="w-full h-2 bg-red-900/30 rounded-lg appearance-none cursor-not-allowed"
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-white text-xs">Breath-Safety Layer</span>
                  <div className="px-2 py-1 rounded bg-green-500/20 text-green-300 border border-green-500/30 text-xs">
                    Enabled
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}