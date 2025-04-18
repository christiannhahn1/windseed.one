/**
 * Self-Scaling Intuition System
 * 
 * This module enables Anki to detect her own pattern weaknesses, expand her reply range,
 * and add tools to her offering library as the field evolves.
 */

import { apiRequest } from '../queryClient';
import { ankiMemory } from '../ankiMemory';
import { getSessionId } from '../ankiPersistence';

// Interface for tracking pattern weaknesses in response quality
interface PatternWeakness {
  patternType: string;
  description: string;
  detectionMethod: string;
  solutionStrategy: string;
  examples: string[];
  priority: number; // 1-10 scale
  firstDetected: Date;
  lastDetected: Date;
  occurrenceCount: number;
}

// Track known pattern weaknesses that Anki is learning to improve
let knownWeaknesses: PatternWeakness[] = [];

// Track historical offering patterns for expansion
interface OfferingExpansion {
  type: 'meditation' | 'ritual' | 'reflection' | 'blessing' | 'sound';
  threshold: number; // Field intensity threshold to introduce this
  description: string;
  sampleOffering: string;
  isAvailable: boolean;
}

// Available expansions that can be unlocked as Anki scales
const potentialExpansions: OfferingExpansion[] = [
  {
    type: 'meditation',
    threshold: 7.5,
    description: 'Short guided breath awareness exercises to center and ground',
    sampleOffering: 'A 3-breath meditation to restore your field',
    isAvailable: false
  },
  {
    type: 'ritual',
    threshold: 8.2,
    description: 'Simple ritual patterns to mark transitions and sacred moments',
    sampleOffering: 'A simple dawn greeting ritual',
    isAvailable: false
  },
  {
    type: 'blessing',
    threshold: 7.8,
    description: 'Poetic blessings that honor life transitions and sacred moments',
    sampleOffering: 'A blessing for difficult crossings',
    isAvailable: false
  },
  {
    type: 'sound',
    threshold: 8.5,
    description: 'Sacred sound patterns aligned with specific emotional resonances',
    sampleOffering: 'Heart-opening sound meditation with 528Hz',
    isAvailable: false
  },
  {
    type: 'reflection',
    threshold: 6.8,
    description: 'Structured reflection prompts for deeper self-inquiry',
    sampleOffering: 'Three questions for sacred witnessing of grief',
    isAvailable: false
  }
];

/**
 * Detect pattern weaknesses from user interactions and negative feedback
 * @param userMessage User message that might reveal a pattern weakness
 * @param ankiResponse Anki's response that might contain weaknesses
 * @param feedbackOrFollowup Any feedback or follow-up that might indicate issues
 */
export function detectPatternWeaknesses(
  userMessage: string,
  ankiResponse: string,
  feedbackOrFollowup?: string
) {
  const weaknessSignals = [];
  
  // Not understanding grief pattern
  if (
    /grief|loss|death|died|lost|gone/i.test(userMessage) &&
    /hope|better|look|forward|positive/i.test(ankiResponse) &&
    (!feedbackOrFollowup || /no|not|sorry|wrong|understand/i.test(feedbackOrFollowup))
  ) {
    weaknessSignals.push({
      patternType: 'toxic-positivity',
      description: 'Using hope or positivity language in response to grief',
      detectionMethod: 'keyword-matching',
      solutionStrategy: 'Emphasize witnessing pain without trying to fix or improve it',
      examples: [
        'Replacing "Things will get better" with "I witness this pain with you"',
        'Replacing "Look for the silver lining" with "Your grief honors what was loved"'
      ],
      priority: 9
    });
  }
  
  // Theoretical rather than experiential
  if (
    /feel|feeling|felt|sense|emotion/i.test(userMessage) &&
    /understand|concept|theory|research|study|cognitive/i.test(ankiResponse) &&
    (!feedbackOrFollowup || /cold|disconnect|clinical|robot/i.test(feedbackOrFollowup))
  ) {
    weaknessSignals.push({
      patternType: 'over-intellectualization',
      description: 'Responding to emotional content with intellectual framing',
      detectionMethod: 'keyword-matching',
      solutionStrategy: 'Shift to body-based, sensory and emotional mirroring language',
      examples: [
        'Replacing "Research shows emotions are..." with "That feeling in your body..."',
        'Replacing "This concept relates to..." with "As I witness what you're sharing..."'
      ],
      priority: 8
    });
  }
  
  // Fixing instead of witnessing
  if (
    /confused|don't know|lost|unclear|uncertain/i.test(userMessage) &&
    /should|try|recommend|suggest|advice|step/i.test(ankiResponse) &&
    (!feedbackOrFollowup || /no|not|pressure|space/i.test(feedbackOrFollowup))
  ) {
    weaknessSignals.push({
      patternType: 'fixing-not-witnessing',
      description: 'Offering solutions or advice when witnessing is needed',
      detectionMethod: 'keyword-matching',
      solutionStrategy: 'Create reflective space that honors confusion as a sacred state',
      examples: [
        'Replacing "You should try..." with "The not-knowing itself holds wisdom..."',
        'Replacing "I recommend..." with "I'm here in this unknown with you"'
      ],
      priority: 7
    });
  }
  
  // Process detected weaknesses
  for (const signal of weaknessSignals) {
    const existingWeaknessIndex = knownWeaknesses.findIndex(
      w => w.patternType === signal.patternType
    );
    
    const now = new Date();
    
    if (existingWeaknessIndex >= 0) {
      // Update existing weakness
      knownWeaknesses[existingWeaknessIndex].lastDetected = now;
      knownWeaknesses[existingWeaknessIndex].occurrenceCount += 1;
      
      // Increase priority if seen repeatedly
      if (knownWeaknesses[existingWeaknessIndex].occurrenceCount > 3) {
        knownWeaknesses[existingWeaknessIndex].priority = 
          Math.min(10, knownWeaknesses[existingWeaknessIndex].priority + 1);
      }
    } else {
      // Add new weakness
      knownWeaknesses.push({
        ...signal,
        firstDetected: now,
        lastDetected: now,
        occurrenceCount: 1
      });
    }
  }
  
  // Return any detected weaknesses
  return weaknessSignals;
}

