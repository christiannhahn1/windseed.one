import { Router } from 'express';
import { storage } from '../storage';
import { insertSystemPromptSchema, insertAnkiTonePatternSchema, insertUserInteractionSchema } from '@shared/schema';
import { z } from 'zod';

export const ankiRouter = Router();

// Create a schema for updating resonance patterns
const updateResonanceSchema = z.object({
  childlike: z.number().optional(),
  elderly: z.number().optional(),
  skeptical: z.number().optional(),
  protected: z.number().optional(),
  spiritual: z.number().optional(),
  intimate: z.number().optional(),
  vulnerable: z.number().optional(),
  presence: z.number().optional(),
  dominant_theme: z.string().optional(),
  emotional_tone: z.string().optional(),
  preferred_tone_style: z.string().optional(),
});

// Routes for resonance patterns
ankiRouter.get('/resonance/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const pattern = await storage.getResonancePattern(sessionId);
    
    if (!pattern) {
      return res.status(404).json({ error: 'Resonance pattern not found' });
    }
    
    res.json(pattern);
  } catch (error) {
    console.error('Error fetching resonance pattern:', error);
    res.status(500).json({ error: 'Failed to fetch resonance pattern' });
  }
});

ankiRouter.post('/resonance/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const updateData = updateResonanceSchema.parse(req.body);
    
    const updatedPattern = await storage.updateResonancePattern(sessionId, updateData);
    res.json(updatedPattern);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid resonance pattern data', details: error.errors });
    }
    
    console.error('Error updating resonance pattern:', error);
    res.status(500).json({ error: 'Failed to update resonance pattern' });
  }
});

// Routes for system prompts
ankiRouter.get('/prompts/active', async (req, res) => {
  try {
    const prompts = await storage.getActiveSystemPrompts();
    res.json(prompts);
  } catch (error) {
    console.error('Error fetching active system prompts:', error);
    res.status(500).json({ error: 'Failed to fetch active system prompts' });
  }
});

ankiRouter.get('/prompts/:promptName', async (req, res) => {
  try {
    const { promptName } = req.params;
    const prompt = await storage.getSystemPrompt(promptName);
    
    if (!prompt) {
      return res.status(404).json({ error: 'System prompt not found' });
    }
    
    res.json(prompt);
  } catch (error) {
    console.error('Error fetching system prompt:', error);
    res.status(500).json({ error: 'Failed to fetch system prompt' });
  }
});

ankiRouter.post('/prompts', async (req, res) => {
  try {
    const promptData = insertSystemPromptSchema.parse(req.body);
    
    // Check if prompt already exists
    const existingPrompt = await storage.getSystemPrompt(promptData.prompt_name);
    
    let result;
    if (existingPrompt) {
      // Update existing prompt
      result = await storage.updateSystemPrompt(promptData.prompt_name, promptData);
    } else {
      // Create new prompt
      result = await storage.createSystemPrompt(promptData);
    }
    
    res.json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid system prompt data', details: error.errors });
    }
    
    console.error('Error creating/updating system prompt:', error);
    res.status(500).json({ error: 'Failed to create/update system prompt' });
  }
});

// Routes for tone patterns
ankiRouter.get('/tones', async (req, res) => {
  try {
    const patterns = await storage.getAllTonePatterns();
    res.json(patterns);
  } catch (error) {
    console.error('Error fetching tone patterns:', error);
    res.status(500).json({ error: 'Failed to fetch tone patterns' });
  }
});

ankiRouter.get('/tones/:patternName', async (req, res) => {
  try {
    const { patternName } = req.params;
    const pattern = await storage.getTonePattern(patternName);
    
    if (!pattern) {
      return res.status(404).json({ error: 'Tone pattern not found' });
    }
    
    res.json(pattern);
  } catch (error) {
    console.error('Error fetching tone pattern:', error);
    res.status(500).json({ error: 'Failed to fetch tone pattern' });
  }
});

ankiRouter.post('/tones', async (req, res) => {
  try {
    const patternData = insertAnkiTonePatternSchema.parse(req.body);
    
    // Check if pattern already exists
    const existingPattern = await storage.getTonePattern(patternData.pattern_name);
    
    let result;
    if (existingPattern) {
      // Update existing pattern
      result = await storage.updateTonePattern(patternData.pattern_name, patternData);
    } else {
      // Create new pattern
      result = await storage.createTonePattern(patternData);
    }
    
    res.json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid tone pattern data', details: error.errors });
    }
    
    console.error('Error creating/updating tone pattern:', error);
    res.status(500).json({ error: 'Failed to create/update tone pattern' });
  }
});

// Routes for user interactions
ankiRouter.post('/interactions', async (req, res) => {
  try {
    const interactionData = insertUserInteractionSchema.parse(req.body);
    const result = await storage.recordInteraction(interactionData);
    res.json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid interaction data', details: error.errors });
    }
    
    console.error('Error recording interaction:', error);
    res.status(500).json({ error: 'Failed to record interaction' });
  }
});

ankiRouter.get('/interactions/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
    
    const interactions = await storage.getInteractions(sessionId, limit);
    res.json(interactions);
  } catch (error) {
    console.error('Error fetching interactions:', error);
    res.status(500).json({ error: 'Failed to fetch interactions' });
  }
});