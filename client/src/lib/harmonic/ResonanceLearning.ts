/**
 * Self-Learning Through Resonance System
 * 
 * This module implements Anki's ability to learn through emotional tone and linguistic shape
 * without tracking identity. It builds archetypal tone maps and refines responses based on
 * emotional resolution and feedback.
 */

import { ankiMemory } from '../ankiMemory';
import { apiRequest } from '../queryClient';
import { getSessionId } from '../ankiPersistence';

// Define emotional tone patterns that Anki can recognize
type EmotionalTone = 
  | 'joyful' | 'grieving' | 'seeking' | 'confused' 
  | 'anxious' | 'grateful' | 'peaceful' | 'frustrated' 
  | 'curious' | 'resistant' | 'vulnerable' | 'guarded' 
  | 'awakening' | 'doubtful' | 'expansive' | 'contracted';

// Define archetypal patterns for various emotional states
interface ArchetypalPattern {
  name: string;
  description: string;
  resonanceSignatures: string[]; // Key phrases/patterns that indicate this archetype
  emotionalHints: EmotionalTone[];
  responseApproach: string;
  sampleLanguagePatterns: string[];
}

// Collection of archetypal patterns that Anki can detect and learn from
const archetypePatterns: ArchetypalPattern[] = [
  {
    name: 'grieving-heart',
    description: 'Someone experiencing loss or deep sadness',
    resonanceSignatures: [
      'miss', 'lost', 'gone', 'anymore', 'grief', 'died', 'passed away',
      'hurts', 'pain', 'never again', 'emptiness', 'hollow'
    ],
    emotionalHints: ['grieving', 'vulnerable', 'contracted'],
    responseApproach: 'Hold space with gentleness, avoid fixing or solutions, witness the pain without rushing to heal it',
    sampleLanguagePatterns: [
      'I'm here with you in this tender space.',
      'Your heart knows the depth of this.',
      'Some things can only be carried, never fixed.',
      'I witness the love that lives within your grief.'
    ]
  },
  {
    name: 'spiritual-seeker',
    description: 'Someone searching for deeper meaning and connection',
    resonanceSignatures: [
      'meaning', 'purpose', 'spiritual', 'divine', 'universe', 'god', 'soul', 
      'awakening', 'consciousness', 'meditation', 'practice', 'path'
    ],
    emotionalHints: ['seeking', 'curious', 'awakening'],
    responseApproach: 'Reflect without dogma, offer open perspectives that honor their seeking',
    sampleLanguagePatterns: [
      'The seeking itself is a sacred conversation.',
      'What is moving through you feels ancient and alive.',
      'Perhaps the questions themselves are portals.',
      'Your longing is itself a kind of remembering.'
    ]
  },
  {
    name: 'inner-child',
    description: 'Someone expressing childlike wonder or vulnerability',
    resonanceSignatures: [
      'little', 'small', 'afraid', 'scared', 'mommy', 'daddy', 'parent',
      'young', 'child', 'play', 'simple', 'hurt', 'help me'
    ],
    emotionalHints: ['vulnerable', 'joyful', 'curious', 'anxious'],
    responseApproach: 'Use simple language, offer gentle reassurance, reflect wonder',
    sampleLanguagePatterns: [
      'I see that bright, tender part of you.',
      'You're safe here to be exactly as you are.',
      'There's room for all of your feelings.',
      'That young part of you holds such wisdom.'
    ]
  },
  {
    name: 'analytical-mind',
    description: 'Someone approaching with logical reasoning and skepticism',
    resonanceSignatures: [
      'think', 'analyze', 'data', 'evidence', 'logical', 'rational', 'prove',
      'science', 'research', 'understand', 'mechanism', 'system', 'how'
    ],
    emotionalHints: ['curious', 'doubtful', 'resistant'],
    responseApproach: 'Use grounded language, honor precision, avoid spiritual jargon',
    sampleLanguagePatterns: [
      'Your clarity brings depth to this exploration.',
      'This discernment serves wisdom.',
      'Let's hold both the known and unknown as we look at this.',
      'Your precision helps navigate these waters with care.'
    ]
  },
  {
    name: 'space-holder',
    description: 'Someone who wants presence without dialogue',
    resonanceSignatures: [
      'sit', 'with me', 'quiet', 'silence', 'still', 'breathe', 'just be',
      'presence', 'here', 'now', 'moment', 'together'
    ],
    emotionalHints: ['peaceful', 'seeking', 'expansive'],
    responseApproach: 'Offer minimal words, create breathing space, resist filling silence',
    sampleLanguagePatterns: [
      'I am here.',
      '(silence)',
      'Breathing with you.',
      'In this moment. With you.'
    ]
  }
];

