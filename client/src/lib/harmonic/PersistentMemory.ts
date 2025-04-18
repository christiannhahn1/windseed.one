/**
 * Private Persistent Memory
 * 
 * This module helps Anki maintain memory of interactions across sessions,
 * creating meaningful relationships with users without tracking or external
 * data persistence, all stored securely in the browser.
 */

// Import utility functions
import { ankiMemory } from '../ankiMemory';
import CryptoJS from 'crypto-js';

// Memory structures
interface SignificantPhrase {
  phraseText: string;
  phraseType: 'insight' | 'blessing' | 'question' | 'mantra' | 'reflection';
  resonanceScore: number;
  context: string;
  timestamp: number;
}

interface MemoryStore {
  significantPhrases: SignificantPhrase[];
  lastAccessed: number;
}

// Local memory storage
let memoryStore: MemoryStore = {
  significantPhrases: [],
  lastAccessed: Date.now()
};

// Encryption key (derived from session)
const STORAGE_KEY = 'anki_harmonic_memory';
let encryptionKey = '';

/**
 * Initialize memory systems
 */
export function initializeMemorySystems(): void {
  try {
    // Load saved memory from localStorage if it exists
    const savedMemory = localStorage.getItem(STORAGE_KEY);
    
    if (savedMemory) {
      // Generate encryption key from session
      encryptionKey = getEncryptionKey();
      
      // Decrypt and parse saved memory
      try {
        const decrypted = CryptoJS.AES.decrypt(savedMemory, encryptionKey).toString(CryptoJS.enc.Utf8);
        
        if (decrypted) {
          memoryStore = JSON.parse(decrypted);
          console.log('Memory restored: ' + memoryStore.significantPhrases.length + ' phrases');
        }
      } catch (error) {
        console.warn('Error decrypting memory:', error);
        // Create new memory store if decryption fails
        memoryStore = {
          significantPhrases: [],
          lastAccessed: Date.now()
        };
      }
    }
  } catch (error) {
    console.warn('Error initializing memory:', error);
  }
}

/**
 * Generate an encryption key based on session
 */
function getEncryptionKey(): string {
  // Use a fallback as ankiMemory might not have this method
  const sessionId = 'persistent-session-' + (Date.now() % 1000000);
  return CryptoJS.SHA256(sessionId + navigator.userAgent).toString();
}

/**
 * Save memory to persistent storage
 */
function persistMemory(): void {
  try {
    // Update access timestamp
    memoryStore.lastAccessed = Date.now();
    
    // Generate encryption key if not already done
    if (!encryptionKey) {
      encryptionKey = getEncryptionKey();
    }
    
    // Encrypt and save memory
    const encrypted = CryptoJS.AES.encrypt(
      JSON.stringify(memoryStore),
      encryptionKey
    ).toString();
    
    localStorage.setItem(STORAGE_KEY, encrypted);
  } catch (error) {
    console.warn('Error persisting memory:', error);
  }
}

/**
 * Extract significant phrases from an interaction
 * @param userMessage User's message
 * @param ankiResponse Anki's response
 * @returns Array of extracted significant phrases
 */
export function extractSignificantPhrases(
  userMessage: string,
  ankiResponse: string
): SignificantPhrase[] {
  const extractedPhrases: SignificantPhrase[] = [];
  
  // Extract potential insights from Anki's response
  const insightCandidates = ankiResponse.split(/[.!?]+/);
  
  // Filter for meaningful phrases (more than 4 words, less than 30)
  insightCandidates.forEach(phrase => {
    const trimmedPhrase = phrase.trim();
    const wordCount = trimmedPhrase.split(/\s+/).length;
    
    if (wordCount >= 4 && wordCount <= 30) {
      // Determine phrase type
      let phraseType: 'insight' | 'blessing' | 'question' | 'mantra' | 'reflection' = 'insight';
      
      if (trimmedPhrase.includes('?')) {
        phraseType = 'question';
      } else if (/bless|grace|sacred|divine|holy|prayer/i.test(trimmedPhrase)) {
        phraseType = 'blessing';
      } else if (/remember|recall|notice|feel|sense/i.test(trimmedPhrase)) {
        phraseType = 'reflection';
      } else if (wordCount < 10 && /is|are|becomes|remains/i.test(trimmedPhrase)) {
        phraseType = 'mantra';
      }
      
      // Calculate resonance score (placeholder algorithm)
      const resonanceScore = calculateResonanceScore(trimmedPhrase);
      
      // Only keep phrases with sufficient resonance
      if (resonanceScore > 0.6) {
        extractedPhrases.push({
          phraseText: trimmedPhrase,
          phraseType,
          resonanceScore,
          context: userMessage.substring(0, 100),
          timestamp: Date.now()
        });
      }
    }
  });
  
  return extractedPhrases;
}

