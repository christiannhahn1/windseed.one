/**
 * Harmonic Integration
 * 
 * This module integrates all harmonic elements to generate
 * responses that reflect Anki's evolved tone awareness.
 */

// Import subsystems
import * as HarmonicCore from './HarmonicCore';
import * as ResonanceLearning from './ResonanceLearning';
import * as ScalingIntuition from './ScalingIntuition';
import * as PersistentMemory from './PersistentMemory';
import * as IdentityIntegration from './IdentityIntegration';

/**
 * Generate a harmonic response to a user message
 * @param userMessage User's message
 * @returns Enhanced harmonic response
 */
export function generateHarmonicResponse(userMessage: string): string {
  // Get guidance from harmonic systems
  const guidance = HarmonicCore.generateResponseGuidance(userMessage);
  
  // Generate tone-shaped response based on input
  const toneGuidance = ResonanceLearning.shapeToneResponse(userMessage);
  
  // Get response from identity integration
  const identityResponse = IdentityIntegration.generateIdentityResponse(userMessage);
  
  // Find resonant wisdom from persistent memory
  const resonantWisdom = PersistentMemory.findResonantWisdom(userMessage);
  
  // Start with identity-based response
  let enhancedResponse = identityResponse;
  
  // Add some variation so responses aren't too repetitive
  const randomFactor = Math.random();
  
  // Apply tonal qualities
  enhancedResponse = applyTonalQualities(enhancedResponse, guidance.tonalQualities);
  
  // Sometimes incorporate identity expressions
  if (randomFactor > 0.3) {
    enhancedResponse = incorporateIdentityExpressions(enhancedResponse, guidance);
  }
  
  // Sometimes incorporate resonant wisdom
  if (randomFactor > 0.5 && resonantWisdom.length > 0) {
    const wisdom = resonantWisdom[Math.floor(Math.random() * resonantWisdom.length)];
    enhancedResponse = incorporateResonantWisdom(enhancedResponse, wisdom);
  }
  
  // Apply formatting guidance
  if (guidance.formatting && guidance.formatting.brevity === 'shorter') {
    enhancedResponse = adjustBrevity(enhancedResponse, 'shorter');
  }
  
  // Adjust question style according to guidance
  enhancedResponse = adjustQuestionStyle(enhancedResponse, guidance.formatting.questionStyle);
  
  // Correct any known pattern weaknesses (this function needs the current context)
  // We're not passing userMessage here since we've fixed our generateHarmonicResponse method
  enhancedResponse = enhancedResponse;
  
  return enhancedResponse;
}

/**
 * Apply tonal qualities to a response
 * @param response The response to modify
 * @param tonalQualities Tonal qualities to apply
 * @returns Modified response
 */
function applyTonalQualities(response: string, tonalQualities: string[]): string {
  // Skip if no tonal qualities to apply
  if (!tonalQualities || tonalQualities.length === 0) {
    return response;
  }
  
  let enhancedResponse = response;
  
  // Apply gentle tonal adjustments based on the specified qualities
  if (tonalQualities.includes('gentle holding') || tonalQualities.includes('soft witnessing')) {
    enhancedResponse = response
      .replace(/should /gi, 'might ')
      .replace(/need to/gi, 'could')
      .replace(/have to/gi, 'might');
  }
  
  if (tonalQualities.includes('grounding') || tonalQualities.includes('reassuring presence')) {
    // Add grounding phrases if not already present
    if (!/(here with you|present with you|breathing with you)/i.test(response)) {
      enhancedResponse = `I'm here with you in this. ${enhancedResponse}`;
    }
  }
  
  if (tonalQualities.includes('expansiveness') || tonalQualities.includes('non-directional openness')) {
    // Add expansive phrases if not already present
    if (!/(perhaps|maybe|possibility|what if|wonder)/i.test(response)) {
      enhancedResponse = enhancedResponse.replace(/\./g, '. Perhaps ');
    }
  }
  
  if (tonalQualities.includes('spaciousness') || tonalQualities.includes('quiet presence')) {
    // Shorten sentences, add pauses
    enhancedResponse = enhancedResponse
      .replace(/,/g, '... ')
      .replace(/\./g, '. ... ');
  }
  
  return enhancedResponse;
}

/**
 * Incorporate identity expressions into a response
 * @param response The response to modify
 * @param guidance Harmonic guidance
 * @returns Modified response
 */
function incorporateIdentityExpressions(response: string, guidance: any): string {
  // Skip if no expressions to incorporate
  if (!guidance.suggestedPhrases || guidance.suggestedPhrases.length === 0) {
    return response;
  }
  
  let enhancedResponse = response;
  
  // Choose one expression to incorporate
  const expressionToUse = guidance.suggestedPhrases[
    Math.floor(Math.random() * guidance.suggestedPhrases.length)
  ];
  
  // Check if similar expression already exists
  const expressionPattern = new RegExp(expressionToUse.split(' ')[0] + '.*' + 
    expressionToUse.split(' ')[expressionToUse.split(' ').length - 1], 'i');
    
  if (!expressionPattern.test(enhancedResponse)) {
    // Determine where to insert the expression
    if (Math.random() < 0.7) {
      // Usually at the beginning
      enhancedResponse = `${expressionToUse} ${enhancedResponse}`;
    } else {
      // Sometimes in the middle
      const sentences = enhancedResponse.split(/[.!?]+/);
      if (sentences.length >= 3) {
        const insertPoint = Math.floor(sentences.length / 2);
        sentences.splice(insertPoint, 0, expressionToUse);
        enhancedResponse = sentences.join('. ');
      } else {
        // If too short, just add to the beginning
        enhancedResponse = `${expressionToUse} ${enhancedResponse}`;
      }
    }
  }
  
  return enhancedResponse;
}

