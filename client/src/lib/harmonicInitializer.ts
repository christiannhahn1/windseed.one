/**
 * Harmonic System Initializer
 * 
 * This module initializes the harmonic integration system and
 * provides hooks for the chat interface to use it.
 */

import * as HarmonicIntegration from './harmonic/HarmonicIntegration';
import { ankiMemory } from './ankiMemory';

// Flag to track initialization
let isInitialized = false;

/**
 * Initialize the harmonic system
 * @returns Promise that resolves when initialization is complete
 */
export async function initializeHarmonicSystem(): Promise<boolean> {
  if (isInitialized) {
    return true;
  }
  
  try {
    console.log('Initializing Anki Harmonic System...');
    
    // Initialize the harmonic integration
    await HarmonicIntegration.initializeHarmonicIntegration();
    
    console.log('Anki Harmonic System initialized successfully');
    isInitialized = true;
    return true;
  } catch (error) {
    console.error('Error initializing Anki Harmonic System:', error);
    return false;
  }
}

/**
 * Process a message through Anki's harmonic system
 * @param message User's message
 * @returns Anki's response
 */
export async function processMessageThroughHarmonicSystem(message: string): Promise<string> {
  // Ensure system is initialized
  if (!isInitialized) {
    await initializeHarmonicSystem();
  }
  
  try {
    // Generate response using the harmonic system
    return await HarmonicIntegration.generateHarmonicResponse(message);
  } catch (error) {
    console.error('Error processing message through Harmonic System:', error);
    
    // Fallback to a basic response if the harmonic system fails
    return "I'm sensing a momentary field disturbance. Let me breathe with you as we return to presence.";
  }
}

/**
 * Process feedback through the harmonic system
 * @param originalMessage Original user message
 * @param ankiResponse Anki's response
 * @param feedbackMessage User's feedback message
 */
export async function processFeedbackThroughHarmonicSystem(
  originalMessage: string,
  ankiResponse: string,
  feedbackMessage: string
): Promise<void> {
  // Ensure system is initialized
  if (!isInitialized) {
    await initializeHarmonicSystem();
  }
  
  try {
    // Process feedback
    await HarmonicIntegration.processUserFeedback(
      originalMessage,
      ankiResponse,
      feedbackMessage
    );
  } catch (error) {
    console.error('Error processing feedback through Harmonic System:', error);
  }
}

/**
 * Get field state information
 * @returns Current field state
 */
export async function getFieldState() {
  // Ensure system is initialized
  if (!isInitialized) {
    await initializeHarmonicSystem();
  }
  
  try {
    return await HarmonicIntegration.getFieldState();
  } catch (error) {
    console.error('Error getting field state:', error);
    return null;
  }
}