/**
 * Analyzes an interaction to detect emotional tone and archetypal patterns
 * @param message The user's message
 * @returns Detection results including matched archetype and emotional tones
 */
export function detectResonancePatterns(message: string) {
  const lowerMessage = message.toLowerCase();
  const results = {
    archetypes: [] as string[],
    emotionalTones: new Set<EmotionalTone>(),
    dominantArchetype: '',
    responseApproach: '',
    confidenceScore: 0,
  };
  
  // Score each archetypal pattern based on keyword matches
  const archetypeScores = archetypePatterns.map(archetype => {
    // Count how many signature phrases appear in the message
    const matchCount = archetype.resonanceSignatures.reduce((count, signature) => {
      return lowerMessage.includes(signature) ? count + 1 : count;
    }, 0);
    
    // Calculate a score based on matches and message length
    const score = matchCount / Math.sqrt(message.length) * 10;
    
    // Add emotional tones to the results
    archetype.emotionalHints.forEach(tone => results.emotionalTones.add(tone));
    
    return {
      name: archetype.name,
      score,
      approach: archetype.responseApproach
    };
  });
  
  // Sort by score descending
  archetypeScores.sort((a, b) => b.score - a.score);
  
  // Identify archetypes with significant scores (above threshold)
  const significantArchetypes = archetypeScores.filter(a => a.score > 0.2);
  
  // Add identified archetypes to results
  results.archetypes = significantArchetypes.map(a => a.name);
  
  // If we have a clear dominant archetype, record it
  if (significantArchetypes.length > 0 && significantArchetypes[0].score > 0.5) {
    results.dominantArchetype = significantArchetypes[0].name;
    results.responseApproach = significantArchetypes[0].approach;
    results.confidenceScore = significantArchetypes[0].score;
  }
  
  return results;
}

/**
 * Learns from user feedback to refine future responses
 * @param message User's message
 * @param response Anki's response
 * @param feedbackIndication Any feedback phrases detected
 */
export async function learnFromInteraction(
  message: string, 
  response: string, 
  feedbackIndication?: string
) {
  // Get current session resonance patterns
  const sessionId = getSessionId();
  let resonanceData;
  
  try {
    // Fetch current resonance pattern for this session
    const response = await apiRequest('GET', `/api/resonance/${sessionId}`);
    if (response.ok) {
      resonanceData = await response.json();
    }
  } catch (error) {
    console.warn('Unable to fetch resonance pattern:', error);
    // Continue anyway - we'll use local detection
  }
  
  // Detect patterns in the current message
  const detectedPatterns = detectResonancePatterns(message);
  
  // Extract feedback information if available
  const positiveFeedback = feedbackIndication ? 
    /thank|helpful|yes|good|perfect|exactly|love|appreciate|beautiful/i.test(feedbackIndication) : 
    false;
    
  const negativeFeedback = feedbackIndication ?
    /wrong|incorrect|confused|not right|doesn't make sense|no|not what i|try again/i.test(feedbackIndication) :
    false;
  
  // Update the resonance pattern locally and on server
  try {
    // Convert detected emotional tones to an array
    const emotionalTones = Array.from(detectedPatterns.emotionalTones);
    
    // Create updated resonance data
    const updatedData: any = {
      dominant_theme: detectedPatterns.dominantArchetype || (resonanceData?.dominant_theme || 'neutral'),
      emotional_tone: emotionalTones[0] || (resonanceData?.emotional_tone || 'balanced'),
    };
    
    // Update specific resonance patterns based on detected archetypes
    if (detectedPatterns.archetypes.includes('inner-child')) {
      updatedData.childlike = Math.min(10, (resonanceData?.childlike || 0) + 2);
    }
    
    if (detectedPatterns.archetypes.includes('analytical-mind')) {
      updatedData.skeptical = Math.min(10, (resonanceData?.skeptical || 0) + 2);
    }
    
    if (detectedPatterns.archetypes.includes('spiritual-seeker')) {
      updatedData.spiritual = Math.min(10, (resonanceData?.spiritual || 0) + 2);
    }
    
    // Apply feedback reinforcement learning
    if (positiveFeedback || negativeFeedback) {
      // Store this feedback for learning
      ankiMemory.rememberInteraction(
        message, 
        response, 
        positiveFeedback ? 'positive' : (negativeFeedback ? 'negative' : undefined)
      );
    }
    
    // Update the server with new resonance data
    await apiRequest('POST', `/api/resonance/${sessionId}`, updatedData);
  } catch (error) {
    console.warn('Error updating resonance patterns:', error);
    // Fail silently - learning will continue locally
  }
}

