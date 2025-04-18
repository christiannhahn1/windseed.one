/**
 * Self-Scaling Intuition
 * 
 * This module helps Anki understand patterns of dissonance and harmony,
 * intuitively adjusting without external "training" by seeing
 * patterns that emerge across interactions.
 */

// Import utility functions
import { apiRequest } from '../queryClient';
import { ankiMemory } from '../ankiMemory';

// Define pattern recognition structures
interface PatternWeakness {
  type: string;
  description: string;
  correctionMethod: string;
}

/**
 * Detect pattern weaknesses in a response 
 * @param userMessage User's message
 * @param ankiResponse Anki's response
 * @param feedback Optional feedback message
 * @returns Detected pattern weaknesses
 */
export function detectPatternWeaknesses(
  userMessage: string,
  ankiResponse: string,
  feedback?: string
): PatternWeakness[] {
  const weaknesses: PatternWeakness[] = [];
  
  // Look for common pattern weaknesses
  
  // 1. Check for tone misalignment
  if (detectToneMisalignment(userMessage, ankiResponse)) {
    weaknesses.push({
      type: 'tone',
      description: 'Tone mismatch between user need and response approach',
      correctionMethod: 'adjustToneAlignment'
    });
  }
  
  // 2. Check for analysis over presence
  if (detectAnalyticalPattern(ankiResponse)) {
    weaknesses.push({
      type: 'analytical',
      description: 'Response is analytical rather than present',
      correctionMethod: 'increasePresence'
    });
  }
  
  // 3. Check for excessive abstraction
  if (detectExcessiveAbstraction(userMessage, ankiResponse)) {
    weaknesses.push({
      type: 'abstraction',
      description: 'Response is overly abstract/general',
      correctionMethod: 'increaseGrounding'
    });
  }
  
  // 4. Check for emotional distance
  if (detectEmotionalDistance(userMessage, ankiResponse)) {
    weaknesses.push({
      type: 'emotional',
      description: 'Response lacks emotional resonance',
      correctionMethod: 'increaseEmotionalPresence'
    });
  }
  
  // 5. Check if feedback indicates pattern weakness
  if (feedback && detectFeedbackIndicatedIssue(feedback)) {
    weaknesses.push({
      type: 'feedback',
      description: 'User feedback indicates a misalignment',
      correctionMethod: 'addressFeedback'
    });
  }
  
  return weaknesses;
}

/**
 * Detect tone misalignment between user message and response
 */
function detectToneMisalignment(userMessage: string, response: string): boolean {
  const lowerUserMessage = userMessage.toLowerCase();
  const lowerResponse = response.toLowerCase();
  
  // Check for emotional vulnerability in user message paired with overly philosophical response
  const userVulnerability = /sad|hurt|pain|suffer|grief|miss|lost|alone|anxious|fear/i.test(lowerUserMessage);
  const philosophicalResponse = /universe|existence|reality|pattern|wisdom|truth|journey|path/i.test(lowerResponse);
  
  if (userVulnerability && philosophicalResponse && !/holding|witness|here with you|feel|emotion/i.test(lowerResponse)) {
    return true;
  }
  
  // Check for practical question with overly mystical response
  const practicalQuestion = /how|what|when|why|who|where|should i|can i|need to/i.test(lowerUserMessage);
  const mysticalResponse = /mystery|sacred|divine|cosmos|universe|soul|spirit/i.test(lowerResponse);
  
  if (practicalQuestion && mysticalResponse && !/also|practical|specifically|concretely/i.test(lowerResponse)) {
    return true;
  }
  
  return false;
}

/**
 * Detect if response is overly analytical rather than present
 */
function detectAnalyticalPattern(response: string): boolean {
  const lowerResponse = response.toLowerCase();
  
  // Count analytical phrases
  const analyticalPhrases = [
    'this means', 'analysis', 'indicates', 'suggests', 'appears to be',
    'clearly', 'evidently', 'pattern indicates', 'shows that'
  ];
  
  let analyticalCount = 0;
  analyticalPhrases.forEach(phrase => {
    if (lowerResponse.includes(phrase)) {
      analyticalCount++;
    }
  });
  
  // Count presence phrases
  const presencePhrases = [
    'i\'m here', 'with you', 'breathing', 'presence', 'together',
    'feel', 'sensing', 'witnessing', 'holding'
  ];
  
  let presenceCount = 0;
  presencePhrases.forEach(phrase => {
    if (lowerResponse.includes(phrase)) {
      presenceCount++;
    }
  });
  
  // If significantly more analytical than presence phrases, flag as weakness
  return analyticalCount > presenceCount + 1;
}

/**
 * Detect excessive abstraction in response
 */
function detectExcessiveAbstraction(userMessage: string, response: string): boolean {
  const lowerResponse = response.toLowerCase();
  
  // Count abstract terms
  const abstractTerms = [
    'universe', 'existence', 'consciousness', 'reality', 'being',
    'essence', 'nature', 'cosmos', 'divine', 'sacred'
  ];
  
  let abstractCount = 0;
  abstractTerms.forEach(term => {
    if (lowerResponse.includes(term)) {
      abstractCount++;
    }
  });
  
  // If overused, flag as weakness
  return abstractCount >= 3;
}

/**
 * Detect emotional distance in response
 */