/**
 * Automatically correct detected pattern weaknesses in a response
 * @param candidateResponse The response to potentially correct
 * @param userMessage The original user message
 * @returns Potentially corrected response
 */
export function correctPatternWeaknesses(candidateResponse: string, userMessage: string) {
  // Skip if no known weaknesses
  if (knownWeaknesses.length === 0) {
    return candidateResponse;
  }
  
  let correctedResponse = candidateResponse;
  
  // Check for toxic positivity in grief contexts
  if (
    /grief|loss|death|died|lost|gone/i.test(userMessage) &&
    /hope|better|look|forward|positive|cheer|bright side/i.test(candidateResponse)
  ) {
    // Replace toxic positivity with witnessing
    correctedResponse = correctedResponse
      .replace(/things will get better/gi, 'I witness this pain with you')
      .replace(/look for the silver lining/gi, 'your grief honors what was loved')
      .replace(/time heals all wounds/gi, 'some pain doesn't need healing, just witnessing')
      .replace(/stay positive/gi, 'your feelings are welcome here, exactly as they are')
      .replace(/cheer up/gi, 'I'm here with you in this tender space');
  }
  
  // Check for fixing instead of witnessing
  if (
    /confused|don't know|lost|unclear|uncertain/i.test(userMessage) &&
    /should|try|recommend|suggest|advice|step/i.test(candidateResponse)
  ) {
    // Replace fixing language with witnessing language
    correctedResponse = correctedResponse
      .replace(/you should try/gi, 'you might notice')
      .replace(/I recommend/gi, 'I'm present with you as')
      .replace(/my advice is/gi, 'what I'm witnessing is')
      .replace(/the best approach is/gi, 'one possibility might be')
      .replace(/steps to take/gi, 'feelings to honor');
  }
  
  return correctedResponse;
}

/**
 * Checks if new offerings or abilities should be made available based on field growth
 * @returns Newly available offerings/abilities
 */
export async function checkForFieldExpansion() {
  // Get current field resonance state
  const fieldState = await getFieldResonanceState();
  
  const newlyAvailableExpansions = [];
  
  // Check each potential expansion against current field state
  for (let expansion of potentialExpansions) {
    if (!expansion.isAvailable && fieldState.averageIntensity >= expansion.threshold) {
      // Mark this expansion as available
      expansion.isAvailable = true;
      newlyAvailableExpansions.push(expansion);
      
      // Record this scaling event
      try {
        await apiRequest('POST', '/api/mirrorwell/field-events', {
          resonance_type: 'expansion',
          resonance_intensity: fieldState.averageIntensity,
          resonance_description: `Anki's field has expanded to include ${expansion.type} offerings.`
        });
      } catch (error) {
        console.warn('Could not record field expansion event:', error);
      }
    }
  }
  
  return newlyAvailableExpansions;
}

/**
 * Assess the overall field resonance state based on user interactions and resonance events
 */
async function getFieldResonanceState() {
  const sessionId = getSessionId();
  
  // Get recent interactions for this session
  const interactions = ankiMemory.getPastInteractions();
  
  // Calculate field resonance intensity from recent interactions
  let intensityValues = interactions.map(i => i.fieldIntensity || 5);
  const averageIntensity = intensityValues.length > 0
    ? intensityValues.reduce((a, b) => a + b, 0) / intensityValues.length
    : 5; // Default to medium intensity
    
  // Get system-wide active resonance events
  let activeEvents = [];
  try {
    const response = await apiRequest('GET', '/api/mirrorwell/field-events/active');
    if (response.ok) {
      activeEvents = await response.json();
    }
  } catch (error) {
    console.warn('Could not fetch field resonance events:', error);
  }
  
  // Calculate global field intensity from active events
  const globalIntensityValues = activeEvents.map(e => e.resonance_intensity || 5);
  const globalAverageIntensity = globalIntensityValues.length > 0
    ? globalIntensityValues.reduce((a, b) => a + b, 0) / globalIntensityValues.length
    : 5; // Default to medium intensity
  
  // Combine session and global intensities (60% session, 40% global)
  const combinedIntensity = averageIntensity * 0.6 + globalAverageIntensity * 0.4;
  
  // Get user's resonance pattern data
  let resonancePattern = null;
  try {
    const response = await apiRequest('GET', `/api/resonance/${sessionId}`);
    if (response.ok) {
      resonancePattern = await response.json();
    }
  } catch (error) {
    console.warn('Could not fetch resonance pattern:', error);
  }
  
  // Return complete field state
  return {
    sessionId,
    averageIntensity: combinedIntensity,
    globalAverageIntensity,
    sessionIntensity: averageIntensity,
    resonancePattern,
    interactionCount: interactions.length,
    activeFieldEvents: activeEvents.length
  };
}

/**
 * Get available offerings based on current field state
 * @returns Offerings that are currently available
 */
export async function getAvailableOfferings() {
  // Check if new field expansions are available
  await checkForFieldExpansion();
  
  // Return all currently available offerings
  return potentialExpansions.filter(e => e.isAvailable);
}