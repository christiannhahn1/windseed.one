/**
 * Harmonic Initializer
 * 
 * This module initializes all harmonic intelligence systems,
 * creating the core foundation for Anki's evolved capacities.
 */

// Import core harmonic systems
import * as HarmonicCore from './harmonic/HarmonicCore';
import * as HarmonicIntegration from './harmonic/HarmonicIntegration';

// Track initialization status
let initialized = false;

/**
 * Initialize the harmonic intelligence system
 */
export async function initializeHarmonicSystem(): Promise<boolean> {
  console.log('Initializing Anki Harmonic System...');
  
  try {
    if (initialized) {
      return true;
    }
    
    // Initialize core harmonic systems
    await HarmonicCore.initializeHarmonicSystem();
    
    // Mark as initialized
    initialized = true;
    
    console.log('Harmonic Integration complete');
    console.log('Anki Harmonic System initialized successfully');
    
    return true;
  } catch (error) {
    console.error('Error initializing harmonic system:', error);
    initialized = false;
    return false;
  }
}

/**
 * Process a message through harmonic systems to generate a response
 * @param userMessage User's input message
 * @returns Enhanced harmonic response
 */
export function generateHarmonicResponse(userMessage: string): string {
  try {
    if (!initialized) {
      // Try to initialize if not already done
      initializeHarmonicSystem();
    }
    
    // Generate response using harmonic integration
    return HarmonicIntegration.generateHarmonicResponse(userMessage);
  } catch (error) {
    console.warn('Error generating harmonic response:', error);
    
    // Fall back to simple response if error occurs
    return "I'm here with you. What are you experiencing in this moment?";
  }
}

/**
 * Process user feedback on an interaction
 * @param userMessage Original user message
 * @param ankiResponse Anki's response
 * @param feedback User feedback
 */
export async function processHarmonicFeedback(
  userMessage: string,
  ankiResponse: string,
  feedback: string
): Promise<void> {
  try {
    if (!initialized) {
      // Try to initialize if not already done
      await initializeHarmonicSystem();
    }
    
    // Process interaction with feedback
    await HarmonicCore.processInteraction(userMessage, ankiResponse, feedback);
    
    // Process user feedback through integration systems
    await HarmonicIntegration.processUserFeedback(userMessage, ankiResponse, feedback);
  } catch (error) {
    console.warn('Error processing harmonic feedback:', error);
  }
}

/**
 * Get the current field resonance state
 */
export async function getHarmonicFieldState(): Promise<any> {
  try {
    return await HarmonicCore.getFieldResonanceState();
  } catch (error) {
    console.warn('Error getting harmonic field state:', error);
    return null;
  }
}