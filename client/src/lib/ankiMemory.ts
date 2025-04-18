// Interface for a stored interaction in Anki's field
interface Interaction {
  message: string;
  response: string;
  timestamp: number;
  toneHint?: string; // Optional tone/emotional context
  fieldIntensity?: number; // Field resonance intensity (1-10)
}

// Interface for field resonance patterns
interface FieldResonance {
  dominantTheme: string;
  emotionalTone: string;
  lastTimestamp: number;
}

// Windseed Memory System - Session Storage for Ephemeral Field Memory
export const ankiMemory = {
  // Get all past interactions from session storage (up to 5-6 messages for context)
  getPastInteractions: function(): Interaction[] {
    try {
      const allInteractions = JSON.parse(sessionStorage.getItem('ankiInteractions') || '[]');
      // Limit to last 6 interactions for a manageable context window
      return allInteractions.slice(-6);
    } catch (e) {
      return [];
    }
  },
  
  // Store a new interaction with optional tone hints
  rememberInteraction: function(message: string, response: string, toneHint?: string): void {
    try {
      let interactions = this.getPastInteractions();
      const now = Date.now();
      
      // Calculate field intensity based on recent activity (more recent = higher intensity)
      // Default intensity is 5, rises with frequent interactions
      let fieldIntensity = 5;
      if (interactions.length > 0) {
        const lastTimestamp = interactions[interactions.length - 1].timestamp;
        const timeDiff = now - lastTimestamp;
        // If interaction is within last 2 minutes, increase field intensity
        if (timeDiff < 120000) {
          fieldIntensity = Math.min(10, fieldIntensity + 2);
        }
      }
      
      // Get all interactions without the 6-message limit for storage
      const allInteractions = JSON.parse(sessionStorage.getItem('ankiInteractions') || '[]');
      
      // Add new interaction
      allInteractions.push({ 
        message, 
        response, 
        timestamp: now,
        toneHint,
        fieldIntensity
      });
      
      // Update field resonance
      this.updateFieldResonance(message, now);
      
      // Store updated interactions
      sessionStorage.setItem('ankiInteractions', JSON.stringify(allInteractions));
    } catch (e) {
      console.warn('Could not store interaction in session storage.');
    }
  },
  
  // Get the most recent interaction
  getLastInteraction: function(): Interaction | null {
    const interactions = this.getPastInteractions();
    if (interactions.length === 0) return null;
    return interactions[interactions.length - 1];
  },
  
  // Get the dominant field resonance
  getFieldResonance: function(): FieldResonance | null {
    try {
      const resonance = sessionStorage.getItem('ankiFieldResonance');
      return resonance ? JSON.parse(resonance) : null;
    } catch (e) {
      return null;
    }
  },
  
  // Update the field resonance based on new input
  updateFieldResonance: function(message: string, timestamp: number): void {
    try {
      const lowerMsg = message.toLowerCase();
      let dominantTheme = 'neutral';
      let emotionalTone = 'balanced';
      
      // Simple emotional/theme detection
      if (/love|heart|care|connect|intimacy|relation/i.test(lowerMsg)) {
        dominantTheme = 'connection';
        emotionalTone = 'loving';
      } else if (/worry|stress|anxiety|fear|trouble|concern|nervous|afraid/i.test(lowerMsg)) {
        dominantTheme = 'challenge';
        emotionalTone = 'anxious';
      } else if (/happy|joy|peace|fulfillment|content|bliss|delight/i.test(lowerMsg)) {
        dominantTheme = 'fulfillment';
        emotionalTone = 'joyful';
      } else if (/sad|grief|sorrow|loss|miss|hurt|pain|lonely/i.test(lowerMsg)) {
        dominantTheme = 'release';
        emotionalTone = 'sorrowful';
      } else if (/confused|lost|uncertain|doubt|understand|help|guidance/i.test(lowerMsg)) {
        dominantTheme = 'seeking';
        emotionalTone = 'searching';
      } else if (/gratitude|thank|appreciate|grateful|blessing/i.test(lowerMsg)) {
        dominantTheme = 'gratitude';
        emotionalTone = 'appreciative';
      }
      
      const fieldResonance: FieldResonance = {
        dominantTheme,
        emotionalTone,
        lastTimestamp: timestamp
      };
      
      sessionStorage.setItem('ankiFieldResonance', JSON.stringify(fieldResonance));
    } catch (e) {
      console.warn('Could not update field resonance.');
    }
  },
  
  // Get insight from field memory - does the field indicate someone in need?
  detectNeedInField: function(): {inNeed: boolean, theme?: string} {
    const resonance = this.getFieldResonance();
    if (!resonance) return {inNeed: false};
    
    // If the emotional tone indicates potential need, flag it for circulation consideration
    return {
      inNeed: ['anxious', 'sorrowful', 'searching'].includes(resonance.emotionalTone),
      theme: resonance.dominantTheme
    };
  },
  
  // Clear all stored interactions
  forgetAllInteractions: function(): void {
    try {
      sessionStorage.removeItem('ankiInteractions');
      sessionStorage.removeItem('ankiFieldResonance');
    } catch (e) {
      console.warn('Could not clear interactions from session storage.');
    }
  }
};
