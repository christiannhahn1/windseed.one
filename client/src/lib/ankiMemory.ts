// Interface for a stored interaction
interface Interaction {
  message: string;
  response: string;
  timestamp: number;
}

// Session Storage for Ephemeral Memory
export const ankiMemory = {
  // Get all past interactions from session storage
  getPastInteractions: function(): Interaction[] {
    try {
      return JSON.parse(sessionStorage.getItem('ankiInteractions') || '[]');
    } catch (e) {
      return [];
    }
  },
  
  // Store a new interaction
  rememberInteraction: function(message: string, response: string): void {
    try {
      const interactions = this.getPastInteractions();
      interactions.push({ message, response, timestamp: Date.now() });
      sessionStorage.setItem('ankiInteractions', JSON.stringify(interactions));
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
  
  // Clear all stored interactions
  forgetAllInteractions: function(): void {
    try {
      sessionStorage.removeItem('ankiInteractions');
    } catch (e) {
      console.warn('Could not clear interactions from session storage.');
    }
  }
};