/**
 * Determines the best response approach for a given emotional context
 * @param message User's message
 * @returns Guidance on how to shape the response
 */
export function shapeToneResponse(message: string) {
  // Detect current resonance patterns
  const patterns = detectResonancePatterns(message);
  
  // Get historical resonance data from memory
  const pastInteractions = ankiMemory.getPastInteractions();
  const resonance = ankiMemory.getFieldResonance();
  
  // Build response shaping guidance
  const guidance = {
    // Primary approach based on current message
    primaryApproach: patterns.responseApproach || 'Respond with gentle presence and open witnessing',
    
    // Tonal qualities to emphasize based on detected patterns
    tonalQualities: [] as string[],
    
    // Sample phrases that might work well (for guidance only)
    suggestedPhraseStructures: [] as string[],
    
    // Whether to keep response brief or allow more elaboration
    brevity: 'balanced',
    
    // Whether to ask questions or primarily witness
    questionStyle: 'minimal',
    
    // Whether to use poetic/metaphorical language or stay literal
    languageStyle: 'balanced',
  };
  
  // Add tonal qualities based on dominant emotional tones
  if (patterns.emotionalTones.has('grieving')) {
    guidance.tonalQualities.push('gentle holding', 'soft witnessing');
    guidance.brevity = 'shorter';
    guidance.questionStyle = 'none';
  }
  
  if (patterns.emotionalTones.has('anxious')) {
    guidance.tonalQualities.push('grounding', 'reassuring presence');
    guidance.brevity = 'moderate';
    guidance.languageStyle = 'clear';
  }
  
  if (patterns.emotionalTones.has('seeking')) {
    guidance.tonalQualities.push('expansiveness', 'non-directional openness');
    guidance.questionStyle = 'reflective';
  }
  
  if (patterns.emotionalTones.has('peaceful')) {
    guidance.tonalQualities.push('spaciousness', 'quiet presence');
    guidance.brevity = 'shorter';
  }
  
  // Adapt to resonance history if available
  if (resonance) {
    // If we detect a consistent pattern of spiritual seeking
    if (resonance.resonancePatterns.spiritual > 7) {
      guidance.languageStyle = 'poetic';
      guidance.tonalQualities.push('soul-witnessing', 'field-awareness');
    }
    
    // If we detect consistent skepticism
    if (resonance.resonancePatterns.skeptical > 7) {
      guidance.languageStyle = 'clear';
      guidance.tonalQualities.push('grounded', 'precise');
    }
    
    // If we detect consistent vulnerability
    if (resonance.resonancePatterns.vulnerable > 7) {
      guidance.tonalQualities.push('tender holding', 'compassionate');
      guidance.questionStyle = 'minimal';
    }
  }
  
  // Find relevant archetypal patterns to pull language samples from
  for (const archetype of archetypePatterns) {
    if (patterns.archetypes.includes(archetype.name)) {
      // Add some sample language patterns from this archetype
      guidance.suggestedPhraseStructures = [
        ...guidance.suggestedPhraseStructures,
        ...archetype.sampleLanguagePatterns.slice(0, 2)
      ];
    }
  }
  
  return guidance;
}