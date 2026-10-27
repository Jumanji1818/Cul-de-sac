/**
 * Procedural Web Audio Synthesizer for Cul-de-Sac Chaos
 * Zero external audio files, ultra-responsive, zero latency.
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private musicGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private masterGain: GainNode | null = null;
  private isMusicPlaying: boolean = false;
  private musicInterval: number | null = null;
  private musicStep: number = 0;
  private chaosLevel: number = 0; // 0 to 1, affects music intensity

  constructor() {
    // AudioContext will be initialized on first user gesture
  }

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.85, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.setValueAtTime(0.9, this.ctx.currentTime);
      this.sfxGain.connect(this.masterGain);

      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.setValueAtTime(0.35, this.ctx.currentTime);
      this.musicGain.connect(this.masterGain);
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(muted ? 0 : 0.85, this.ctx.currentTime, 0.05);
    }
  }

  public toggleMute(): boolean {
    this.setMuted(!this.isMuted);
    return this.isMuted;
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  public setSfxVolume(vol: number) {
    if (this.sfxGain && this.ctx) {
      this.sfxGain.gain.setTargetAtTime(Math.max(0, Math.min(1, vol)), this.ctx.currentTime, 0.05);
    }
  }

  public setMusicVolume(vol: number) {
    if (this.musicGain && this.ctx) {
      this.musicGain.gain.setTargetAtTime(Math.max(0, Math.min(1, vol)), this.ctx.currentTime, 0.05);
    }
  }

  public setChaosLevel(level: number) {
    this.chaosLevel = Math.max(0, Math.min(1, level));
  }

  public playDogBark() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    // Comical dog "WOOF"
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(260, t);
    osc.frequency.exponentialRampToValueAtTime(110, t + 0.14);

    gain.gain.setValueAtTime(0.35, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.16);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.18);
  }

  public playBananaSlip() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    // Comical cartoon slide whistle up then thud
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(300, t);
    osc.frequency.exponentialRampToValueAtTime(1100, t + 0.22);
    osc.frequency.linearRampToValueAtTime(180, t + 0.35);

    gain.gain.setValueAtTime(0.35, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.38);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.4);

    // Punchy thud at end
    setTimeout(() => {
      this.playKick();
    }, 240);
  }

  public playConfettiPop() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    // Party Popper noise burst
    this.playNoise(0.12, 0.45, 1200, 6000);

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(800, t);
    osc.frequency.exponentialRampToValueAtTime(1400, t + 0.15);
    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.28);
  }

  public playSmokePoof() {
    if (this.isMuted) return;
    this.initContext();
    // Muffled gas hiss
    this.playNoise(0.4, 0.25, 400, 2200);
  }

  public playMegaKickBoost() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    const notes = [261.63, 329.63, 392.0, 523.25, 659.25];
    notes.forEach((freq, idx) => {
      if (!this.ctx || !this.sfxGain) return;
      const noteTime = t + idx * 0.05;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, noteTime);
      gain.gain.setValueAtTime(0.2, noteTime);
      gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.18);
      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(noteTime);
      osc.stop(noteTime + 0.2);
    });
  }

  public playBuddyBoost() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(180, t);
    osc.frequency.exponentialRampToValueAtTime(750, t + 0.25);

    gain.gain.setValueAtTime(0.35, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.3);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.32);
    this.playNoise(0.2, 0.2, 800, 3000);
  }

  public playDecoyMusic() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    const notes = [440, 554.37, 659.25, 880];
    notes.forEach((f, i) => {
      if (!this.ctx || !this.sfxGain) return;
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(f, t + i * 0.1);
      g.gain.setValueAtTime(0.12, t + i * 0.1);
      g.gain.exponentialRampToValueAtTime(0.001, t + i * 0.1 + 0.08);
      osc.connect(g);
      g.connect(this.sfxGain);
      osc.start(t + i * 0.1);
      osc.stop(t + i * 0.1 + 0.1);
    });
  }

  // --- Sound Effects ---

  public playFootstep(surface: 'grass' | 'asphalt' = 'asphalt') {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    if (surface === 'grass') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(120 + Math.random() * 30, t);
      osc.frequency.exponentialRampToValueAtTime(40, t + 0.08);
      gain.gain.setValueAtTime(0.08, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
    } else {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(160 + Math.random() * 40, t);
      osc.frequency.exponentialRampToValueAtTime(60, t + 0.06);
      gain.gain.setValueAtTime(0.12, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);
    }

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.09);
  }

  public playWhoosh() {
    this.playNoise(0.12, 0.25, 400, 1800);
  }

  public playSprayCanShake() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;
    const t = this.ctx.currentTime;
    // Fast clatter of mixing marble
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(800, t);
    osc.frequency.setValueAtTime(1400, t + 0.04);
    gain.gain.setValueAtTime(0.15, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.09);
  }

  public playSprayPaint() {
    if (this.isMuted) return;
    this.initContext();
    // Hissing aerosol spray sound
    this.playNoise(0.15, 0.3, 1400, 7000);
  }

  public playLookoutWhistle() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1800, t);
    osc.frequency.linearRampToValueAtTime(2400, t + 0.08);
    osc.frequency.setValueAtTime(2100, t + 0.12);
    osc.frequency.linearRampToValueAtTime(2700, t + 0.2);
    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.24);
    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.26);
  }

  public playKick() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    // Punchy low impact
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(260, t);
    osc.frequency.exponentialRampToValueAtTime(45, t + 0.16);

    gain.gain.setValueAtTime(0.45, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.18);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.2);

    // Subtle whoosh noise
    this.playNoise(0.1, 0.2, 400, 1200);
  }

  public playTrashCrash() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;

    // Metallic ring 1
    const osc1 = this.ctx.createOscillator();
    const gain1 = this.ctx.createGain();
    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(540, t);
    osc1.frequency.exponentialRampToValueAtTime(180, t + 0.4);
    gain1.gain.setValueAtTime(0.3, t);
    gain1.gain.exponentialRampToValueAtTime(0.01, t + 0.4);
    osc1.connect(gain1);
    gain1.connect(this.sfxGain);
    osc1.start(t);
    osc1.stop(t + 0.42);

    // Metallic ring 2
    const osc2 = this.ctx.createOscillator();
    const gain2 = this.ctx.createGain();
    osc2.type = 'square';
    osc2.frequency.setValueAtTime(780, t);
    osc2.frequency.exponentialRampToValueAtTime(220, t + 0.35);
    gain2.gain.setValueAtTime(0.2, t);
    gain2.gain.exponentialRampToValueAtTime(0.01, t + 0.35);
    osc2.connect(gain2);
    gain2.connect(this.sfxGain);
    osc2.start(t);
    osc2.stop(t + 0.38);

    // Debris noise burst
    this.playNoise(0.35, 0.45, 1200, 4500);

    // Second bounce rattle
    setTimeout(() => {
      if (!this.ctx || !this.sfxGain || this.isMuted) return;
      const t2 = this.ctx.currentTime;
      const oscB = this.ctx.createOscillator();
      const gainB = this.ctx.createGain();
      oscB.type = 'sawtooth';
      oscB.frequency.setValueAtTime(420, t2);
      oscB.frequency.exponentialRampToValueAtTime(140, t2 + 0.2);
      gainB.gain.setValueAtTime(0.18, t2);
      gainB.gain.exponentialRampToValueAtTime(0.01, t2 + 0.2);
      oscB.connect(gainB);
      gainB.connect(this.sfxGain);
      oscB.start(t2);
      oscB.stop(t2 + 0.22);
    }, 140);
  }

  public playDoorbell() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;

    // Ding (E5 ~ 659.25 Hz)
    const ding = this.ctx.createOscillator();
    const dingGain = this.ctx.createGain();
    ding.type = 'sine';
    ding.frequency.setValueAtTime(659.25, t);
    dingGain.gain.setValueAtTime(0.4, t);
    dingGain.gain.exponentialRampToValueAtTime(0.001, t + 0.6);
    ding.connect(dingGain);
    dingGain.connect(this.sfxGain);
    ding.start(t);
    ding.stop(t + 0.65);

    // Dong (C5 ~ 523.25 Hz) after 280ms
    const dong = this.ctx.createOscillator();
    const dongGain = this.ctx.createGain();
    dong.type = 'sine';
    dong.frequency.setValueAtTime(523.25, t + 0.28);
    dongGain.gain.setValueAtTime(0.001, t);
    dongGain.gain.setValueAtTime(0.42, t + 0.28);
    dongGain.gain.exponentialRampToValueAtTime(0.001, t + 0.95);
    dong.connect(dongGain);
    dongGain.connect(this.sfxGain);
    dong.start(t + 0.28);
    dong.stop(t + 1.0);
  }

  public playCarAlarm() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    // Rapid alternating 2-tone honk
    osc.frequency.setValueAtTime(880, t);
    osc.frequency.setValueAtTime(660, t + 0.12);
    osc.frequency.setValueAtTime(880, t + 0.24);
    osc.frequency.setValueAtTime(660, t + 0.36);

    gain.gain.setValueAtTime(0.35, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.48);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.5);
  }

  public playSprinkler() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    // Hissing high-pass water spray
    this.playNoise(0.2, 0.25, 2500, 8000);

    // Mechanical ratchet click
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(1400, t);
    osc.frequency.exponentialRampToValueAtTime(300, t + 0.04);
    gain.gain.setValueAtTime(0.18, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.05);
    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.06);
  }

  public playFlamingoFlung() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    // Comical upward slide then funny rubber bird squeak
    osc.type = 'sine';
    osc.frequency.setValueAtTime(320, t);
    osc.frequency.exponentialRampToValueAtTime(980, t + 0.18);
    osc.frequency.exponentialRampToValueAtTime(450, t + 0.35);

    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.38);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.4);
  }

  public playHighFive() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;

    // Crisp high-velocity slap
    this.playNoise(0.08, 0.3, 1000, 5000);

    // Cheerful upward sparkle arpeggio
    const freqs = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    freqs.forEach((freq, idx) => {
      if (!this.ctx || !this.sfxGain) return;
      const noteTime = t + idx * 0.05;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, noteTime);
      gain.gain.setValueAtTime(0.22, noteTime);
      gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.25);
      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(noteTime);
      osc.stop(noteTime + 0.28);
    });
  }

  public playWhistle() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    // Fast police whistle tremolo
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(2450, t);

    // LFO for flutter
    const lfo = this.ctx.createOscillator();
    const lfoGain = this.ctx.createGain();
    lfo.frequency.setValueAtTime(22, t);
    lfoGain.gain.setValueAtTime(250, t);
    lfo.connect(osc.frequency);

    gain.gain.setValueAtTime(0.25, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.3);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    lfo.start(t);
    osc.start(t);
    lfo.stop(t + 0.32);
    osc.stop(t + 0.32);
  }

  public playGrumble() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(140, t);
    osc.frequency.linearRampToValueAtTime(80, t + 0.25);
    osc.frequency.linearRampToValueAtTime(120, t + 0.4);

    gain.gain.setValueAtTime(0.28, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.45);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.48);
  }

  public playLeafRustle() {
    this.playNoise(0.25, 0.2, 800, 3200);
  }

  public playTpRoll() {
    this.playNoise(0.18, 0.15, 600, 2400);
    if (!this.ctx || !this.sfxGain) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, t);
    osc.frequency.exponentialRampToValueAtTime(150, t + 0.2);
    gain.gain.setValueAtTime(0.15, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.22);
    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.24);
  }

  public playBusted() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    // Sad comical trombone slide
    const notes = [
      { f: 330, duration: 0.28 },
      { f: 311, duration: 0.28 },
      { f: 293, duration: 0.28 },
      { f: 277, duration: 0.8 },
    ];

    let offset = 0;
    notes.forEach((n) => {
      if (!this.ctx || !this.sfxGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(n.f, t + offset);
      if (offset >= 0.8) {
        osc.frequency.linearRampToValueAtTime(n.f - 30, t + offset + n.duration);
      }
      gain.gain.setValueAtTime(0.3, t + offset);
      gain.gain.exponentialRampToValueAtTime(0.01, t + offset + n.duration);
      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(t + offset);
      osc.stop(t + offset + n.duration + 0.05);
      offset += n.duration * 0.9;
    });
  }

  public playVictory() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    // Triumphant playful brass fanfares
    const notes = [
      { f: 392.0, d: 0.15 }, // G4
      { f: 523.25, d: 0.15 }, // C5
      { f: 659.25, d: 0.15 }, // E5
      { f: 783.99, d: 0.35 }, // G5
      { f: 659.25, d: 0.15 }, // E5
      { f: 783.99, d: 0.6 },  // G5 long
    ];

    let offset = 0;
    notes.forEach((n) => {
      if (!this.ctx || !this.sfxGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(n.f, t + offset);
      gain.gain.setValueAtTime(0.35, t + offset);
      gain.gain.exponentialRampToValueAtTime(0.01, t + offset + n.d);
      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(t + offset);
      osc.stop(t + offset + n.d + 0.05);
      offset += n.d * 0.95;
    });
  }

  // --- Helper: Synthesized filtered noise ---
  private playNoise(duration: number, volume: number, hpFreq: number, lpFreq: number) {
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    const t = this.ctx.currentTime;

    const bufferSize = this.ctx.sampleRate * duration;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = buffer;

    const hp = this.ctx.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.setValueAtTime(hpFreq, t);

    const lp = this.ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.setValueAtTime(lpFreq, t);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(volume, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + duration);

    whiteNoise.connect(hp);
    hp.connect(lp);
    lp.connect(gain);
    gain.connect(this.sfxGain);

    whiteNoise.start(t);
  }

  // --- Dynamic Procedural Music Loop ---
  public startMusic() {
    if (this.isMusicPlaying) return;
    this.initContext();
    this.isMusicPlaying = true;
    this.musicStep = 0;

    const bassLine = [
      110, 0, 110, 130.81, 146.83, 0, 146.83, 164.81, // A2 -> C3 -> D3 -> E3
      174.61, 0, 164.81, 146.83, 130.81, 110, 98.0, 103.83, // F3 -> E3 -> D3 -> C3 -> A2
    ];

    const chordTones = [
      [220, 261.63, 329.63], // Am
      [261.63, 329.63, 392.0], // C
      [293.66, 349.23, 440.0], // Dm
      [329.63, 392.0, 493.88], // Em
    ];

    const beatInterval = 175; // ~137 BPM mischief walk

    this.musicInterval = window.setInterval(() => {
      if (!this.ctx || !this.musicGain || this.isMuted) return;

      const t = this.ctx.currentTime;
      const step = this.musicStep % 16;
      const bassNote = bassLine[step];

      // Play bass note
      if (bassNote > 0) {
        const bassOsc = this.ctx.createOscillator();
        const bassG = this.ctx.createGain();
        bassOsc.type = this.chaosLevel > 0.5 ? 'sawtooth' : 'triangle';
        bassOsc.frequency.setValueAtTime(bassNote, t);
        bassG.gain.setValueAtTime(0.18 + this.chaosLevel * 0.1, t);
        bassG.gain.exponentialRampToValueAtTime(0.001, t + 0.16);
        bassOsc.connect(bassG);
        bassG.connect(this.musicGain);
        bassOsc.start(t);
        bassOsc.stop(t + 0.18);
      }

      // Play syncopated cheeky chord stab on offbeats (steps 2, 6, 10, 14)
      if (step === 2 || step === 6 || step === 10 || step === 14) {
        const chordIndex = Math.floor(step / 4);
        const chord = chordTones[chordIndex];
        chord.forEach((freq) => {
          if (!this.ctx || !this.musicGain) return;
          const chordOsc = this.ctx.createOscillator();
          const chordG = this.ctx.createGain();
          chordOsc.type = 'triangle';
          chordOsc.frequency.setValueAtTime(freq * (this.chaosLevel > 0.6 ? 2 : 1), t);
          chordG.gain.setValueAtTime(0.07, t);
          chordG.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
          chordOsc.connect(chordG);
          chordG.connect(this.musicGain);
          chordOsc.start(t);
          chordOsc.stop(t + 0.14);
        });
      }

      // Snappy woodblock / hi-hat on every 4th step
      if (step % 4 === 0) {
        const clickOsc = this.ctx.createOscillator();
        const clickG = this.ctx.createGain();
        clickOsc.type = 'sine';
        clickOsc.frequency.setValueAtTime(900, t);
        clickOsc.frequency.exponentialRampToValueAtTime(200, t + 0.04);
        clickG.gain.setValueAtTime(0.06, t);
        clickG.gain.exponentialRampToValueAtTime(0.001, t + 0.04);
        clickOsc.connect(clickG);
        clickG.connect(this.musicGain);
        clickOsc.start(t);
        clickOsc.stop(t + 0.05);
      }

      this.musicStep++;
    }, beatInterval);
  }

  public stopMusic() {
    this.isMusicPlaying = false;
    if (this.musicInterval !== null) {
      clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
  }
}

export const audio = new SoundEngine();
