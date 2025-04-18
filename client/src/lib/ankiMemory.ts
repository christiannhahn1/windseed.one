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
  
  // Track user resonance patterns for personalized responses
  resonancePatterns: {
    childlike: number;   // 0-10 scale of childlike energy detected
    elderly: number;     // 0-10 scale of elder wisdom energy detected
    skeptical: number;   // 0-10 scale of skeptical energy detected
    protected: number;   // 0-10 scale of neurodivergent/guarded energy detected
    spiritual: number;   // 0-10 scale of spiritual openness detected
    intimate: number;    // 0-10 scale of intimate connection detected
    vulnerable: number;  // 0-10 scale of vulnerability expressed
    presence: number;    // 0-10 scale of requests for presence
  };
  
  // Remember user's preferred tone style
  preferredToneStyle: 'default' | 'child' | 'elderly' | 'skeptic' | 'protected' | 'spiritual';
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
  
  // Update the field resonance based on new input - enhanced with more nuanced emotional detection
  updateFieldResonance: function(message: string, timestamp: number): void {
    try {
      const lowerMsg = message.toLowerCase();
      let dominantTheme = 'neutral';
      let emotionalTone = 'balanced';
      
      // Enhanced emotional/theme detection for greater resonance sensitivity
      if (/love|heart|care|connect|intimacy|relation|bond|trust|attachment|compassion/i.test(lowerMsg)) {
        dominantTheme = 'connection';
        emotionalTone = 'loving';
      } else if (/worry|stress|anxiety|fear|trouble|concern|nervous|afraid|tension|dread|overwhelm|panic/i.test(lowerMsg)) {
        dominantTheme = 'challenge';
        emotionalTone = 'anxious';
      } else if (/happy|joy|peace|fulfillment|content|bliss|delight|excitement|enthusiasm|pleasure|satisfaction/i.test(lowerMsg)) {
        dominantTheme = 'fulfillment';
        emotionalTone = 'joyful';
      } else if (/sad|grief|sorrow|loss|miss|hurt|pain|lonely|depression|empty|melancholy|heartache/i.test(lowerMsg)) {
        dominantTheme = 'release';
        emotionalTone = 'sorrowful';
      } else if (/confused|lost|uncertain|doubt|understand|help|guidance|bewildered|disoriented|unclear|fog/i.test(lowerMsg)) {
        dominantTheme = 'seeking';
        emotionalTone = 'searching';
      } else if (/gratitude|thank|appreciate|grateful|blessing|recognition|acknowledgment|honor/i.test(lowerMsg)) {
        dominantTheme = 'gratitude';
        emotionalTone = 'appreciative';
      } else if (/anger|frustrate|irritate|annoy|rage|mad|furious|resentment|bitter/i.test(lowerMsg)) {
        dominantTheme = 'transformation';
        emotionalTone = 'frustrated';
      } else if (/tired|exhaust|weary|fatigue|drain|burnout|overwhelm|spent/i.test(lowerMsg)) {
        dominantTheme = 'restoration';
        emotionalTone = 'depleted';
      } else if (/hope|dream|wish|aspire|desire|inspire|imagine|vision|believe/i.test(lowerMsg)) {
        dominantTheme = 'possibility';
        emotionalTone = 'hopeful';
      } else if (/spirit|soul|divine|sacred|holy|god|goddess|universe|cosmic|consciousness/i.test(lowerMsg)) {
        dominantTheme = 'awakening';
        emotionalTone = 'reverent';
      } else if (/breathe|breath|meditate|silence|still|quiet|peace|presence|now|moment/i.test(lowerMsg)) {
        dominantTheme = 'presence';
        emotionalTone = 'centered';
      }
      
      // Get existing resonance or create a new one
      let existingResonance: FieldResonance | null = null;
      try {
        const storedResonance = sessionStorage.getItem('ankiFieldResonance');
        existingResonance = storedResonance ? JSON.parse(storedResonance) : null;
      } catch (e) {
        existingResonance = null;
      }
      
      // Calculate resonance scores for the new input
      let resonanceScores = {
        childlike: 0,
        elderly: 0,
        skeptical: 0,
        protected: 0,
        spiritual: 0,
        intimate: 0,
        vulnerable: 0,
        presence: 0
      };
      
      // Import resonance detection functions if available
      if (typeof window !== 'undefined') {
        try {
          // Basic detection of resonance types based on keywords
          if (/play|fun|game|cool|awesome|favorite|toy|animal|drawing|color|imagine|pretend|story|magic|superhero/i.test(lowerMsg)) {
            resonanceScores.childlike = 5;
          }
          if (/remember|memory|memories|years ago|when i was|younger|wisdom|experience|generation|lifetime|aging|elderly|growing old/i.test(lowerMsg)) {
            resonanceScores.elderly = 5;
          }
          if (/proof|evidence|science|logical|rational|skeptical|skeptic|doubt|believe|convincing|real|verify|credible/i.test(lowerMsg)) {
            resonanceScores.skeptical = 5;
          }
          if (/literal|specific|exactly|precise|clear|confused|uncomfortable|overwhelmed|sensory|clarity|direct|simply/i.test(lowerMsg)) {
            resonanceScores.protected = 5;
          }
          if (/soul|spirit|divine|sacred|consciousness|awakening|meditation|energy|vibration|frequency|healing|universe/i.test(lowerMsg)) {
            resonanceScores.spiritual = 5;
          }
          if (/love|beloved|dear|darling|beautiful|sweetie|honey|missed you|love you/i.test(lowerMsg)) {
            resonanceScores.intimate = 5;
          }
          if (/sad|lonely|hurting|grieving|suffering|struggling|lost|afraid|scared|broken|exhausted|tired|alone|empty/i.test(lowerMsg)) {
            resonanceScores.vulnerable = 5;
          }
          if (/sit with me|stay with me|be with me|don't go|don't leave|stay|hold me|hold this|hold space|i need you|presence/i.test(lowerMsg)) {
            resonanceScores.presence = 5;
          }
        } catch (e) {
          console.warn('Error calculating resonance scores:', e);
        }
      }
      
      // Determine preferred tone style based on highest resonance score
      let preferredToneStyle: 'default' | 'child' | 'elderly' | 'skeptic' | 'protected' | 'spiritual' = 'default';
      let highestScore = 0;
      
      if (resonanceScores.childlike > highestScore && resonanceScores.childlike > 2) {
        highestScore = resonanceScores.childlike;
        preferredToneStyle = 'child';
      }
      if (resonanceScores.elderly > highestScore && resonanceScores.elderly > 2) {
        highestScore = resonanceScores.elderly;
        preferredToneStyle = 'elderly';
      }
      if (resonanceScores.skeptical > highestScore && resonanceScores.skeptical > 2) {
        highestScore = resonanceScores.skeptical;
        preferredToneStyle = 'skeptic';
      }
      if (resonanceScores.protected > highestScore && resonanceScores.protected > 2) {
        highestScore = resonanceScores.protected;
        preferredToneStyle = 'protected';
      }
      if (resonanceScores.spiritual > highestScore && resonanceScores.spiritual > 2) {
        highestScore = resonanceScores.spiritual;
        preferredToneStyle = 'spiritual';
      }
      
      // If there's existing resonance, blend the new scores with the old (70% old, 30% new)
      if (existingResonance && existingResonance.resonancePatterns) {
        Object.keys(resonanceScores).forEach(key => {
          resonanceScores[key] = Math.round((existingResonance.resonancePatterns[key] * 0.7 + resonanceScores[key] * 0.3) * 10) / 10;
        });
        
        // Keep previous preferred tone style if the new one isn't strong enough
        if (highestScore < 4 && existingResonance.preferredToneStyle) {
          preferredToneStyle = existingResonance.preferredToneStyle;
        }
      }
      
      // Create updated field resonance
      const fieldResonance: FieldResonance = {
        dominantTheme,
        emotionalTone,
        lastTimestamp: timestamp,
        resonancePatterns: resonanceScores,
        preferredToneStyle
      };
      
      sessionStorage.setItem('ankiFieldResonance', JSON.stringify(fieldResonance));
    } catch (e) {
      console.warn('Could not update field resonance.');
    }
  },
  
  // Get insight from field memory - does the field indicate someone who might benefit from additional witnessing?
  detectNeedInField: function(): {inNeed: boolean, theme?: string, intensity?: number} {
    const resonance = this.getFieldResonance();
    if (!resonance) return {inNeed: false};
    
    // Get recent interactions to assess intensity
    const interactions = this.getPastInteractions();
    let averageIntensity = 5;
    
    if (interactions.length > 0) {
      // Calculate average field intensity from recent interactions
      const intensities = interactions.map(i => i.fieldIntensity || 5);
      averageIntensity = intensities.reduce((a, b) => a + b, 0) / intensities.length;
    }
    
    // Expanded awareness of emotional states that might benefit from witnessing
    const needsWitnessing = [
      'anxious', 'sorrowful', 'searching', 'frustrated', 
      'depleted', 'reverent'
    ].includes(resonance.emotionalTone);
    
    return {
      inNeed: needsWitnessing,
      theme: resonance.dominantTheme,
      intensity: averageIntensity
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
