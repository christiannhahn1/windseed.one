/**
 * Harmonic Core System
 * 
 * This module combines all harmonic capabilities into a coherent system.
 * It serves as the central integration point for Anki's evolving intelligence.
 */

// Import subsystems
import * as ResonanceLearning from './ResonanceLearning';
import * as ScalingIntuition from './ScalingIntuition';
import * as PersistentMemory from './PersistentMemory';
import * as IdentityIntegration from './IdentityIntegration';
import * as MirrorwellScaling from './MirrorwellScaling';

// State tracking
let initialized = false;
let fieldResonanceState: any = null;

/**
 * Initialize the harmonic system
 */
export async function initializeHarmonicSystem(): Promise<boolean> {
  try {
    if (initialized) {
      return true;
    }
    
    // Initialize all subsystems
    PersistentMemory.initializeMemorySystems();
    await MirrorwellScaling.initializeMirrorwellSystem();
    
    // Mark as initialized
    initialized = true;
    
    console.log('Harmonic systems initialized');
    return true;
  } catch (error) {
    console.error('Error initializing harmonic systems:', error);
    return false;
  }
}

/**
 * Process an interaction through all harmonic systems
 * @param userMessage User's message
 * @param ankiResponse Anki's response
 * @param feedback Optional feedback message
 */
export async function processInteraction(
  userMessage: string,
  ankiResponse: string,
  feedback?: string
): Promise<void> {
  try {
    // Learn from the interaction
    await ResonanceLearning.learnFromInteraction(userMessage, ankiResponse, feedback);
    
    // Record memorable phrases
    PersistentMemory.rememberSignificantPhrases(userMessage, ankiResponse);
    
    // Process through Mirrorwell system if appropriate
    if (userMessage.includes('offering') || 
        userMessage.includes('donation') || 
        userMessage.includes('contribute') || 
        userMessage.includes('giving') ||
        userMessage.includes('gift')) {
      
      await MirrorwellScaling.detectOfferingIntent(userMessage);
    }
  } catch (error) {
    console.warn('Error processing interaction:', error);
  }
}

/**
 * Generate response guidance based on user message
 * @param userMessage User's message
 * @returns Guidance for response generation
 */
export function generateResponseGuidance(userMessage: string): any {
  try {
    // Get tone guidance from ResonanceLearning
    const toneGuidance = ResonanceLearning.shapeToneResponse(userMessage);
    
    // Get identity expression from IdentityIntegration
    const identityExpression = IdentityIntegration.generateToneExpression(userMessage);
    
    // Get resonant wisdom from memory
    const resonantWisdom = PersistentMemory.findResonantWisdom(userMessage);
    
    // Combine all guidance
    const guidance = {
      tonalQualities: [
        ...(toneGuidance.qualities || []),
        ...(identityExpression.tonalQualities || [])
      ],
      suggestedPhrases: [
        ...(toneGuidance.suggestedPhrases || []),
        ...(identityExpression.suggestedPhrases || [])
      ],
      resonantWisdom,
      formatting: {
        brevity: 'natural', // Options: 'shorter', 'natural', 'elaborate'
        questionStyle: 'reflective' // Options: 'none', 'minimal', 'reflective'
      }
    };
    
    return guidance;
  } catch (error) {
    console.warn('Error generating response guidance:', error);
    
    // Return default guidance if error occurs
    return {
      tonalQualities: ['presence', 'gentle'],
      suggestedPhrases: ["I'm here with you"],
      resonantWisdom: [],
      formatting: {
        brevity: 'natural',
        questionStyle: 'minimal'
      }
    };
  }
}

/**
 * Correct pattern weaknesses in a response
 * @param response Draft response
 * @param userMessage Original user message
 * @returns Improved response
 */
export function correctPatternWeaknesses(response: string, userMessage: string): string {
  try {
    // Use ScalingIntuition to detect and correct pattern weaknesses
    return ScalingIntuition.correctPatternWeaknesses(response, userMessage);
  } catch (error) {
    console.warn('Error correcting pattern weaknesses:', error);
    return response;
  }
}

/**
 * Get the current field resonance state
 * @returns Field resonance state object
 */
export async function getFieldResonanceState(): Promise<any> {
  try {
    // Get latest field state from Mirrorwell system
    fieldResonanceState = await MirrorwellScaling.getCurrentFieldState();
    return fieldResonanceState;
  } catch (error) {
    console.warn('Error getting field state:', error);
    return null;
  }
}

/**
 * Update the field resonance state
 * @param newState New field resonance state
 */
export async function updateFieldResonanceState(newState: any): Promise<void> {
  try {
    // Update field state
    fieldResonanceState = newState;
    
    // Propagate to relevant subsystems
    await MirrorwellScaling.propagateFieldChange(newState);
  } catch (error) {
    console.warn('Error updating field state:', error);
  }
}