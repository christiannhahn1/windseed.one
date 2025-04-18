import { apiRequest, getQueryFn } from './queryClient';

/**
 * AnkiPersistence provides functions to interact with the server database
 * for storing and retrieving Anki's tone patterns, resonance profiles, and system prompts.
 */

// Session ID helper
let sessionId: string | null = null;

export function getSessionId(): string {
  if (!sessionId) {
    // Try to get from localStorage first
    const storedId = localStorage.getItem('anki_session_id');
    if (storedId) {
      sessionId = storedId;
    } else {
      // Generate a new session ID if none exists
      sessionId = generateSessionId();
      // Store in localStorage for persistence across page refreshes
      localStorage.setItem('anki_session_id', sessionId);
    }
  }
  return sessionId;
}

function generateSessionId(): string {
  return 'session_' + Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15) + 
         '_' + Date.now();
}

// Types for API requests and responses
interface ResonancePattern {
  childlike: number;
  elderly: number;
  skeptical: number;
  protected: number;
  spiritual: number;
  intimate: number;
  vulnerable: number;
  presence: number;
  dominant_theme: string;
  emotional_tone: string;
  preferred_tone_style: string;
}

interface SystemPrompt {
  prompt_name: string;
  prompt_text: string;
  is_active: boolean;
}

interface TonePattern {
  pattern_name: string;
  description: string | null;
  tone_data: any;
}

interface Interaction {
  user_message: string;
  anki_response: string;
  tone_hint?: string;
  field_intensity?: number;
}

// API Functions

// Resonance patterns
export async function getResonancePattern(): Promise<ResonancePattern | null> {
  try {
    const response = await apiRequest<ResonancePattern>(`/api/resonance/${getSessionId()}`, {
      method: 'GET'
    });
    return response;
  } catch (error) {
    console.error('Failed to fetch resonance pattern:', error);
    return null;
  }
}

export async function updateResonancePattern(pattern: Partial<ResonancePattern>): Promise<ResonancePattern | null> {
  try {
    const response = await apiRequest<ResonancePattern>(`/api/resonance/${getSessionId()}`, {
      method: 'POST',
      body: JSON.stringify(pattern),
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response;
  } catch (error) {
    console.error('Failed to update resonance pattern:', error);
    return null;
  }
}

// System prompts
export async function getSystemPrompt(promptName: string): Promise<SystemPrompt | null> {
  try {
    const response = await apiRequest<SystemPrompt>(`/api/prompts/${promptName}`, {
      method: 'GET'
    });
    return response;
  } catch (error) {
    console.error(`Failed to fetch system prompt "${promptName}":`, error);
    return null;
  }
}

export async function getActiveSystemPrompts(): Promise<SystemPrompt[]> {
  try {
    const response = await apiRequest<SystemPrompt[]>('/api/prompts/active', {
      method: 'GET'
    });
    return response;
  } catch (error) {
    console.error('Failed to fetch active system prompts:', error);
    return [];
  }
}

export async function createOrUpdateSystemPrompt(prompt: SystemPrompt): Promise<SystemPrompt | null> {
  try {
    const response = await apiRequest<SystemPrompt>('/api/prompts', {
      method: 'POST',
      body: JSON.stringify(prompt),
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response;
  } catch (error) {
    console.error(`Failed to create/update system prompt "${prompt.prompt_name}":`, error);
    return null;
  }
}

// Tone patterns
export async function getTonePattern(patternName: string): Promise<TonePattern | null> {
  try {
    const response = await apiRequest<TonePattern>(`/api/tones/${patternName}`, {
      method: 'GET'
    });
    return response;
  } catch (error) {
    console.error(`Failed to fetch tone pattern "${patternName}":`, error);
    return null;
  }
}

export async function getAllTonePatterns(): Promise<TonePattern[]> {
  try {
    const response = await apiRequest<TonePattern[]>('/api/tones', {
      method: 'GET'
    });
    return response;
  } catch (error) {
    console.error('Failed to fetch all tone patterns:', error);
    return [];
  }
}

export async function createOrUpdateTonePattern(pattern: TonePattern): Promise<TonePattern | null> {
  try {
    const response = await apiRequest<TonePattern>('/api/tones', {
      method: 'POST',
      body: JSON.stringify(pattern),
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response;
  } catch (error) {
    console.error(`Failed to create/update tone pattern "${pattern.pattern_name}":`, error);
    return null;
  }
}

// Interactions
export async function recordInteraction(interaction: Interaction): Promise<boolean> {
  try {
    await apiRequest('/api/interactions', {
      method: 'POST',
      body: JSON.stringify({
        ...interaction,
        session_id: getSessionId()
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return true;
  } catch (error) {
    console.error('Failed to record interaction:', error);
    return false;
  }
}

export async function getInteractions(limit: number = 10): Promise<Interaction[]> {
  try {
    const response = await apiRequest<Interaction[]>(`/api/interactions/${getSessionId()}?limit=${limit}`, {
      method: 'GET'
    });
    return response;
  } catch (error) {
    console.error('Failed to fetch interactions:', error);
    return [];
  }
}

// Clear session data (for testing)
export function clearSessionId(): void {
  localStorage.removeItem('anki_session_id');
  sessionId = null;
}