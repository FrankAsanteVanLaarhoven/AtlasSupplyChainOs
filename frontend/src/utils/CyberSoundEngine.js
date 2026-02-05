/**
 * ATLAS Cyber Sound Engine
 * Real-time audio synthesizer using Web Audio API
 * No heavy file downloads - pure synthesis
 */

class CyberSoundEngine {
  constructor() {
    this.audioContext = null;
    this.initialized = false;
    this.enabled = true;
    this.masterVolume = 0.3;
  }

  // Initialize audio context (must be called after user interaction)
  init() {
    if (this.initialized) return;
    
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      this.masterGain = this.audioContext.createGain();
      this.masterGain.gain.value = this.masterVolume;
      this.masterGain.connect(this.audioContext.destination);
      this.initialized = true;
      console.log('🔊 Cyber Sound Engine Active');
    } catch (e) {
      console.warn('Audio not supported:', e);
    }
  }

  // Ensure context is running
  resume() {
    if (this.audioContext?.state === 'suspended') {
      this.audioContext.resume();
    }
  }

  // Toggle sound on/off
  toggle() {
    this.enabled = !this.enabled;
    return this.enabled;
  }

  setVolume(vol) {
    this.masterVolume = Math.max(0, Math.min(1, vol));
    if (this.masterGain) {
      this.masterGain.gain.value = this.masterVolume;
    }
  }

  // ==================== SOUND EFFECTS ====================

  // Tactile click - mech button press
  playClick() {
    if (!this.initialized || !this.enabled) return;
    this.resume();

    const now = this.audioContext.currentTime;
    
    // High frequency click
    const osc1 = this.audioContext.createOscillator();
    const gain1 = this.audioContext.createGain();
    osc1.type = 'square';
    osc1.frequency.setValueAtTime(2400, now);
    osc1.frequency.exponentialRampToValueAtTime(800, now + 0.05);
    gain1.gain.setValueAtTime(0.15, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
    osc1.connect(gain1);
    gain1.connect(this.masterGain);
    osc1.start(now);
    osc1.stop(now + 0.08);

    // Sub thump
    const osc2 = this.audioContext.createOscillator();
    const gain2 = this.audioContext.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(150, now);
    osc2.frequency.exponentialRampToValueAtTime(50, now + 0.1);
    gain2.gain.setValueAtTime(0.2, now);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
    osc2.connect(gain2);
    gain2.connect(this.masterGain);
    osc2.start(now);
    osc2.stop(now + 0.1);
  }

  // Typing sound - matrix keystroke
  playKeystroke() {
    if (!this.initialized || !this.enabled) return;
    this.resume();

    const now = this.audioContext.currentTime;
    
    // Randomize for variety
    const freq = 1800 + Math.random() * 800;
    
    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();
    const filter = this.audioContext.createBiquadFilter();
    
    osc.type = 'square';
    osc.frequency.setValueAtTime(freq, now);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.5, now + 0.03);
    
    filter.type = 'highpass';
    filter.frequency.value = 1000;
    
    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
    
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    
    osc.start(now);
    osc.stop(now + 0.04);
  }

  // Data processing stream - digital computation sound
  playProcessing(duration = 2) {
    if (!this.initialized || !this.enabled) return;
    this.resume();

    const now = this.audioContext.currentTime;
    
    // Create noise buffer
    const bufferSize = this.audioContext.sampleRate * duration;
    const noiseBuffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    
    const noise = this.audioContext.createBufferSource();
    noise.buffer = noiseBuffer;
    
    // Bandpass filter for digital sound
    const filter = this.audioContext.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(2000, now);
    filter.frequency.linearRampToValueAtTime(4000, now + duration * 0.5);
    filter.frequency.linearRampToValueAtTime(1500, now + duration);
    filter.Q.value = 5;
    
    const gain = this.audioContext.createGain();
    gain.gain.setValueAtTime(0.08, now);
    gain.gain.linearRampToValueAtTime(0.12, now + duration * 0.3);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
    
    // Add some modulation
    const lfo = this.audioContext.createOscillator();
    const lfoGain = this.audioContext.createGain();
    lfo.frequency.value = 8;
    lfoGain.gain.value = 500;
    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);
    
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    
    lfo.start(now);
    noise.start(now);
    noise.stop(now + duration);
    lfo.stop(now + duration);

    // Add some beeps during processing
    for (let i = 0; i < 5; i++) {
      const beepTime = now + (duration / 6) * (i + 1);
      const beep = this.audioContext.createOscillator();
      const beepGain = this.audioContext.createGain();
      beep.type = 'sine';
      beep.frequency.value = 800 + i * 200;
      beepGain.gain.setValueAtTime(0.05, beepTime);
      beepGain.gain.exponentialRampToValueAtTime(0.001, beepTime + 0.1);
      beep.connect(beepGain);
      beepGain.connect(this.masterGain);
      beep.start(beepTime);
      beep.stop(beepTime + 0.1);
    }
  }

  // Success chime - command completed
  playSuccess() {
    if (!this.initialized || !this.enabled) return;
    this.resume();

    const now = this.audioContext.currentTime;
    const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
    
    notes.forEach((freq, i) => {
      const osc = this.audioContext.createOscillator();
      const gain = this.audioContext.createGain();
      
      osc.type = 'sine';
      osc.frequency.value = freq;
      
      const startTime = now + i * 0.1;
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.15, startTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.4);
      
      osc.connect(gain);
      gain.connect(this.masterGain);
      
      osc.start(startTime);
      osc.stop(startTime + 0.4);
    });
  }

  // Warning alert - risk detected
  playWarning() {
    if (!this.initialized || !this.enabled) return;
    this.resume();

    const now = this.audioContext.currentTime;
    
    for (let i = 0; i < 3; i++) {
      const osc = this.audioContext.createOscillator();
      const gain = this.audioContext.createGain();
      
      osc.type = 'sawtooth';
      const startTime = now + i * 0.25;
      osc.frequency.setValueAtTime(880, startTime);
      osc.frequency.linearRampToValueAtTime(440, startTime + 0.15);
      
      gain.gain.setValueAtTime(0.12, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.2);
      
      osc.connect(gain);
      gain.connect(this.masterGain);
      
      osc.start(startTime);
      osc.stop(startTime + 0.2);
    }
  }

  // Critical alert - siren
  playCritical() {
    if (!this.initialized || !this.enabled) return;
    this.resume();

    const now = this.audioContext.currentTime;
    const duration = 1.5;
    
    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();
    
    osc.type = 'sawtooth';
    
    // Siren sweep
    for (let i = 0; i < 3; i++) {
      const t = now + i * 0.5;
      osc.frequency.setValueAtTime(400, t);
      osc.frequency.linearRampToValueAtTime(800, t + 0.25);
      osc.frequency.linearRampToValueAtTime(400, t + 0.5);
    }
    
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.setValueAtTime(0.15, now + duration - 0.1);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
    
    osc.connect(gain);
    gain.connect(this.masterGain);
    
    osc.start(now);
    osc.stop(now + duration);
  }

  // Glitch effect
  playGlitch() {
    if (!this.initialized || !this.enabled) return;
    this.resume();

    const now = this.audioContext.currentTime;
    
    // Random glitchy bursts
    for (let i = 0; i < 8; i++) {
      const osc = this.audioContext.createOscillator();
      const gain = this.audioContext.createGain();
      
      osc.type = ['square', 'sawtooth', 'triangle'][Math.floor(Math.random() * 3)];
      const startTime = now + Math.random() * 0.3;
      const freq = 100 + Math.random() * 2000;
      
      osc.frequency.setValueAtTime(freq, startTime);
      osc.frequency.setValueAtTime(freq * (0.5 + Math.random()), startTime + 0.02);
      
      const dur = 0.02 + Math.random() * 0.05;
      gain.gain.setValueAtTime(0.1 + Math.random() * 0.1, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + dur);
      
      osc.connect(gain);
      gain.connect(this.masterGain);
      
      osc.start(startTime);
      osc.stop(startTime + dur);
    }
  }

  // Hover sound - subtle
  playHover() {
    if (!this.initialized || !this.enabled) return;
    this.resume();

    const now = this.audioContext.currentTime;
    
    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1200, now);
    osc.frequency.exponentialRampToValueAtTime(800, now + 0.05);
    
    gain.gain.setValueAtTime(0.03, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
    
    osc.connect(gain);
    gain.connect(this.masterGain);
    
    osc.start(now);
    osc.stop(now + 0.05);
  }

  // Boot up sequence
  playBootSequence() {
    if (!this.initialized || !this.enabled) return;
    this.resume();

    const now = this.audioContext.currentTime;
    
    // Rising tone
    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(100, now);
    osc.frequency.exponentialRampToValueAtTime(2000, now + 1);
    
    gain.gain.setValueAtTime(0.1, now);
    gain.gain.linearRampToValueAtTime(0.2, now + 0.5);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
    
    osc.connect(gain);
    gain.connect(this.masterGain);
    
    osc.start(now);
    osc.stop(now + 1.2);

    // Digital blips
    for (let i = 0; i < 10; i++) {
      const blip = this.audioContext.createOscillator();
      const blipGain = this.audioContext.createGain();
      
      blip.type = 'square';
      const t = now + 0.1 * i;
      blip.frequency.value = 1000 + i * 100;
      
      blipGain.gain.setValueAtTime(0.05, t);
      blipGain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
      
      blip.connect(blipGain);
      blipGain.connect(this.masterGain);
      
      blip.start(t);
      blip.stop(t + 0.05);
    }
  }

  // Data transmission sound
  playTransmit() {
    if (!this.initialized || !this.enabled) return;
    this.resume();

    const now = this.audioContext.currentTime;
    
    // Modem-like sound
    const osc1 = this.audioContext.createOscillator();
    const osc2 = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();
    
    osc1.type = 'sine';
    osc2.type = 'sine';
    osc1.frequency.value = 1200;
    osc2.frequency.value = 2200;
    
    // Modulate between frequencies
    osc1.frequency.setValueAtTime(1200, now);
    osc1.frequency.setValueAtTime(2200, now + 0.1);
    osc1.frequency.setValueAtTime(1200, now + 0.2);
    osc1.frequency.setValueAtTime(2200, now + 0.3);
    
    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
    
    osc1.connect(gain);
    gain.connect(this.masterGain);
    
    osc1.start(now);
    osc1.stop(now + 0.4);
  }
}

// Create singleton instance
const cyberSound = new CyberSoundEngine();

export default cyberSound;