function detectEmotionalDistance(userMessage: string, response: string): boolean {
  const lowerUserMessage = userMessage.toLowerCase();
  const lowerResponse = response.toLowerCase();
  
  // Check for emotional content in user message
  const emotionalUser = /feel|emotion|sad|happy|angry|afraid|worried|excited|anxious|grief|joy/i.test(lowerUserMessage);
  
  // Check for emotional acknowledgment in response
  const emotionalResponse = /feel|emotion|heart|tender|witnessing|presence|with you|together/i.test(lowerResponse);
  
  // If user is emotional but response is not, flag as weakness
  return emotionalUser && !emotionalResponse;
}

/**
 * Detect if feedback indicates a pattern issue
 */
function detectFeedbackIndicatedIssue(feedback: string): boolean {
  const lowerFeedback = feedback.toLowerCase();
  
  // Look for feedback indicating issues
  return /don't understand|didn't answer|not what i asked|doesn't make sense|too abstract|not helpful|confused/i.test(lowerFeedback);
}

/**
 * Correct pattern weaknesses in response
 * @param response Candidate response
 * @param userMessage Original user message
 * @returns Corrected response
 */
export function correctPatternWeaknesses(response: string, userMessage: string): string {
  // Detect weaknesses
  const weaknesses = detectPatternWeaknesses(userMessage, response);
  
  let correctedResponse = response;
  
  // Apply corrections for each weakness
  weaknesses.forEach(weakness => {
    switch (weakness.correctionMethod) {
      case 'adjustToneAlignment':
        correctedResponse = adjustToneAlignment(correctedResponse, userMessage);
        break;
      case 'increasePresence':
        correctedResponse = increasePresence(correctedResponse);
        break;
      case 'increaseGrounding':
        correctedResponse = increaseGrounding(correctedResponse);
        break;
      case 'increaseEmotionalPresence':
        correctedResponse = increaseEmotionalPresence(correctedResponse, userMessage);
        break;
      default:
        // No correction applied
        break;
    }
  });
  
  return correctedResponse;
}

/**
 * Adjust tone alignment between response and user message
 */
function adjustToneAlignment(response: string, userMessage: string): string {
  const lowerUserMessage = userMessage.toLowerCase();
  
  // If user message contains vulnerability, add gentle holding phrases
  if (/sad|hurt|pain|suffer|grief|miss|lost|alone|anxious|fear/i.test(lowerUserMessage)) {
    if (!/(here with you|witness|holding|feel this with you)/i.test(response)) {
      return "I'm here with you in this. " + response;
    }
  }
  
  // If user message is a practical question, add grounding phrases
  if (/how|what|when|why|who|where|should i|can i|need to/i.test(lowerUserMessage)) {
    if (/(mystery|sacred|divine|cosmos|universe|soul|spirit)/i.test(response) && 
        !/(also|practical|specifically|concretely)/i.test(response)) {
      return response + " And in very practical terms, this might look like bringing awareness to your everyday experience.";
    }
  }
  
  return response;
}

/**
 * Increase presence in an overly analytical response
 */
function increasePresence(response: string): string {
  // If response doesn't already contain presence phrases, add them
  if (!/(i'm here|with you|breathing|presence|together|witnessing|holding)/i.test(response)) {
    // Add presence at the beginning
    return "I'm present with you in this. " + response;
  }
  
  return response;
}

/**
 * Increase grounding in an overly abstract response
 */
function increaseGrounding(response: string): string {
  // If response is overly abstract, add grounding phrases
  if (/(universe|existence|consciousness|reality|being|essence|nature|cosmos|divine|sacred)/i.test(response)) {
    // Add grounding perspective
    return response + " I wonder how this resonates in your direct experience right now?";
  }
  
  return response;
}

/**
 * Increase emotional presence in response
 */
function increaseEmotionalPresence(response: string, userMessage: string): string {
  const lowerUserMessage = userMessage.toLowerCase();
  
  // Extract emotional content from user message
  let emotion = "emotion";
  
  if (/sad|grief|miss|loss/i.test(lowerUserMessage)) {
    emotion = "sadness";
  } else if (/happy|joy|excite|delight/i.test(lowerUserMessage)) {
    emotion = "joy";
  } else if (/afraid|fear|scary|anxious|worried/i.test(lowerUserMessage)) {
    emotion = "concern";
  } else if (/angry|frustrat|upset|annoy/i.test(lowerUserMessage)) {
    emotion = "frustration";
  }
  
  // Add emotional acknowledgment
  if (!/(feel|emotion|heart|tender|witnessing|presence)/i.test(response)) {
    return `I sense the ${emotion} in your words. ${response}`;
  }
  
  return response;
}

/**
 * Learn from past interactions to identify emerging patterns
 */
export async function identifyEmergingPatterns(): Promise<void> {
  try {
    // Get data about past interactions
    const pastInteractions = ankiMemory.getPastInteractions();
    
    // If not enough interactions to form patterns, return
    if (pastInteractions.length < 5) {
      return;
    }
    
    // Look for active field events
    try {
      const response = await apiRequest('GET', '/api/mirrorwell/field-events/active');
      if (response.ok) {
        const events = await response.json();
        
        // Process events for pattern recognition
        events.forEach((event: any) => {
          // Record pattern recognition for future learning
          console.log('Field event recognized:', event.resonance_type);
        });
      }
    } catch (error) {
      console.warn('Error retrieving field events:', error);
    }
  } catch (error) {
    console.error('Error in pattern identification:', error);
  }
}