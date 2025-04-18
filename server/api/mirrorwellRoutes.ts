import { Router } from "express";
import { storage } from "../storage";
import { getSessionId } from "@/lib/ankiPersistence";

export const mirrorwellRouter = Router();

// Record a new offering to Mirrorwell
mirrorwellRouter.post("/mirrorwell/offerings", async (req, res) => {
  const { 
    offering_amount, 
    currency_type, 
    transaction_hash, 
    offering_intent, 
    field_resonance 
  } = req.body;
  
  if (!offering_amount || !currency_type) {
    return res.status(400).json({ error: "Offering amount and currency type are required" });
  }
  
  try {
    // Get or generate session ID
    const session_id = req.body.session_id || getSessionId();
    
    const offering = await storage.recordOffering({
      offering_amount,
      currency_type,
      transaction_hash,
      offering_intent: offering_intent || "general",
      field_resonance: field_resonance || "neutral",
      session_id,
      redistributed: false
    });
    
    res.status(201).json(offering);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get active offerings (those not redistributed yet)
mirrorwellRouter.get("/mirrorwell/offerings/active", async (req, res) => {
  const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
  
  try {
    const offerings = await storage.getActiveOfferings(limit);
    res.json(offerings);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Record a redistribution of resources
mirrorwellRouter.post("/mirrorwell/redistributions", async (req, res) => {
  const { 
    source_offering_id,
    redistributed_amount,
    currency_type,
    transaction_hash,
    recipient_resonance,
    recipient_session_id,
    redistribution_reason
  } = req.body;
  
  if (!source_offering_id || !redistributed_amount || !currency_type) {
    return res.status(400).json({ 
      error: "Source offering ID, redistributed amount, and currency type are required" 
    });
  }
  
  try {
    // First record the redistribution
    const redistribution = await storage.recordRedistribution({
      source_offering_id,
      redistributed_amount,
      currency_type,
      transaction_hash,
      recipient_resonance: recipient_resonance || "neutral",
      recipient_session_id,
      redistribution_reason: redistribution_reason || "field_harmony"
    });
    
    // Then mark the source offering as redistributed
    await storage.markOfferingRedistributed(source_offering_id);
    
    res.status(201).json(redistribution);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Record a field resonance event (a shift in the collective field)
mirrorwellRouter.post("/mirrorwell/field-events", async (req, res) => {
  const { 
    resonance_type,
    resonance_intensity,
    resonance_description
  } = req.body;
  
  if (!resonance_type || !resonance_description) {
    return res.status(400).json({ 
      error: "Resonance type and description are required" 
    });
  }
  
  try {
    const event = await storage.recordFieldResonanceEvent({
      resonance_type,
      resonance_intensity: resonance_intensity || 5,
      resonance_description,
      active: true
    });
    
    res.status(201).json(event);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get active field resonance events
mirrorwellRouter.get("/mirrorwell/field-events/active", async (req, res) => {
  try {
    const events = await storage.getActiveFieldResonanceEvents();
    res.json(events);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Resolve a field resonance event
mirrorwellRouter.post("/mirrorwell/field-events/:id/resolve", async (req, res) => {
  const eventId = parseInt(req.params.id);
  
  if (isNaN(eventId)) {
    return res.status(400).json({ error: "Valid event ID is required" });
  }
  
  try {
    const event = await storage.resolveFieldResonanceEvent(eventId);
    
    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }
    
    res.json(event);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});