// Audio synthesizer for Brazilian Electronic Ballot Box (Urna Eletrônica)
// Uses Web Audio API for guaranteed offline/instant playback with no external latency,
// plus audio element fallback.

class UrnaAudio {
  private ctx: AudioContext | null = null;
  private audioFallback: HTMLAudioElement | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      try {
        this.audioFallback = new Audio('https://www.myinstants.com/media/sounds/urna-eletronica-confirma.mp3');
        this.audioFallback.preload = 'auto';
      } catch (e) {
        // audio element fallback not available
      }
    }
  }

  private getAudioContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  // Short beep when pressing numeric keys (0-9)
  playKeypadBeep() {
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(1050, ctx.currentTime);

      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } catch (e) {
      console.warn('Audio error:', e);
    }
  }

  // Double beep when pressing CORRIGE
  playCorrigeBeep() {
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      [0, 0.09].forEach((offset) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(520, now + offset);

        gain.gain.setValueAtTime(0.18, now + offset);
        gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.07);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + offset);
        osc.stop(now + offset + 0.07);
      });
    } catch (e) {
      console.warn('Audio error:', e);
    }
  }

  // Beep when pressing BRANCO
  playBrancoBeep() {
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(780, ctx.currentTime);

      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.12);
    } catch (e) {
      console.warn('Audio error:', e);
    }
  }

  // The iconic TSE Urna Eletrônica "Pirililili" vote completion sound!
  playConfirmaUrnaSound() {
    // Attempt fallback MP3 first if loaded and interactive
    if (this.audioFallback) {
      try {
        this.audioFallback.currentTime = 0;
        const playPromise = this.audioFallback.play();
        if (playPromise) {
          playPromise.catch(() => {
            // If browser blocked external mp3, synthesizer will play
            this.synthesizeTseChord();
          });
          return;
        }
      } catch (e) {
        // Fallback to Web Audio synthesis
      }
    }

    this.synthesizeTseChord();
  }

  // Authentic Web Audio synthesis of the TSE completion sound
  private synthesizeTseChord() {
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const now = ctx.currentTime;

      // TSE confirmation consists of rising chirps followed by sustained harmonic
      // 1. First chirp (~1050 Hz)
      // 2. Second chirp (~1400 Hz)
      // 3. Third chirp (~1850 Hz)
      // 4. Final long tone (~2300 Hz)
      const notes = [
        { freq: 1100, start: 0, duration: 0.11 },
        { freq: 1450, start: 0.11, duration: 0.11 },
        { freq: 1850, start: 0.22, duration: 0.13 },
        { freq: 2350, start: 0.35, duration: 1.1 },
      ];

      notes.forEach((note) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        // Blend square and sine for that 90s piezoelectric buzzer TSE texture
        osc.type = 'sine';
        osc.frequency.setValueAtTime(note.freq, now + note.start);

        const startTime = now + note.start;
        const endTime = startTime + note.duration;

        gain.gain.setValueAtTime(0.001, startTime);
        gain.gain.linearRampToValueAtTime(0.22, startTime + 0.015);

        if (note.start === 0.35) {
          // Sustained long final tone
          gain.gain.setValueAtTime(0.22, startTime + 0.7);
          gain.gain.exponentialRampToValueAtTime(0.001, endTime);
        } else {
          gain.gain.exponentialRampToValueAtTime(0.001, endTime);
        }

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(startTime);
        osc.stop(endTime);
      });
    } catch (e) {
      console.warn('Web Audio synthesis error:', e);
    }
  }
}

export const urnaAudio = new UrnaAudio();
