// Custom 8-bit synth sound designer using native Web Audio API
class AudioManager {
  private ctx: AudioContext | null = null;
  private muted: boolean = false;
  private musicPlaying: boolean = false;
  private bgMusicInterval: any = null;
  private bgMusicStep: number = 0;

  // Hypnotic retro-cyberpunk chord rhythm (bassline + arpeggios)
  private musicNotes = [
    110.00, 110.00, 164.81, 110.00, // A2, A2, E3, A2
    130.81, 130.81, 196.00, 130.81, // C3, C3, G3, C3
    146.83, 146.83, 220.00, 146.83, // D3, D3, A3, D3
    123.47, 123.47, 185.00, 123.47  // B2, B2, F#3, B2
  ];

  private initCtx() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.muted = !this.muted;
    localStorage.setItem('trivia_audio_muted', this.muted ? 'true' : 'false');
    if (this.muted) {
      if (this.bgMusicInterval) {
        clearInterval(this.bgMusicInterval);
        this.bgMusicInterval = null;
      }
    } else {
      if (this.musicPlaying) {
        this.startBgMusic();
      }
    }
    return this.muted;
  }

  isMuted() {
    return this.muted;
  }

  constructor() {
    try {
      this.muted = localStorage.getItem('trivia_audio_muted') === 'true';
    } catch (_) {
      this.muted = false;
    }
  }

  // Quick retro game-click sound
  playClick() {
    if (this.muted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(600, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(150, this.ctx.currentTime + 0.08);
      
      gain.gain.setValueAtTime(0.05, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.08);
      
      osc.start();
      osc.stop(this.ctx.currentTime + 0.08);
    } catch (_) {}
  }

  // Classic retro 8-bit double-beeping success coin sound - enhanced to triple arpeggio chime!
  playCorrect() {
    if (this.muted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      
      const now = this.ctx.currentTime;
      
      // We will create two oscillators for a beautiful fat harmony sound
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.ctx.destination);
      
      // Standard bright vintage triangle/square split
      osc1.type = 'square';
      osc2.type = 'sine';
      
      // A glorious retro major-arpeggio slide
      // Chime note sequence: G5 (784Hz) -> C6 (1046Hz) -> E6 (1318Hz)
      osc1.frequency.setValueAtTime(783.99, now); // G5 
      osc2.frequency.setValueAtTime(392.00, now); // G4 (Sub-octave warmth)
      gain.gain.setValueAtTime(0.03, now);
      
      // Step 2
      osc1.frequency.setValueAtTime(1046.50, now + 0.08); // C6
      osc2.frequency.setValueAtTime(523.25, now + 0.08); // C5
      
      // Step 3
      osc1.frequency.setValueAtTime(1318.51, now + 0.16); // E6
      osc2.frequency.setValueAtTime(659.25, now + 0.16); // E5
      
      gain.gain.setValueAtTime(0.03, now + 0.08);
      gain.gain.setValueAtTime(0.04, now + 0.16);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.45);
      
      osc1.start();
      osc2.start();
      osc1.stop(now + 0.45);
      osc2.stop(now + 0.45);
    } catch (_) {}
  }

  // Low heavy retro analog buzz for error
  playWrong() {
    if (this.muted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.linearRampToValueAtTime(80, now + 0.25);
      
      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      
      osc.start();
      osc.stop(now + 0.3);
    } catch (_) {}
  }

  // Quick high-pitch powerup sound
  playLevelUp() {
    if (this.muted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(300, now);
      osc.frequency.exponentialRampToValueAtTime(1200, now + 0.45);
      
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
      
      osc.start();
      osc.stop(now + 0.5);
    } catch (_) {}
  }

  // Slow retro sweep down on gameover
  playGameOver() {
    if (this.muted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(260, now);
      osc.frequency.linearRampToValueAtTime(50, now + 0.6);
      
      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
      
      osc.start();
      osc.stop(now + 0.6);
    } catch (_) {}
  }

  // Starts the background music loop (procedural 8-bit bassline)
  startBgMusic() {
    this.musicPlaying = true;
    if (this.muted) return;
    if (this.bgMusicInterval) {
      clearInterval(this.bgMusicInterval);
    }
    
    this.initCtx();
    if (!this.ctx) return;
    
    const tempo = 220; // 220ms per note (approx 136 BPM)
    
    this.bgMusicInterval = setInterval(() => {
      try {
        if (this.muted || !this.ctx) return;
        
        const now = this.ctx.currentTime;
        const noteFreq = this.musicNotes[this.bgMusicStep % this.musicNotes.length];
        
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(noteFreq, now);
        
        gain.gain.setValueAtTime(0.012, now); // quiet backdrop
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);
        
        osc.start();
        osc.stop(now + 0.2);
        
        // Add subtle harmonic arpeggio every few beats
        if (this.bgMusicStep % 8 === 4) {
          const oscArp = this.ctx.createOscillator();
          const gainArp = this.ctx.createGain();
          
          oscArp.connect(gainArp);
          gainArp.connect(this.ctx.destination);
          
          oscArp.type = 'sine';
          oscArp.frequency.setValueAtTime(noteFreq * 3, now); // Sweet 5th arpeggio overlay
          
          gainArp.gain.setValueAtTime(0.006, now);
          gainArp.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);
          
          oscArp.start();
          oscArp.stop(now + 0.4);
        }
        
        this.bgMusicStep++;
      } catch (_) {}
    }, tempo);
  }

  // Stops background music loop
  stopBgMusic() {
    this.musicPlaying = false;
    if (this.bgMusicInterval) {
      clearInterval(this.bgMusicInterval);
      this.bgMusicInterval = null;
    }
  }
}

export const audio = new AudioManager();
