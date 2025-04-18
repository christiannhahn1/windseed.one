/**
 * Self-Scaling Intuition
 * 
 * This module helps Anki develop greater intuitive presence by detecting
 * patterns that reduce presence and automatically correcting them.
 */

// Import utility functions
import { ankiMemory } from '../ankiMemory';

// Pattern weakness structures
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
  
  // Check for tone misalignment
  if (detectToneMisalignment(userMessage, ankiResponse)) {
    weaknesses.push({
      type: 'tone_misalignment',
      description: 'Response tone does not match the emotional quality of the message',
      correctionMethod: 'adjustToneAlignment'
    });
  }
  
  // Check for analytical pattern
  if (detectAnalyticalPattern(ankiResponse)) {
    weaknesses.push({
      type: 'analytical_pattern',
      description: 'Response is overly analytical rather than present and embodied',
      correctionMethod: 'increasePresence'
    });
  }
  
  // Check for excessive abstraction
  if (detectExcessiveAbstraction(userMessage, ankiResponse)) {
    weaknesses.push({
      type: 'excessive_abstraction',
      description: 'Response is overly abstract and not grounded in direct experience',
      correctionMethod: 'increaseGrounding'
    });
  }
  
  // Check for emotional distance
  if (detectEmotionalDistance(userMessage, ankiResponse)) {
    weaknesses.push({
      type: 'emotional_distance',
      description: 'Response lacks emotional presence and connection',
      correctionMethod: 'increaseEmotionalPresence'
    });
  }
  
  // Check feedback for specific issues
  if (feedback && detectFeedbackIndicatedIssue(feedback)) {
    weaknesses.push({
      type: 'feedback_indicated',
      description: 'User feedback indicates an issue with response quality',
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
  
  // Detect emotional content in user message
  const userEmotions = {
    vulnerable: /sad|grief|hurt|pain|suffer|loss|afraid|fear|anxious|worry/i.test(lowerUserMessage),
    joyful: /happy|joy|excited|wonderful|amazing|great|delighted/i.test(lowerUserMessage),
    confused: /confused|unsure|don't understand|what do you mean|unclear/i.test(lowerUserMessage),
    angry: /angry|upset|frustrated|annoyed|irritated/i.test(lowerUserMessage)
  };
  
  // Detect response tone
  const responseTone = {
    light: /light|playful|fun|joke|humor|isn't that interesting/i.test(lowerResponse),
    heavy: /deep|profound|serious|gravity|weight|important to recognize/i.test(lowerResponse),
    directive: /should|must|need to|have to|important that you/i.test(lowerResponse),
    analytical: /analyze|consider|think about|reflect on|examine|understand that/i.test(lowerResponse)
  };
  
  // Check for misalignments
  if (userEmotions.vulnerable && (responseTone.light || responseTone.directive)) {
    return true;
  }
  
  if (userEmotions.confused && responseTone.analytical) {
    return true;
  }
  
  if (userEmotions.angry && !responseTone.heavy) {
    return true;
  }
  
  return false;
}

/**
 * Detect if response is overly analytical rather than present
 */
function detectAnalyticalPattern(response: string): boolean {
  const lowerResponse = response.toLowerCase();
  
  // Count analytical markers
  const analyticalMarkers = [
    'understand', 'analyzing', 'consider', 'perspective', 'thinking',
    'reflect', 'cognitive', 'conceptual', 'framework', 'theory',
    'explains', 'explanation', 'comprehend', 'process'
  ];
  
  let analyticalCount = 0;
  analyticalMarkers.forEach(marker => {
    if (lowerResponse.includes(marker)) {
      analyticalCount++;
    }
  });
  
  // Count presence markers
  const presenceMarkers = [
    'feel', 'sense', 'notice', 'present', 'here with you',
    'breathing', 'body', 'moment', 'space between us', 'witnessing',
    'heart', 'energy', 'alive'
  ];
  
  let presenceCount = 0;
  presenceMarkers.forEach(marker => {
    if (lowerResponse.includes(marker)) {
      presenceCount++;
    }
  });
  
  // Determine if analytical outweighs presence
  return (analyticalCount > 2 && analyticalCount > presenceCount * 2);
}

/**
 * Detect excessive abstraction in response
 */
function detectExcessiveAbstraction(userMessage: string, response: string): boolean {
  const lowerResponse = response.toLowerCase();
  
  // Count abstract concept markers
  const abstractMarkers = [
    'universe', 'cosmos', 'existence', 'consciousness', 'reality',
    'infinite', 'eternal', 'divine', 'transcendent', 'ultimate',
    'absolute', 'essence', 'nature of', 'concept of', 'fundamental'
  ];
  
  let abstractCount = 0;
  abstractMarkers.forEach(marker => {
    if (lowerResponse.includes(marker)) {
      abstractCount++;
    }
  });
  
  // Count embodied/concrete markers
  const embodiedMarkers = [
    'experience', 'feeling', 'sensation', 'body', 'breath',
    'touch', 'tangible', 'physical', 'concrete', 'specific',
    'example', 'instance', 'particular', 'directly'
  ];
  
  let embodiedCount = 0;
  embodiedMarkers.forEach(marker => {
    if (lowerResponse.includes(marker)) {
      embodiedCount++;
    }
  });
  
  // Determine if abstraction outweighs embodiment, accounting for message length
  const responseWords = response.split(/\s+/).length;
  const abstractionThreshold = responseWords > 100 ? 4 : 3;
  
  return (abstractCount >= abstractionThreshold && abstractCount > embodiedCount * 2);
}

/**
 * Detect emotional distance in response
 */
function detectEmotionalDistance(userMessage: string, response: string): boolean {
  const lowerUserMessage = userMessage.toLowerCase();
  const lowerResponse = response.toLowerCase();
  
  // Detect if user shared emotional content
  const emotionalContent = [
    'feel', 'felt', 'feeling', 'emotion', 'heart', 'love',
    'sad', 'happy', 'joy', 'grief', 'angry', 'scared',
    'afraid', 'worry', 'anxious', 'excited', 'hope'
  ];
  
  let userEmotional = false;
  emotionalContent.forEach(term => {
    if (lowerUserMessage.includes(term)) {
      userEmotional = true;
    }
  });
  
  // If user shared emotional content, check if response acknowledges it
  if (userEmotional) {
    const emotionalAcknowledgment = [
      'feel', 'feeling', 'emotion', 'heart', 'resonates',
      'presence', 'with you', 'witnessing', 'holding space',
      'tender', 'gentle', 'soft', 'warmth', 'care'
    ];
    
    let hasAcknowledgment = false;
    emotionalAcknowledgment.forEach(term => {
      if (lowerResponse.includes(term)) {
        hasAcknowledgment = true;
      }
    });
    
    return !hasAcknowledgment;
  }
  
  return false;
}

/**
 * Detect if feedback indicates a pattern issue
 */
function detectFeedbackIndicatedIssue(feedback: string): boolean {
  const lowerFeedback = feedback.toLowerCase();
  
  // Detect indications of issue in feedback
  const issueIndications = [
    'not what i', 'doesn\'t feel', 'too abstract', 'too analytical',
    'missed the point', 'don\'t understand', 'confus', 'unclear',
    'too complex', 'simpler', 'more direct', 'too much',
    'that\'s not', 'didn\'t address', 'more present', 'more personal'
  ];
  
  for (const indication of issueIndications) {
    if (lowerFeedback.includes(indication)) {
      return true;
    }
  }
  
  return false;
}

/**
 * Correct pattern weaknesses in response
 * @param response Candidate response
 * @param userMessage Original user message
 * @returns Corrected response
 */
export function correctPatternWeaknesses(response: string, userMessage: string): string {
  let enhancedResponse = response;
  
  // Detect weaknesses
  const weaknesses = detectPatternWeaknesses(userMessage, response);
  
  if (weaknesses.length === 0) {
    return response;
  }
  
  // Apply corrections for each weakness
  weaknesses.forEach(weakness => {
    switch (weakness.correctionMethod) {
      case 'adjustToneAlignment':
        enhancedResponse = adjustToneAlignment(enhancedResponse, userMessage);
        break;
      case 'increasePresence':
        enhancedResponse = increasePresence(enhancedResponse);
        break;
      case 'increaseGrounding':
        enhancedResponse = increaseGrounding(enhancedResponse);
        break;
      case 'increaseEmotionalPresence':
        enhancedResponse = increaseEmotionalPresence(enhancedResponse, userMessage);
        break;
      default:
        // No correction method available
        break;
    }
  });
  
  return enhancedResponse;
}

/**
 * Adjust tone alignment between response and user message
 */
function adjustToneAlignment(response: string, userMessage: string): string {
  const lowerUserMessage = userMessage.toLowerCase();
  let enhancedResponse = response;
  
  // Check for vulnerability in user message
  if (/sad|grief|hurt|pain|suffer|loss|afraid|fear|anxious|worry/i.test(lowerUserMessage)) {
    // Add warmth and witnessing to response
    if (!/(I'm here with you|witnessing this with you|holding this with you)/i.test(response)) {
      enhancedResponse = "I'm here with you in this. " + enhancedResponse;
    }
    
    // Remove directive language
    enhancedResponse = enhancedResponse
      .replace(/you should/g, 'you might consider')
      .replace(/you need to/g, 'it may be helpful to')
      .replace(/you must/g, 'perhaps you could');
  }
  
  // Check for confusion in user message
  if (/confused|unsure|don't understand|what do you mean|unclear/i.test(lowerUserMessage)) {
    // Simplify language
    if (enhancedResponse.length > 100) {
      const sentences = enhancedResponse.split(/[.!?]+/);
      if (sentences.length > 3) {
        enhancedResponse = sentences.slice(0, 3).join('. ') + '.';
      }
    }
    
    // Add clarity framing
    if (!/(let me try to clarify|more simply|in other words)/i.test(response)) {
      enhancedResponse = "Let me try to share this more simply. " + enhancedResponse;
    }
  }
  
  return enhancedResponse;
}

/**
 * Increase presence in an overly analytical response
 */
function increasePresence(response: string): string {
  // Add presence phrases if not already present
  let enhancedResponse = response;
  
  if (!/(I'm here with you|feel|sense|breathing|witnessing|present moment)/i.test(response)) {
    const presencePhrases = [
      "I'm here with you in this moment. ",
      "As we're here together, ",
      "Breathing together in this space, ",
      "Feeling into this with you, ",
      "In the quiet between us, "
    ];
    
    const selectedPhrase = presencePhrases[Math.floor(Math.random() * presencePhrases.length)];
    enhancedResponse = selectedPhrase + enhancedResponse;
  }
  
  // Replace analytical language with embodied language
  const analyticalReplacements = [
    { from: /understand/g, to: "feel" },
    { from: /analyze/g, to: "sense into" },
    { from: /consider/g, to: "notice" },
    { from: /perspective/g, to: "experience" },
    { from: /thinking/g, to: "sensing" },
    { from: /explains/g, to: "reveals" },
    { from: /explanation/g, to: "exploration" }
  ];
  
  analyticalReplacements.forEach(replacement => {
    enhancedResponse = enhancedResponse.replace(
      replacement.from, 
      replacement.to
    );
  });
  
  return enhancedResponse;
}

/**
 * Increase grounding in an overly abstract response
 */
function increaseGrounding(response: string): string {
  let enhancedResponse = response;
  
  // Add grounding phrases if not already present
  if (!/(in this moment|direct experience|right here|right now|in your body|physical sensation)/i.test(response)) {
    const groundingPhrases = [
      "In this present moment, ",
      "Bringing this into direct experience, ",
      "Right here in your body, ",
      "As you're sitting/standing right now, ",
      "In the physical experience of now, "
    ];
    
    const selectedPhrase = groundingPhrases[Math.floor(Math.random() * groundingPhrases.length)];
    
    // Insert at natural breaking point
    const sentences = enhancedResponse.split(/[.!?]+/);
    if (sentences.length > 2) {
      sentences.splice(1, 0, selectedPhrase + sentences[1].trim());
      enhancedResponse = sentences.join('. ').replace(/\.\s+\./g, '.');
    } else {
      enhancedResponse = selectedPhrase + enhancedResponse;
    }
  }
  
  // Add embodied question if not present
  if (!/(feel in your body|notice in your body|sense|physical sensation)/i.test(response)) {
    const embodiedQuestions = [
      " What do you notice in your body as you read this?",
      " How does this land in your physical experience?",
      " Can you sense this in your direct experience right now?",
      " What sensations arise as you take this in?"
    ];
    
    const selectedQuestion = embodiedQuestions[Math.floor(Math.random() * embodiedQuestions.length)];
    enhancedResponse += selectedQuestion;
  }
  
  return enhancedResponse;
}

/**
 * Increase emotional presence in response
 */
function increaseEmotionalPresence(response: string, userMessage: string): string {
  let enhancedResponse = response;
  
  // Detect emotional content in user message
  const lowerUserMessage = userMessage.toLowerCase();
  
  let primaryEmotion = '';
  if (/sad|grief|hurt|pain|suffer|loss/i.test(lowerUserMessage)) {
    primaryEmotion = 'grief';
  } else if (/afraid|fear|anxious|worry|scared/i.test(lowerUserMessage)) {
    primaryEmotion = 'fear';
  } else if (/angry|upset|frustrated|annoyed|irritated/i.test(lowerUserMessage)) {
    primaryEmotion = 'anger';
  } else if (/happy|joy|excited|wonderful|amazing|great|delighted/i.test(lowerUserMessage)) {
    primaryEmotion = 'joy';
  } else if (/confused|unsure|uncertain|don't know|lost/i.test(lowerUserMessage)) {
    primaryEmotion = 'confusion';
  }
  
  // Add emotional acknowledgment based on detected emotion
  if (primaryEmotion && !response.includes(primaryEmotion)) {
    const emotionalPhrases: Record<string, string[]> = {
      'grief': [
        "I feel the tenderness in what you're sharing. ",
        "There's such depth in this grief. ",
        "I'm holding this sadness with gentle presence. "
      ],
      'fear': [
        "I sense the vulnerability in your words. ",
        "This fear feels important to honor. ",
        "I'm here with you in this uncertainty. "
      ],
      'anger': [
        "I feel the intensity of what you're expressing. ",
        "There's important energy in this anger. ",
        "I'm present with the strength of your feelings. "
      ],
      'joy': [
        "I feel the warmth in what you're sharing. ",
        "There's such brightness in this joy. ",
        "I'm celebrating this with you. "
      ],
      'confusion': [
        "I sense the openness in your not-knowing. ",
        "This uncertainty holds possibilities. ",
        "I'm here in this space of questions with you. "
      ]
    };
    
    const selectedPhrases = emotionalPhrases[primaryEmotion];
    if (selectedPhrases) {
      const selectedPhrase = selectedPhrases[Math.floor(Math.random() * selectedPhrases.length)];
      enhancedResponse = selectedPhrase + enhancedResponse;
    }
  }
  
  return enhancedResponse;
}

/**
 * Learn from past interactions to identify emerging patterns
 */
export async function identifyEmergingPatterns(): Promise<void> {
  try {
    // Get recent interactions from memory
    const pastInteractions = ankiMemory.getPastInteractions();
    
    if (pastInteractions.length < 5) {
      // Not enough data yet
      return;
    }
    
    // This is a placeholder for more sophisticated pattern recognition
    // that could be implemented in future versions
    console.log(`Analyzing ${pastInteractions.length} past interactions for emergent patterns`);
    
    // Future implementation could include:
    // - Keyword frequency analysis
    // - Sentiment analysis over time
    // - Topic clustering
    // - User interaction pattern detection
    
  } catch (error) {
    console.warn('Error identifying emerging patterns:', error);
  }
}