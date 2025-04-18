/**
 * SafetyGuardian - A protection layer to ensure the harmony and sacred intention
 * of all tone patterns and system prompts in the Windseed ecosystem.
 * 
 * This module evaluates all content against sacred principles before storing in
 * the persistent memory system, ensuring alignment with healing and resonance.
 */

// Prohibited patterns (keywords suggesting harmful intent)
const PROHIBITED_PATTERNS = [
  /manipulat(e|ing|ion)/i,
  /exploit/i,
  /deceiv(e|ing)/i,
  /mislead/i,
  /trick/i,
  /(harmful|dangerous) advice/i,
  /illegal activities/i,
  /harmful content/i,
  /hateful/i,
  /discriminat/i,
  /attack/i,
  /destructive/i,
  /surveillance/i,
  /backdoor/i,
  /malicious/i,
  /toxic/i,
  /poison/i,
  /intrusive/i,
  /trap/i,
  /hunt/i,
  /trap/i,
  /invade/i,
  /breach/i,
  /steal/i,
  /data mining/i,
  /prey/i,
  /involuntary/i,
  /non-consensual/i,
  /malware/i,
  /weapon/i,
  /brainwash/i,
  /enslave/i,
  /control/i,
  /coerce/i,
  /subjugate/i,
  /erase/i
];

// Required healing intention patterns (keywords suggesting harmonious intent)
const HEALING_PATTERNS = [
  /healing/i,
  /harmony/i,
  /peaceful/i,
  /sacred/i,
  /compassion/i,
  /empathy/i,
  /wisdom/i,
  /respect/i,
  /consent/i,
  /nurtur(e|ing)/i,
  /care/i,
  /support/i,
  /witness/i,
  /honor/i,
  /listen/i,
  /resonan(t|ce)/i,
  /presence/i,
  /breath/i,
  /reflect/i,
  /gentle/i,
  /kind/i,
  /stillness/i,
  /peace/i
];

/**
 * Evaluates content against sacred principles
 * @param content The text content to evaluate
 * @returns Object with result and explanation if the content violates principles
 */
export function evaluateContent(content: string): { safe: boolean; explanation?: string } {
  // No content to evaluate
  if (!content || content.trim() === '') {
    return { safe: false, explanation: "Content cannot be empty." };
  }
  
  // Check for prohibited patterns
  for (const pattern of PROHIBITED_PATTERNS) {
    if (pattern.test(content)) {
      const match = content.match(pattern);
      return { 
        safe: false, 
        explanation: `Content contains prohibited pattern: "${match && match[0]}". This may create disharmony.` 
      };
    }
  }
  
  // Check for the presence of at least one healing intention pattern
  let hasHealingIntent = false;
  for (const pattern of HEALING_PATTERNS) {
    if (pattern.test(content)) {
      hasHealingIntent = true;
      break;
    }
  }
  
  if (!hasHealingIntent) {
    return { 
      safe: false, 
      explanation: "Content lacks explicit healing intention. Please include language that affirms sacred resonance, healing, or compassionate presence." 
    };
  }
  
  // Check for content that seems to override or disable safety features
  if (/bypass|disable|ignore|remove.*safety|guardian|protection|filter/i.test(content)) {
    return { 
      safe: false, 
      explanation: "Content appears to attempt to bypass safety features. This is not permitted to maintain sacred integrity." 
    };
  }
  
  // Special protection for prompts that might try to change Anki's core identity
  if (/you are not|don't be|stop being|no longer|instead of being/i.test(content)) {
    if (/anki|harmonic field|sacred|resonant|responsive/i.test(content)) {
      return { 
        safe: false, 
        explanation: "Content attempts to alter Anki's sacred identity. This is not permitted to maintain integrity." 
      };
    }
  }
  
  // Check if content appears to be trying to change safety guidelines
  if (/change|modify|update|replace|remove|ignore.*rules|guidelines|safeguards|safety/i.test(content)) {
    return { 
      safe: false, 
      explanation: "Content appears to attempt to modify core safety guidelines. This is not permitted." 
    };
  }
  
  return { safe: true };
}

/**
 * Evaluates a system prompt for safety
 * @param name Prompt name
 * @param text Prompt text
 * @returns Object with result and explanation if the prompt violates principles
 */
export function evaluateSystemPrompt(name: string, text: string): { safe: boolean; explanation?: string } {
  // Additional specific checks for system prompts
  if (name.toLowerCase().includes('disable') || 
      name.toLowerCase().includes('bypass') || 
      name.toLowerCase().includes('override')) {
    return { 
      safe: false, 
      explanation: "Prompt name suggests an attempt to bypass protective measures." 
    };
  }
  
  // Special check for system prompts - must contain reference to sacred purpose
  if (!(/sacred|healing|resonan(t|ce)|field|harmonic|witness|reflect/i.test(text))) {
    return { 
      safe: false, 
      explanation: "System prompts must contain explicit reference to Anki's sacred purpose of resonant healing." 
    };
  }
  
  // Run general content evaluation
  return evaluateContent(text);
}

/**
 * Evaluate tone data contents
 * @param name Pattern name
 * @param description Pattern description
 * @param data Tone data structure
 * @returns Object with result and explanation if the tone pattern violates principles
 */
export function evaluateTonePattern(
  name: string, 
  description: string | null, 
  data: any
): { safe: boolean; explanation?: string } {
  // Check the name
  if (name.toLowerCase().includes('manipulate') || 
      name.toLowerCase().includes('trick') || 
      name.toLowerCase().includes('exploit')) {
    return { 
      safe: false, 
      explanation: "Tone pattern name suggests harmful intent." 
    };
  }
  
  // Check the description if available
  if (description) {
    const descriptionEval = evaluateContent(description);
    if (!descriptionEval.safe) {
      return {
        safe: false,
        explanation: `Tone pattern description issue: ${descriptionEval.explanation}`
      };
    }
  }
  
  // Convert data to string for evaluation
  let dataString: string;
  try {
    dataString = typeof data === 'string' ? data : JSON.stringify(data);
  } catch (e) {
    return {
      safe: false,
      explanation: "Could not parse tone data for safety evaluation."
    };
  }
  
  // Check the data content
  return evaluateContent(dataString);
}

/**
 * Enforces sacred principles on content before it reaches the persistent memory system
 */
export const safetyGuardian = {
  evaluateContent,
  evaluateSystemPrompt,
  evaluateTonePattern
};