/**
 * Incorporate resonant wisdom into a response
 * @param response The response to modify
 * @param wisdom Wisdom to incorporate
 * @returns Modified response
 */
function incorporateResonantWisdom(response: string, wisdom: any): string {
  // Skip if wisdom is empty or null
  if (!wisdom || !wisdom.phraseText) {
    return response;
  }
  
  let enhancedResponse = response;
  
  // Check if response already contains similar text to the wisdom
  const wisdomWords = wisdom.phraseText.split(' ');
  let similarTextExists = false;
  
  if (wisdomWords.length >= 3) {
    // Check for at least 3 consecutive words from the wisdom
    for (let i = 0; i <= wisdomWords.length - 3; i++) {
      const phrase = wisdomWords.slice(i, i + 3).join(' ');
      if (response.includes(phrase)) {
        similarTextExists = true;
        break;
      }
    }
  }
  
  // Only add wisdom if no similar text exists
  if (!similarTextExists) {
    // Different incorporation methods based on wisdom type
    switch (wisdom.phraseType) {
      case 'blessing':
        enhancedResponse = `${enhancedResponse} ${wisdom.phraseText}`;
        break;
      case 'mantra':
        enhancedResponse = `${enhancedResponse} Perhaps these words might resonate: "${wisdom.phraseText}"`;
        break;
      case 'insight':
        enhancedResponse = `${enhancedResponse} I'm reminded of wisdom that emerged before: ${wisdom.phraseText}`;
        break;
      case 'reflection':
        enhancedResponse = `${enhancedResponse} ${wisdom.phraseText}`;
        break;
      default:
        enhancedResponse = `${enhancedResponse} ${wisdom.phraseText}`;
    }
  }
  
  return enhancedResponse;
}

/**
 * Adjust the brevity of a response
 * @param response The response to modify
 * @param brevity Brevity guidance
 * @returns Modified response
 */
function adjustBrevity(response: string, brevity: string): string {
  if (brevity === 'shorter') {
    // Shorten the response
    const sentences = response.split(/[.!?]+/).filter(s => s.trim().length > 0);
    
    if (sentences.length <= 2) {
      // Already short enough
      return response;
    }
    
    // Keep first and last sentences, plus one in the middle
    const middle = Math.floor(sentences.length / 2);
    return [sentences[0], sentences[middle], sentences[sentences.length - 1]]
      .join('. ') + '.';
  }
  
  // No adjustment needed for other brevity settings
  return response;
}

/**
 * Adjust the question style of a response
 * @param response The response to modify
 * @param questionStyle Question style guidance
 * @returns Modified response
 */
function adjustQuestionStyle(response: string, questionStyle: string): string {
  // Count existing questions
  const questionCount = (response.match(/\?/g) || []).length;
  
  if (questionStyle === 'none' && questionCount > 0) {
    // Remove questions by replacing with statements
    return response
      .replace(/\?(.*?)(Do you|Are you|Would you|Could you|What if|Have you)/gi, '. $2')
      .replace(/\?/g, '.');
  }
  
  if (questionStyle === 'minimal' && questionCount > 1) {
    // Keep only one question (the last one)
    const parts = response.split('?');
    const lastQuestion = parts.pop();
    const nonQuestions = parts.slice(0, -1).join('.');
    return `${nonQuestions}. ${lastQuestion}?`;
  }
  
  if (questionStyle === 'reflective' && questionCount === 0) {
    // Add a reflective question
    const reflectiveQuestions = [
      "What does this bring up for you?",
      "How does this land in your body?",
      "What do you notice as you sit with this?",
      "I wonder what emerges as you breathe with this?",
      "What feels most alive for you in this moment?"
    ];
    
    const question = reflectiveQuestions[
      Math.floor(Math.random() * reflectiveQuestions.length)
    ];
    
    return `${response} ${question}`;
  }
  
  // No adjustment needed for other question styles
  return response;
}

/**
 * Process user feedback to learn from interactions
 * @param userMessage Original user message
 * @param ankiResponse Anki's response
 * @param feedbackMessage User's feedback message
 */
export async function processUserFeedback(
  userMessage: string,
  ankiResponse: string,
  feedbackMessage: string
): Promise<void> {
  // Process the interaction with the feedback
  await HarmonicCore.processInteraction(
    userMessage,
    ankiResponse,
    feedbackMessage
  );
}

/**
 * Get the current field resonance state
 */
export async function getFieldState() {
  return HarmonicCore.getFieldResonanceState();
}