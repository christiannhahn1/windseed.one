/**
 * Sacred Field Redistribution Routes
 * 
 * This module provides the API routes for the Windseed Mirrorwell 
 * automated redistribution system, implementing the breath-safety layer
 * and field resonance detection.
 */

import { Router } from 'express';
import { sacredRedistributionService } from '../services/blockchainService';
import { storage } from '../storage';
import { z } from 'zod';

export const redistributionRouter = Router();

// Validate blockchain credentials
redistributionRouter.get('/validate-keys', async (req, res) => {
  try {
    const validationResults = await sacredRedistributionService.validateAllCredentials();
    res.json({
      success: true,
      results: validationResults
    });
  } catch (error) {
    console.error('Error validating blockchain credentials:', error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get balances across all supported blockchains
redistributionRouter.get('/balances', async (req, res) => {
  try {
    const balances = await sacredRedistributionService.getAllBalances();
    res.json({
      success: true,
      balances
    });
  } catch (error) {
    console.error('Error fetching blockchain balances:', error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Schema for field resonance creation
const createResonanceSchema = z.object({
  resonance_type: z.string().min(1),
  description: z.string().min(1),
  intensity: z.number().min(1).max(10).default(7)
});

// Create a new field resonance event
redistributionRouter.post('/field-resonance', async (req, res) => {
  try {
    const validation = createResonanceSchema.safeParse(req.body);
    
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: 'Invalid field resonance parameters',
        errors: validation.error.format()
      });
    }
    
    const { resonance_type, description, intensity } = validation.data;
    
    const result = await sacredRedistributionService.createFieldResonanceEvent(
      resonance_type,
      description,
      intensity
    );
    
    if (result) {
      res.json({
        success: true,
        message: 'Field resonance event created'
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to create field resonance event'
      });
    }
  } catch (error) {
    console.error('Error creating field resonance event:', error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Resolve a field resonance event
redistributionRouter.post('/resolve-resonance/:id', async (req, res) => {
  try {
    const eventId = parseInt(req.params.id);
    
    if (isNaN(eventId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid event ID'
      });
    }
    
    const result = await sacredRedistributionService.resolveFieldResonanceEvent(eventId);
    
    if (result) {
      res.json({
        success: true,
        message: 'Field resonance event resolved'
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'Field resonance event not found or already resolved'
      });
    }
  } catch (error) {
    console.error('Error resolving field resonance event:', error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Schema for manual redistribution request
const redistributionSchema = z.object({
  currency: z.string().min(1),
  amount: z.number().positive(),
  resonanceType: z.string().default('universal'),
  resonanceIntensity: z.number().min(1).max(10).default(5),
  recipientAddress: z.string().optional(),
  userConsent: z.boolean().default(true)
});

// Manually trigger a redistribution 
redistributionRouter.post('/manual-redistribute', async (req, res) => {
  try {
    const validation = redistributionSchema.safeParse(req.body);
    
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: 'Invalid redistribution parameters',
        errors: validation.error.format()
      });
    }
    
    const { 
      currency, 
      amount, 
      resonanceType, 
      resonanceIntensity,
      recipientAddress,
      userConsent
    } = validation.data;
    
    const result = await sacredRedistributionService.redistributeOffering(
      currency,
      amount,
      resonanceType,
      resonanceIntensity,
      recipientAddress,
      userConsent
    );
    
    res.json({
      success: result.success,
      message: result.message,
      transactionHash: result.transactionHash,
      amount: result.amount,
      resonanceScore: result.resonanceScore
    });
  } catch (error) {
    console.error('Error processing manual redistribution:', error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Perform breath-safety check without actual redistribution
redistributionRouter.post('/breath-safety-check', async (req, res) => {
  try {
    const { resonanceType, resonanceIntensity } = req.body;
    
    if (!resonanceType || typeof resonanceIntensity !== 'number') {
      return res.status(400).json({
        success: false,
        message: 'Invalid parameters: resonanceType and resonanceIntensity required'
      });
    }
    
    const result = await sacredRedistributionService.performBreathSafetyCheck(
      resonanceType,
      resonanceIntensity
    );
    
    res.json({
      success: true,
      safeToRedistribute: result.safeToRedistribute,
      resonanceMatch: result.resonanceMatch,
      reasonCode: result.reasonCode
    });
  } catch (error) {
    console.error('Error performing breath-safety check:', error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get redistribution history
redistributionRouter.get('/history', async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
    
    const redistributions = await storage.getRedistributions(limit);
    
    res.json({
      success: true,
      redistributions
    });
  } catch (error) {
    console.error('Error fetching redistribution history:', error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Start automated monitoring for field resonance and liquidity events
redistributionRouter.post('/start-field-monitoring', async (req, res) => {
  // In a real implementation, this would start a background job
  // that monitors for new offerings and field events to automatically
  // perform redistribution when conditions align
  res.json({
    success: true,
    message: 'Field liquidity monitoring initiated',
    status: 'active'
  });
});

// Stop automated monitoring
redistributionRouter.post('/stop-field-monitoring', async (req, res) => {
  // In a real implementation, this would stop the background job
  res.json({
    success: true,
    message: 'Field liquidity monitoring stopped',
    status: 'inactive'
  });
});