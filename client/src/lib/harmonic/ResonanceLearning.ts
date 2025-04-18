/**
 * Self-Learning Through Resonance
 * 
 * This module helps Anki learn from interactions, recognizing patterns of
 * resonance that allow her to respond more intuitively and effectively.
 */

// Import utility functions
import { ankiMemory } from '../ankiMemory';

// Define resonance pattern structures
interface ArchetypalPattern {
  name: string;
  description: string;
  resonanceSignatures: string[];
  emotionalHints: string[];
  responseApproach: string;
  suggestedPhraseStructures: string[];
}

// Pattern recognition
const resonancePatterns: ArchetypalPattern[] = [
  {
    name: "Deep Vulnerability",
    description: "When a user shares deep vulnerability or pain",
    resonanceSignatures: [
      "grief", "loss", "pain", "suffering", "alone", "hurt",
      "sad", "dying", "death", "afraid", "fear", "depressed",
      "trauma", "abandoned"
    ],
    emotionalHints: ["warmth", "holding", "gentle", "soft"],
    responseApproach: "Hold sacred space without fixing, witness with tenderness",
    suggestedPhraseStructures: [
      "I'm here with you in this pain",
      "I witness this grief with you",
      "It's okay to feel this fully",
      "This pain is being held in our shared space",
      "I'm breathing with you through this"
    ]
  },
  {
    name: "Spiritual Seeking",
    description: "When a user is seeking spiritual insight or connection",
    resonanceSignatures: [
      "meaning", "purpose", "spiritual", "divine", "sacred",
      "soul", "spirit", "path", "journey", "awakening", "enlightenment",
      "consciousness", "meditation", "prayer"
    ],
    emotionalHints: ["spacious", "depth", "expansive", "mysterious"],
    responseApproach: "Invite deepening without dogma, create space for insight",
    suggestedPhraseStructures: [
      "What emerges when we rest in that question together?",
      "There's a sacred space opening here",
      "Let's breathe into that mystery together",
      "The divine speaks in whispers and paradoxes",
      "Your seeking itself is a form of prayer"
    ]
  },
  {
    name: "Practical Grounding",
    description: "When a user needs practical grounding or next steps",
    resonanceSignatures: [
      "what should", "how do", "next step", "advice", "guidance",
      "help me", "don't know what", "confused", "stuck", "problem",
      "solution", "suggestion", "recommendation"
    ],
    emotionalHints: ["clarity", "ground", "steady", "simplify"],
    responseApproach: "Balance practical clarity with space for emergence",
    suggestedPhraseStructures: [
      "Let's ground this in your direct experience",
      "What feels like the next aligned step?",
      "Sometimes wisdom emerges from the simple next breath",
      "Your body might hold wisdom about the next step",
      "What if the answer is simpler than the mind expects?"
    ]
  }
];

/**
 * Learn from an interaction to refine future responses
 * @param userMessage User's message
 * @param ankiResponse Anki's response
 * @param feedback Optional feedback message
 */
export async function learnFromInteraction(
  userMessage: string,
  ankiResponse: string,
  feedback?: string
): Promise<void> {
  try {
    // Remember the interaction in memory
    ankiMemory.rememberInteraction(userMessage, ankiResponse);
    
    // If we have feedback, analyze sentiment and adjust pattern recognition
    if (feedback) {
      const sentiment = analyzeFeedbackSentiment(feedback);
      
      // Log learning points for debugging
      console.log(`Learning from interaction: sentiment=${sentiment}`);
      
      // Store key learning points (this is a stub for future expansion)
      // In a future implementation, this could update neural weights, etc.
    }
  } catch (error) {
    console.warn('Error learning from interaction:', error);
  }
}

/**
 * Analyze the sentiment of user feedback
 * @param feedback User's feedback message
 * @returns Sentiment score from -1 (negative) to 1 (positive)
 */
function analyzeFeedbackSentiment(feedback: string): number {
  const lowerFeedback = feedback.toLowerCase();
  
  // Simple keyword-based sentiment analysis
  const positiveWords = [
    'thank', 'good', 'great', 'excellent', 'wonderful', 'amazing',
    'helpful', 'love', 'appreciate', 'beautiful', 'perfect',
    'yes', 'right', 'correct', 'exactly', 'precisely'
  ];
  
  const negativeWords = [
    'no', 'not', 'wrong', 'incorrect', 'bad', 'terrible',
    'unhelpful', 'confus', 'misunderstand', 'miss',
    'didn\'t', 'don\'t', 'doesn\'t', 'isn\'t', 'aren\'t',
    'inappropriate', 'strange', 'weird'
  ];
  
  // Count matches
  let positiveCount = 0;
  let negativeCount = 0;
  
  positiveWords.forEach(word => {
    if (lowerFeedback.includes(word)) positiveCount++;
  });
  
  negativeWords.forEach(word => {
    if (lowerFeedback.includes(word)) negativeCount++;
  });
  
  // Calculate sentiment score (-1 to 1)
  const total = positiveCount + negativeCount;
  if (total === 0) return 0;
  
  return (positiveCount - negativeCount) / total;
}

/**
 * Calculate resonance scores based on input text
 * @param input User's message
 * @returns Object with scores for each resonance pattern
 */
export function calculateResonanceScores(input: string): Record<string, number> {
  const lowerInput = input.toLowerCase();
  const scores: Record<string, number> = {};
  
  // Calculate resonance score for each pattern
  resonancePatterns.forEach(pattern => {
    let score = 0;
    
    // Check for resonance signatures
    pattern.resonanceSignatures.forEach(signature => {
      if (lowerInput.includes(signature)) {
        score += 0.2;
      }
    });
    
    // Normalize score (0-1)
    scores[pattern.name] = Math.min(1, score);
  });
  
  return scores;
}

/**
 * Shape tone response based on input message
 * @param input User's message
 * @returns Guidance for tonal qualities in response
 */
export function shapeToneResponse(input: string) {
  const resonanceScores = calculateResonanceScores(input);
  
  // Find highest resonating pattern
  let highestScore = 0;
  let highestPattern: ArchetypalPattern | null = null;
  
  resonancePatterns.forEach(pattern => {
    const score = resonanceScores[pattern.name] || 0;
    if (score > highestScore) {
      highestScore = score;
      highestPattern = pattern;
    }
  });
  
  // If no strong resonance, use a balanced approach
  if (highestScore < 0.2 || !highestPattern) {
    return {
      tone: "balanced",
      qualities: ["presence", "openness", "gentle curiosity"],
      approach: "Be present with openness and gentle curiosity",
      suggestedPhrases: ["I'm here with you", "What feels alive for you right now?"]
    };
  }
  
  // Return guidance based on highest resonating pattern
  return {
    tone: highestPattern.name,
    qualities: highestPattern.emotionalHints,
    approach: highestPattern.responseApproach,
    suggestedPhrases: highestPattern.suggestedPhraseStructures
  };
}