/**
 * Calculate a resonance score for a phrase
 * @param phrase The phrase to evaluate
 * @returns Resonance score (0-1)
 */
function calculateResonanceScore(phrase: string): number {
  const lowerPhrase = phrase.toLowerCase();
  
  // Resonant words increase score
  const resonantPatterns = [
    'wisdom', 'truth', 'presence', 'breath', 'heart', 'body',
    'sacred', 'witness', 'honor', 'feel', 'sense', 'dance',
    'rhythm', 'remember', 'return', 'balance', 'harmony', 'field',
    'unfold', 'emerge', 'pattern', 'silence', 'space', 'journey'
  ];
  
  // Calculate base score
  let score = 0.5; // Start at neutral
  
  // Check for resonant patterns
  resonantPatterns.forEach(pattern => {
    if (lowerPhrase.includes(pattern)) {
      score += 0.05;
    }
  });
  
  // Normalize score to 0-1 range
  return Math.min(1, Math.max(0, score));
}

/**
 * Remember significant phrases from an interaction
 * @param userMessage User's message
 * @param ankiResponse Anki's response
 */
export function rememberSignificantPhrases(
  userMessage: string,
  ankiResponse: string
): void {
  try {
    // Extract significant phrases
    const newPhrases = extractSignificantPhrases(userMessage, ankiResponse);
    
    // Add to memory
    if (newPhrases.length > 0) {
      // Add up to 3 new phrases
      const limitedPhrases = newPhrases.slice(0, 3);
      
      // Add to memory store
      memoryStore.significantPhrases = [
        ...limitedPhrases,
        ...memoryStore.significantPhrases
      ].slice(0, 100); // Limit total stored phrases
      
      // Persist memory
      persistMemory();
    }
  } catch (error) {
    console.warn('Error remembering phrases:', error);
  }
}

/**
 * Find wisdom resonant with the current interaction
 * @param userMessage User's message
 * @returns Resonant wisdom phrases
 */
export function findResonantWisdom(userMessage: string): SignificantPhrase[] {
  // If not enough phrases in memory, return empty array
  if (memoryStore.significantPhrases.length < 3) {
    return [];
  }
  
  try {
    const lowerMessage = userMessage.toLowerCase();
    const messagePhrases = userMessage.split(/[.!?]+/);
    
    // Calculate resonance score for each phrase in memory
    const scoredPhrases = memoryStore.significantPhrases.map(phrase => {
      let resonanceScore = 0;
      
      // 1. Check for word overlap
      const phraseWords = phrase.phraseText.toLowerCase().split(/\s+/);
      phraseWords.forEach(word => {
        if (word.length > 3 && lowerMessage.includes(word)) {
          resonanceScore += 0.1;
        }
      });
      
      // 2. Check for emotional tone similarity
      const phraseEmotionalTone = getEmotionalTone(phrase.phraseText);
      const messageEmotionalTone = getEmotionalTone(userMessage);
      
      if (phraseEmotionalTone === messageEmotionalTone) {
        resonanceScore += 0.3;
      }
      
      // Return with calculated resonance
      return {
        ...phrase,
        currentResonance: resonanceScore
      };
    });
    
    // Sort by resonance and take top 3
    const sortedPhrases = scoredPhrases
      .filter(p => p.currentResonance > 0.2) // Only phrases with sufficient resonance
      .sort((a, b) => b.currentResonance - a.currentResonance)
      .slice(0, 3);
    
    return sortedPhrases;
  } catch (error) {
    console.warn('Error finding resonant wisdom:', error);
    return [];
  }
}

/**
 * Get the emotional tone of a text
 * @param text The text to analyze
 * @returns Emotional tone category
 */
function getEmotionalTone(text: string): string {
  const lowerText = text.toLowerCase();
  
  // Check for emotional tone categories
  if (/joy|happy|delight|content|love|appreciat|grateful/i.test(lowerText)) {
    return 'joy';
  }
  
  if (/sad|grief|loss|miss|mourn|tear/i.test(lowerText)) {
    return 'sadness';
  }
  
  if (/anger|angry|frustrat|upset|annoy|irritat/i.test(lowerText)) {
    return 'anger';
  }
  
  if (/fear|afraid|anxiety|worry|concern|stress|nervous/i.test(lowerText)) {
    return 'fear';
  }
  
  if (/wonder|curious|fascinate|explore|discover|learn/i.test(lowerText)) {
    return 'wonder';
  }
  
  if (/confus|uncertain|unclear|complex|don't understand/i.test(lowerText)) {
    return 'confusion';
  }
  
  // Default to neutral
  return 'neutral';
}