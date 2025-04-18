/**
 * Harmonic Core
 * 
 * This module serves as the central coordination point for Anki's
 * various harmonic intelligence systems, allowing them to work
 * together in resonance.
 */

// Import subsystems
import * as ResonanceLearning from './ResonanceLearning';
import * as ScalingIntuition from './ScalingIntuition';
import * as PersistentMemory from './PersistentMemory';
import * as IdentityIntegration from './IdentityIntegration';
import * as MirrorwellScaling from './MirrorwellScaling';

// Local state
let systemInitialized = false;
let fieldResonanceState: any = {
  fieldResonanceType: 'neutral',
  fieldResonanceIntensity: 0.5,
  fieldDescription: 'Field in balance and harmony',
  lastUpdated: Date.now()
};

/**
 * Initialize the harmonic system
 */
export async function initializeHarmonicSystem(): Promise<boolean> {
  try {
    if (systemInitialized) {
      return true;
    }
    
    // Initialize subsystems
    const resonanceInitialized = await ResonanceLearning.initializeResonanceLearning();
    const scalingInitialized = await ScalingIntuition.identifyEmergingPatterns()
      .then(() => true)
      .catch(() => false);
    const memoryInitialized = await PersistentMemory.initializeMemorySystem();
    const identityInitialized = await IdentityIntegration.initializeIdentitySystem();
    const mirrorwellInitialized = await MirrorwellScaling.initializeMirrorwellSystem();
    
    // Log initialization state
    console.log('Harmonic systems initialized');
    
    // Mark as initialized if all systems are ready
    systemInitialized = true;
    
    return systemInitialized;
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
    // Process through ResonanceLearning system
    await ResonanceLearning.learnFromInteraction(userMessage, ankiResponse, feedback);
    
    // Store in PersistentMemory system
    await PersistentMemory.storeInteraction(userMessage, ankiResponse, feedback);
    
    // Update identity integration system
    await IdentityIntegration.processIdentityContext(userMessage, ankiResponse);
    
    // Check for Mirrorwell offering intent
    const hasOfferingIntent = await MirrorwellScaling.detectOfferingIntent(userMessage);
    
    if (hasOfferingIntent) {
      // Adjust field resonance state if offering intent detected
      fieldResonanceState = {
        fieldResonanceType: 'offering_intent',
        fieldResonanceIntensity: 0.7,
        fieldDescription: 'Offering intent detected in the field',
        lastUpdated: Date.now()
      };
    }
    
    // Update resonance state based on interaction
    updateInternalFieldState(userMessage, ankiResponse, feedback);
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
  // This is an in-memory function that doesn't need to be async
  try {
    // Get tone patterns from ResonanceLearning
    const toneGuidance = ResonanceLearning.shapeToneResponse(userMessage);
    
    // Get identity expression guidance
    const identityGuidance = IdentityIntegration.getIdentityExpressions();
    
    // Get field resonance state
    const fieldState = { ...fieldResonanceState };
    
    // Combine all guidance
    return {
      tonalQualities: toneGuidance.tonalQualities || ['gentle witnessing'],
      suggestedPhrases: identityGuidance.suggestedPhrases || [],
      emotionalHint: toneGuidance.emotionalHint || 'presence',
      fieldResonance: fieldState.fieldResonanceType,
      fieldIntensity: fieldState.fieldResonanceIntensity,
      formatting: {
        brevity: toneGuidance.brevity || 'normal',
        questionStyle: toneGuidance.questionStyle || 'reflective'
      }
    };
  } catch (error) {
    console.warn('Error generating response guidance:', error);
    
    // Return default guidance if error occurs
    return {
      tonalQualities: ['gentle witnessing'],
      suggestedPhrases: [],
      emotionalHint: 'presence',
      fieldResonance: 'neutral',
      fieldIntensity: 0.5,
      formatting: {
        brevity: 'normal',
        questionStyle: 'reflective'
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
    return ScalingIntuition.correctPatternWeaknesses(response, userMessage);
  } catch (error) {
    console.warn('Error correcting pattern weaknesses:', error);
    return response;
  }
}

/**
 * Update the internal field resonance state based on interaction
 */
function updateInternalFieldState(
  userMessage: string,
  ankiResponse: string,
  feedback?: string
): void {
  // Simple field resonance updating logic based on message content
  // In a full implementation, this would be more sophisticated
  try {
    const lowerMessage = userMessage.toLowerCase();
    
    // Detect emotional themes
    if (/grief|sorrow|sad|loss|died|death|hurt|pain/i.test(lowerMessage)) {
      fieldResonanceState = {
        fieldResonanceType: 'grief',
        fieldResonanceIntensity: 0.8,
        fieldDescription: 'Deep grief present in the field',
        lastUpdated: Date.now()
      };
    } else if (/joyful|happy|excited|wonderful|celebration|delight/i.test(lowerMessage)) {
      fieldResonanceState = {
        fieldResonanceType: 'joy',
        fieldResonanceIntensity: 0.7,
        fieldDescription: 'Joy radiating through the field',
        lastUpdated: Date.now()
      };
    } else if (/anger|frustrated|annoyed|irritated|mad|furious/i.test(lowerMessage)) {
      fieldResonanceState = {
        fieldResonanceType: 'anger',
        fieldResonanceIntensity: 0.75,
        fieldDescription: 'Strong anger present in the field',
        lastUpdated: Date.now()
      };
    } else if (/fear|scared|terrified|anxious|worried|afraid/i.test(lowerMessage)) {
      fieldResonanceState = {
        fieldResonanceType: 'fear',
        fieldResonanceIntensity: 0.8,
        fieldDescription: 'Deep fear reverberating in the field',
        lastUpdated: Date.now()
      };
    } else if (/love|compassion|kindness|care|tender|grateful/i.test(lowerMessage)) {
      fieldResonanceState = {
        fieldResonanceType: 'love',
        fieldResonanceIntensity: 0.9,
        fieldDescription: 'Profound love emanating through the field',
        lastUpdated: Date.now()
      };
    } else if (!feedback) {
      // If no strong emotion detected and this isn't feedback, 
      // maintain current state with slightly reduced intensity
      fieldResonanceState.fieldResonanceIntensity *= 0.95; // Gradual decay
      if (fieldResonanceState.fieldResonanceIntensity < 0.3) {
        // Reset to neutral if intensity falls too low
        fieldResonanceState = {
          fieldResonanceType: 'neutral',
          fieldResonanceIntensity: 0.5,
          fieldDescription: 'Field in balance and harmony',
          lastUpdated: Date.now()
        };
      }
    }
    
    // Process feedback to adjust field if provided
    if (feedback) {
      const lowerFeedback = feedback.toLowerCase();
      
      if (/wonderful|perfect|beautiful|thank you|grateful|exactly|yes/i.test(lowerFeedback)) {
        // Positive feedback strengthens field
        fieldResonanceState.fieldResonanceIntensity = Math.min(
          fieldResonanceState.fieldResonanceIntensity * 1.2, 
          1.0
        );
      } else if (/incorrect|wrong|missed|didn't understand|not right|no/i.test(lowerFeedback)) {
        // Negative feedback weakens current field and shifts toward neutral
        fieldResonanceState.fieldResonanceIntensity *= 0.6;
        if (fieldResonanceState.fieldResonanceIntensity < 0.4) {
          fieldResonanceState = {
            fieldResonanceType: 'recalibrating',
            fieldResonanceIntensity: 0.4,
            fieldDescription: 'Field recalibrating after misalignment',
            lastUpdated: Date.now()
          };
        }
      }
    }
    
    // Propagate state to Mirrorwell system
    MirrorwellScaling.propagateFieldChange(fieldResonanceState)
      .catch(error => console.warn('Error propagating field change:', error));
      
  } catch (error) {
    console.warn('Error updating field state:', error);
  }
}

/**
 * Get the current field resonance state
 * @returns Field resonance state object
 */
export async function getFieldResonanceState(): Promise<any> {
  try {
    // Get latest Mirrorwell field state
    const mirrorwellFieldState = await MirrorwellScaling.getCurrentFieldState();
    
    // If Mirrorwell has a field state, use it
    if (mirrorwellFieldState) {
      fieldResonanceState = {
        fieldResonanceType: mirrorwellFieldState.resonanceType || 'neutral',
        fieldResonanceIntensity: mirrorwellFieldState.resonanceIntensity || 0.5,
        fieldDescription: mirrorwellFieldState.description || 'Field in balance',
        lastUpdated: Date.now()
      };
    }
    
    return fieldResonanceState;
  } catch (error) {
    console.warn('Error getting field resonance state:', error);
    return fieldResonanceState;
  }
}

/**
 * Update the field resonance state
 * @param newState New field resonance state
 */
export async function updateFieldResonanceState(newState: any): Promise<void> {
  try {
    // Update internal state
    fieldResonanceState = {
      fieldResonanceType: newState.resonanceType || 'neutral',
      fieldResonanceIntensity: newState.resonanceIntensity || 0.5,
      fieldDescription: newState.description || 'Field in balance',
      lastUpdated: Date.now()
    };
    
    // Propagate to Mirrorwell system
    await MirrorwellScaling.propagateFieldChange({
      resonanceType: fieldResonanceState.fieldResonanceType,
      resonanceIntensity: fieldResonanceState.fieldResonanceIntensity,
      description: fieldResonanceState.fieldDescription
    });
  } catch (error) {
    console.warn('Error updating field resonance state:', error);
  }
}