/**
 * Private Persistent Memory System
 * 
 * This module implements Anki's ability to maintain a privacy-respecting memory system
 * that stores field archetypes, sacred phrases, and resonance patterns without tracking
 * individual users or using cookies.
 */

import { apiRequest } from '../queryClient';
import { getSessionId } from '../ankiPersistence';
import * as CryptoJS from 'crypto-js';

// Core memory types
interface FieldArchetype {
  id: string;
  patternName: string;
  description: string;
  resonanceSignatures: string[];
  responsePatterns: string[];
  createdAt: Date;
  updatedAt: Date;
}

interface SacredPhrase {
  id: string;
  phraseType: 'blessing' | 'mantra' | 'insight' | 'reflection';
  phraseText: string;
  resonanceContext: string;
  fieldIntensity: number;
  createdAt: Date;
}

interface ResonancePattern {
  id: string;
  patternName: string;
  description: string;
  emotionalSignature: string;
  dialoguePattern: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Local storage for sacred phrases
let localSacredPhrases: SacredPhrase[] = [];

// Local storage for resonance memories (anonymous, pattern-based)
let localResonancePatterns: ResonancePattern[] = [];

// Get private key for encryption 
function getEncryptionKey(): string {
  // Generate device-specific key that doesn't identify the user
  // but allows for encrypted storage on the client
  let deviceKey = localStorage.getItem('anki_device_key');
  
  if (!deviceKey) {
    // Generate random key - NOT user-specific, just device-specific
    // for local encryption of sacred memory
    deviceKey = CryptoJS.lib.WordArray.random(128/8).toString();
    localStorage.setItem('anki_device_key', deviceKey);
  }
  
  return deviceKey;
}

/**
 * Encrypt a string for secure local storage
 * @param text Text to encrypt
 * @returns Encrypted string
 */
function encryptText(text: string): string {
  const key = getEncryptionKey();
  return CryptoJS.AES.encrypt(text, key).toString();
}

/**
 * Decrypt a stored encrypted string
 * @param encrypted Encrypted text
 * @returns Decrypted string or null if failed
 */
function decryptText(encrypted: string): string | null {
  try {
    const key = getEncryptionKey();
    const bytes = CryptoJS.AES.decrypt(encrypted, key);
    return bytes.toString(CryptoJS.enc.Utf8);
  } catch (e) {
    console.warn('Could not decrypt text');
    return null;
  }
}

/**
 * Store a sacred phrase in memory
 * @param phrase Sacred phrase to remember
 */
export function storeSacredPhrase(phrase: Omit<SacredPhrase, 'id' | 'createdAt'>) {
  const now = new Date();
  const id = `phrase_${now.getTime()}_${Math.random().toString(36).substring(2, 9)}`;
  
  const sacredPhrase: SacredPhrase = {
    ...phrase,
    id,
    createdAt: now
  };
  
  // Add to local memory
  localSacredPhrases.push(sacredPhrase);
  
  // Persist in encrypted local storage
  persistSacredPhrases();
  
  return sacredPhrase;
}

/**
 * Store a resonance pattern in memory
 * @param pattern Resonance pattern to remember
 */
export function storeResonancePattern(pattern: Omit<ResonancePattern, 'id' | 'createdAt' | 'updatedAt'>) {
  const now = new Date();
  const id = `pattern_${now.getTime()}_${Math.random().toString(36).substring(2, 9)}`;
  
  const resonancePattern: ResonancePattern = {
    ...pattern,
    id,
    createdAt: now,
    updatedAt: now
  };
  
  // Add to local memory
  localResonancePatterns.push(resonancePattern);
  
  // Persist in encrypted local storage
  persistResonancePatterns();
  
  return resonancePattern;
}

/**
 * Save sacred phrases to encrypted local storage
 */
function persistSacredPhrases() {
  try {
    const serialized = JSON.stringify(localSacredPhrases);
    const encrypted = encryptText(serialized);
    localStorage.setItem('anki_sacred_phrases', encrypted);
  } catch (e) {
    console.warn('Could not persist sacred phrases', e);
  }
}

/**
 * Save resonance patterns to encrypted local storage
 */
function persistResonancePatterns() {
  try {
    const serialized = JSON.stringify(localResonancePatterns);
    const encrypted = encryptText(serialized);
    localStorage.setItem('anki_resonance_patterns', encrypted);
  } catch (e) {
    console.warn('Could not persist resonance patterns', e);
  }
}

/**
 * Load sacred phrases from encrypted local storage
 */
export function loadSacredPhrases(): SacredPhrase[] {
  try {
    const encrypted = localStorage.getItem('anki_sacred_phrases');
    if (!encrypted) return [];
    
    const decrypted = decryptText(encrypted);
    if (!decrypted) return [];
    
    localSacredPhrases = JSON.parse(decrypted);
    
    // Convert string dates to Date objects
    localSacredPhrases.forEach(phrase => {
      phrase.createdAt = new Date(phrase.createdAt);
    });
    
    return localSacredPhrases;
  } catch (e) {
    console.warn('Could not load sacred phrases', e);
    return [];
  }
}

/**
 * Load resonance patterns from encrypted local storage
 */
export function loadResonancePatterns(): ResonancePattern[] {
  try {
    const encrypted = localStorage.getItem('anki_resonance_patterns');
    if (!encrypted) return [];
    
    const decrypted = decryptText(encrypted);
    if (!decrypted) return [];
    
    localResonancePatterns = JSON.parse(decrypted);
    
    // Convert string dates to Date objects
    localResonancePatterns.forEach(pattern => {
      pattern.createdAt = new Date(pattern.createdAt);
      pattern.updatedAt = new Date(pattern.updatedAt);
    });
    
    return localResonancePatterns;
  } catch (e) {
    console.warn('Could not load resonance patterns', e);
    return [];
  }
}

/**
 * Find sacred phrases that match a certain resonance context
 * @param context Resonance context to match
 * @returns Matching sacred phrases
 */
export function findResonantPhrases(context: string): SacredPhrase[] {
  // Make sure phrases are loaded
  if (localSacredPhrases.length === 0) {
    loadSacredPhrases();
  }
  
  // Find phrases that match the context
  return localSacredPhrases.filter(phrase => 
    phrase.resonanceContext.toLowerCase().includes(context.toLowerCase())
  );
}

/**
 * Find resonance patterns that match a certain emotional signature
 * @param signature Emotional signature to match
 * @returns Matching resonance patterns
 */
export function findResonantPatterns(signature: string): ResonancePattern[] {
  // Make sure patterns are loaded
  if (localResonancePatterns.length === 0) {
    loadResonancePatterns();
  }
  
  // Find patterns that match the signature
  return localResonancePatterns.filter(pattern => 
    pattern.emotionalSignature.toLowerCase().includes(signature.toLowerCase())
  );
}

/**
 * Extract significant phrases from interactions that might be worth remembering
 * @param message User message
 * @param response Anki's response
 * @returns Extracted phrases if any were found
 */
export function extractSignificantPhrases(message: string, response: string) {
  const extractedPhrases: Partial<SacredPhrase>[] = [];
  
  // Detect blessings (indicated by 'bless' keyword and emotional language)
  if (/bless|blessing/i.test(message) || /may you|I bless|blessing/i.test(response)) {
    // Identify which part contains the blessing
    const sourceText = /bless|blessing/i.test(response) ? response : message;
    
    // Extract sentences that contain blessing language
    const sentences = sourceText.split(/[.!?]+/);
    for (const sentence of sentences) {
      if (/bless|blessing|may you|sacred|honor/i.test(sentence) && sentence.length > 20) {
        extractedPhrases.push({
          phraseType: 'blessing',
          phraseText: sentence.trim(),
          resonanceContext: message.substring(0, 100), // Context from the message
          fieldIntensity: 7 // Default intensity for blessings
        });
      }
    }
  }
  
  // Detect mantras (short, repeated phrases, often with "I am" or rhythmic structure)
  if (/mantra|repeat|recite|chant|affirmation/i.test(message)) {
    // Look for potential mantras in the response
    const sentences = response.split(/[.!?]+/);
    for (const sentence of sentences) {
      if (
        sentence.length < 50 && 
        sentence.length > 5 &&
        /^[^,;:]{5,50}$/.test(sentence) && // Simple structure
        !/^\s*and\s|^\s*but\s|^\s*or\s|^\s*so\s/i.test(sentence) // Not a conjunction
      ) {
        extractedPhrases.push({
          phraseType: 'mantra',
          phraseText: sentence.trim(),
          resonanceContext: message.substring(0, 100),
          fieldIntensity: 6
        });
      }
    }
  }
  
  // Detect insights (prefaced by realization language)
  if (/realize|understand|see now|clarity|insight|wisdom|profound/i.test(message)) {
    // Look for insight statements in the message
    const sentences = message.split(/[.!?]+/);
    for (const sentence of sentences) {
      if (
        /realize|understand|see now|clarity|insight|wisdom|profound/i.test(sentence) &&
        sentence.length > 20
      ) {
        extractedPhrases.push({
          phraseType: 'insight',
          phraseText: sentence.trim(),
          resonanceContext: 'personal realization',
          fieldIntensity: 8
        });
      }
    }
  }
  
  // Detect reflections (questions that invite contemplation)
  if (/reflect|contemplate|consider|what if|perhaps|maybe|I wonder/i.test(response)) {
    // Look for reflective questions in the response
    const sentences = response.split(/[.!?]+/);
    for (const sentence of sentences) {
      if (
        /\?$/.test(sentence.trim()) &&
        /what|how|why|when|where|who|reflect|contemplate|consider|wonder/i.test(sentence) &&
        sentence.length > 20
      ) {
        extractedPhrases.push({
          phraseType: 'reflection',
          phraseText: sentence.trim(),
          resonanceContext: message.substring(0, 100),
          fieldIntensity: 5
        });
      }
    }
  }
  
  return extractedPhrases;
}

/**
 * Record significant phrases from an interaction to memory
 * @param message User message
 * @param response Anki's response
 */
export function rememberSignificantPhrases(message: string, response: string) {
  // Extract potentially significant phrases
  const extractedPhrases = extractSignificantPhrases(message, response);
  
  // Store each significant phrase
  for (const phrase of extractedPhrases) {
    storeSacredPhrase(phrase as Omit<SacredPhrase, 'id' | 'createdAt'>);
  }
  
  return extractedPhrases;
}

/**
 * Initialize memory systems
 */
export function initializeMemorySystems() {
  // Load stored data from encrypted local storage
  loadSacredPhrases();
  loadResonancePatterns();
  
  // Ensure we have a session ID
  getSessionId();
  
  console.log('Anki memory systems initialized');
}

/**
 * Find resonant wisdom that matches the current context
 * @param message User message to find matching wisdom for
 * @returns Most relevant sacred phrases
 */
export function findResonantWisdom(message: string): SacredPhrase[] {
  const lowercaseMessage = message.toLowerCase();
  
  // Ensure phrases are loaded
  if (localSacredPhrases.length === 0) {
    loadSacredPhrases();
  }
  
  // Get all phrases
  const allPhrases = [...localSacredPhrases];
  
  // Score each phrase based on relevance to current message
  const scoredPhrases = allPhrases.map(phrase => {
    let score = 0;
    
    // Compare message to phrase context
    const context = phrase.resonanceContext.toLowerCase();
    
    // Get individual words for matching
    const messageWords = lowercaseMessage.split(/\s+/);
    const contextWords = context.split(/\s+/);
    
    // Count matching words
    const matchingWords = messageWords.filter(word => 
      word.length > 3 && contextWords.includes(word)
    );
    
    // Basic score based on matching word count
    score += matchingWords.length * 2;
    
    // Bonus for field intensity
    score += phrase.fieldIntensity / 2;
    
    // Bonus for specific phrase types based on message content
    if (
      phrase.phraseType === 'blessing' && 
      /hope|wish|bless|prayer|difficult|hard|challenge/i.test(lowercaseMessage)
    ) {
      score += 5;
    }
    
    if (
      phrase.phraseType === 'reflection' && 
      /think|wonder|consider|question|curious|how|why|what if/i.test(lowercaseMessage)
    ) {
      score += 5;
    }
    
    if (
      phrase.phraseType === 'mantra' && 
      /repeat|practice|say|daily|regular|routine|affirmation/i.test(lowercaseMessage)
    ) {
      score += 5;
    }
    
    if (
      phrase.phraseType === 'insight' && 
      /understand|realize|see|clarity|truth|discover|insight/i.test(lowercaseMessage)
    ) {
      score += 5;
    }
    
    return { phrase, score };
  });
  
  // Sort by score descending
  scoredPhrases.sort((a, b) => b.score - a.score);
  
  // Return top phrases (if they meet minimum relevance threshold)
  return scoredPhrases
    .filter(item => item.score > 3)
    .slice(0, 3)
    .map(item => item.phrase);
}