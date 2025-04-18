/**
 * Audio Service - Manages ambient sounds and solfeggio frequencies
 * This service handles background audio, layering of sounds, and specialized frequency generation
 */

import { useEffect, useState } from 'react';

// Import ocean sound
import oceanSoundPath from '@assets/Gentle Ocean Current.wav'; 

// Track active audio sources
const activeSources: { [key: string]: HTMLAudioElement } = {};

// Enable/disable state
let audioEnabled = true;
let masterVolume = 0.7; // 0 to 1

/**
 * Set the master volume for all audio
 */
export function setMasterVolume(volume: number): void {
  masterVolume = Math.max(0, Math.min(1, volume));
  
  // Apply to all active audio sources
  Object.values(activeSources).forEach(audio => {
    audio.volume = Math.min(1, audio.volume * masterVolume);
  });
}

/**
 * Enable or disable all audio
 */
export function setAudioEnabled(enabled: boolean): void {
  audioEnabled = enabled;
  
  if (!enabled) {
    // Pause all active sounds
    Object.values(activeSources).forEach(audio => {
      audio.pause();
    });
  } else {
    // Resume previously active sounds
    Object.values(activeSources).forEach(audio => {
      if (audio.dataset.wasPlaying === 'true') {
        audio.play().catch(e => console.warn('Error resuming audio:', e));
      }
    });
  }
}

/**
 * Play ocean ambient sound
 * Gentle ocean waves for meditation background
 */
export function playOceanSound(volume: number = 0.5): void {
  playAmbientSound('ocean', oceanSoundPath, volume, true);
}

/**
 * Stop ocean ambient sound
 */
export function stopOceanSound(): void {
  stopAmbientSound('ocean');
}

/**
 * Play a specific solfeggio frequency
 * @param frequency The solfeggio frequency in Hz
 * @param volume Volume from 0 to 1
 * @param fadeIn Time in ms to fade in
 */
export function playSolfeggioTone(frequency: number, volume: number = 0.3, fadeIn: number = 1000): void {
  if (!audioEnabled) return;
  
  // Create audio context on demand
  const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
  if (!AudioContext) {
    console.warn('Web Audio API not supported in this browser');
    return;
  }
  
  const audioCtx = new AudioContext();
  
  // Create oscillator for the tone
  const oscillator = audioCtx.createOscillator();
  oscillator.type = 'sine'; // Pure sine wave for cleaner tone
  oscillator.frequency.value = frequency;
  
  // Create gain node for volume control
  const gainNode = audioCtx.createGain();
  gainNode.gain.value = 0; // Start at zero for fade in
  
  // Connect nodes
  oscillator.connect(gainNode);
  gainNode.connect(audioCtx.destination);
  
  // Start the oscillator
  oscillator.start();
  
  // Fade in
  gainNode.gain.linearRampToValueAtTime(volume * masterVolume, audioCtx.currentTime + fadeIn/1000);
  
  // Store for later control
  activeSources[`solfeggio-${frequency}`] = {
    oscillator,
    gainNode,
    audioCtx
  } as any;
}

/**
 * Stop a specific solfeggio frequency
 * @param frequency The frequency to stop
 * @param fadeOut Time in ms to fade out
 */
export function stopSolfeggioTone(frequency: number, fadeOut: number = 1000): void {
  const key = `solfeggio-${frequency}`;
  const source = activeSources[key] as any;
  
  if (source) {
    const { oscillator, gainNode, audioCtx } = source;
    
    // Fade out
    gainNode.gain.linearRampToValueAtTime(0, audioCtx.currentTime + fadeOut/1000);
    
    // Stop after fade out
    setTimeout(() => {
      oscillator.stop();
      delete activeSources[key];
    }, fadeOut);
  }
}

/**
 * Play an ambient sound
 * @param id Unique identifier for this sound
 * @param src Source path
 * @param volume Volume from 0 to 1
 * @param loop Whether to loop the sound
 */
export function playAmbientSound(id: string, src: string, volume: number = 0.5, loop: boolean = true): void {
  if (!audioEnabled) return;
  
  // Stop if already playing
  stopAmbientSound(id);
  
  // Create new audio element
  const audio = new Audio(src);
  audio.loop = loop;
  audio.volume = volume * masterVolume;
  audio.dataset.wasPlaying = 'true';
  
  // Store for later control
  activeSources[id] = audio;
  
  // Play with error handling
  audio.play().catch(e => {
    console.warn(`Error playing ambient sound ${id}:`, e);
    delete activeSources[id];
  });
}

/**
 * Stop an ambient sound
 * @param id The sound identifier to stop
 */
export function stopAmbientSound(id: string): void {
  const audio = activeSources[id];
  
  if (audio) {
    audio.pause();
    audio.currentTime = 0;
    audio.dataset.wasPlaying = 'false';
    delete activeSources[id];
  }
}

/**
 * React hook for managing audio state
 */
export function useAudio() {
  const [isEnabled, setIsEnabled] = useState(audioEnabled);
  const [volume, setVolume] = useState(masterVolume);
  
  // Update internal state when changed from hook
  useEffect(() => {
    setAudioEnabled(isEnabled);
  }, [isEnabled]);
  
  useEffect(() => {
    setMasterVolume(volume);
  }, [volume]);
  
  return {
    isEnabled,
    setIsEnabled,
    volume,
    setVolume,
    playOceanSound,
    stopOceanSound,
    playSolfeggioTone,
    stopSolfeggioTone
  };
}

// Common Solfeggio frequencies
export const SOLFEGGIO_FREQUENCIES = {
  UT: 396, // Liberating guilt and fear
  RE: 417, // Undoing situations and facilitating change
  MI: 528, // Transformation and miracles (DNA repair)
  FA: 639, // Connecting/relationships
  SOL: 741, // Awakening intuition
  LA: 852, // Returning to spiritual order
  OM: 432, // Universal tuning, natural vibration
  CROWN: 963, // Higher consciousness, divine connection
};

// Specialized frequencies combinations used in the app
export const FREQUENCY_COMBINATIONS = {
  HEALING_TRIAD: [396, 528, 639], // Healing, transformation, connection
  AWAKENING_TRIAD: [417, 741, 852], // Change, intuition, spiritual connection
  PRESENCE_TRIAD: [432, 528, 963], // Alignment, transformation, divine connection
  HARMONY_SEQUENCE: [396, 417, 528, 639, 741, 852], // Full sequence for harmony
};

// Create triads from sacred geometry principles
export function createSacredTriad(baseFrequency: number): number[] {
  const phi = 1.618033988749895; // Golden ratio
  return [
    baseFrequency,
    baseFrequency * phi,
    baseFrequency * phi * phi
  ];
}