import { useState, useEffect, useRef, useCallback } from "react";

/**
 * Ambient nature-inspired mystery music using Web Audio API.
 * Layers: deep earth drone, wind pad, bird-like shimmer, water ripple, mystery melody fragments.
 * All procedural — no external files.
 */
const MusicPlayer = () => {
  const [muted, setMuted] = useState(true);
  const ctxRef = useRef<{
    ctx: AudioContext;
    masterGain: GainNode;
    cleanup: () => void;
  } | null>(null);

  const buildAmbient = useCallback(() => {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const masterGain = ctx.createGain();
    masterGain.gain.value = 0;

    // Reverb via convolver (synthetic impulse)
    const convolver = ctx.createConvolver();
    const sampleRate = ctx.sampleRate;
    const reverbLen = sampleRate * 2.5;
    const impulse = ctx.createBuffer(2, reverbLen, sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const data = impulse.getChannelData(ch);
      for (let i = 0; i < reverbLen; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / reverbLen, 2.2);
      }
    }
    convolver.buffer = impulse;

    // Wet/dry mix
    const dryGain = ctx.createGain();
    dryGain.gain.value = 0.6;
    const wetGain = ctx.createGain();
    wetGain.gain.value = 0.4;
    masterGain.connect(dryGain).connect(ctx.destination);
    masterGain.connect(convolver).connect(wetGain).connect(ctx.destination);

    const nodes: OscillatorNode[] = [];
    const intervals: number[] = [];

    // ── Layer 1: Earth drone (very low, warm) ──
    const drone = ctx.createOscillator();
    drone.type = "sine";
    drone.frequency.value = 65; // C2
    const droneGain = ctx.createGain();
    droneGain.gain.value = 0.09;
    const droneFilter = ctx.createBiquadFilter();
    droneFilter.type = "lowpass";
    droneFilter.frequency.value = 200;
    drone.connect(droneFilter).connect(droneGain).connect(masterGain);
    drone.start();
    nodes.push(drone);

    // Drone breath LFO
    const droneLfo = ctx.createOscillator();
    droneLfo.type = "sine";
    droneLfo.frequency.value = 0.08; // very slow
    const droneLfoGain = ctx.createGain();
    droneLfoGain.gain.value = 0.03;
    droneLfo.connect(droneLfoGain).connect(droneGain.gain);
    droneLfo.start();
    nodes.push(droneLfo);

    // ── Layer 2: Wind pad (airy filtered noise) ──
    const windBufferLen = sampleRate * 4;
    const windBuffer = ctx.createBuffer(1, windBufferLen, sampleRate);
    const windData = windBuffer.getChannelData(0);
    for (let i = 0; i < windBufferLen; i++) {
      windData[i] = Math.random() * 2 - 1;
    }
    const windSrc = ctx.createBufferSource();
    windSrc.buffer = windBuffer;
    windSrc.loop = true;
    const windFilter = ctx.createBiquadFilter();
    windFilter.type = "bandpass";
    windFilter.frequency.value = 600;
    windFilter.Q.value = 0.4;
    const windGain = ctx.createGain();
    windGain.gain.value = 0.025;
    windSrc.connect(windFilter).connect(windGain).connect(masterGain);
    windSrc.start();

    // Wind movement LFO
    const windLfo = ctx.createOscillator();
    windLfo.type = "sine";
    windLfo.frequency.value = 0.12;
    const windLfoGain = ctx.createGain();
    windLfoGain.gain.value = 300;
    windLfo.connect(windLfoGain).connect(windFilter.frequency);
    windLfo.start();
    nodes.push(windLfo);

    // ── Layer 3: Harmonic pad (mystery fifths) ──
    const padNotes = [130.81, 196, 261.63]; // C3, G3, C4 — open fifth
    padNotes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.value = freq;
      const g = ctx.createGain();
      g.gain.value = 0.025 - i * 0.006;
      // Gentle detuning for warmth
      const detuneLfo = ctx.createOscillator();
      detuneLfo.type = "sine";
      detuneLfo.frequency.value = 0.05 + i * 0.03;
      const detuneGain = ctx.createGain();
      detuneGain.gain.value = 2 + i;
      detuneLfo.connect(detuneGain).connect(osc.frequency);
      detuneLfo.start();
      osc.connect(g).connect(masterGain);
      osc.start();
      nodes.push(osc, detuneLfo);
    });

    // ── Layer 4: Bird shimmer (sporadic high notes like distant bird calls) ──
    const birdNotes = [1318, 1568, 1760, 2093, 1396, 1175]; // high register
    const playBirdNote = () => {
      if (ctx.state === "closed") return;
      const freq = birdNotes[Math.floor(Math.random() * birdNotes.length)];
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.linearRampToValueAtTime(freq * (0.97 + Math.random() * 0.06), now + 0.8);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, now);
      g.gain.linearRampToValueAtTime(0.02 + Math.random() * 0.015, now + 0.15);
      g.gain.linearRampToValueAtTime(0, now + 0.6 + Math.random() * 0.5);
      const filter = ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.value = freq;
      filter.Q.value = 8;
      osc.connect(filter).connect(g).connect(masterGain);
      osc.start(now);
      osc.stop(now + 1.2);
    };

    // Random bird calls every 2-6 seconds
    const scheduleBird = () => {
      const delay = 2000 + Math.random() * 4000;
      const id = window.setTimeout(() => {
        playBirdNote();
        // Sometimes play a second note as a "reply"
        if (Math.random() > 0.5) {
          window.setTimeout(playBirdNote, 200 + Math.random() * 400);
        }
        scheduleBird();
      }, delay);
      intervals.push(id);
    };
    scheduleBird();

    // ── Layer 5: Water ripple (gentle plucks) ──
    const playRipple = () => {
      if (ctx.state === "closed") return;
      const now = ctx.currentTime;
      const freq = 400 + Math.random() * 300;
      const osc = ctx.createOscillator();
      osc.type = "triangle";
      osc.frequency.value = freq;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, now);
      g.gain.linearRampToValueAtTime(0.012, now + 0.02);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
      osc.connect(g).connect(masterGain);
      osc.start(now);
      osc.stop(now + 1);
    };

    const scheduleRipple = () => {
      const delay = 3000 + Math.random() * 5000;
      const id = window.setTimeout(() => {
        playRipple();
        scheduleRipple();
      }, delay);
      intervals.push(id);
    };
    scheduleRipple();

    // ── Layer 6: Mystery melody fragments (pentatonic, rare) ──
    const pentatonic = [261.63, 293.66, 329.63, 392, 440]; // C D E G A
    const playMelodyFragment = () => {
      if (ctx.state === "closed") return;
      const now = ctx.currentTime;
      const noteCount = 2 + Math.floor(Math.random() * 3);
      for (let i = 0; i < noteCount; i++) {
        const freq = pentatonic[Math.floor(Math.random() * pentatonic.length)];
        const osc = ctx.createOscillator();
        osc.type = "sine";
        osc.frequency.value = freq;
        const g = ctx.createGain();
        const t = now + i * 0.5;
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(0.018, t + 0.08);
        g.gain.linearRampToValueAtTime(0, t + 0.45);
        osc.connect(g).connect(masterGain);
        osc.start(t);
        osc.stop(t + 0.5);
      }
    };

    const scheduleMelody = () => {
      const delay = 8000 + Math.random() * 12000;
      const id = window.setTimeout(() => {
        playMelodyFragment();
        scheduleMelody();
      }, delay);
      intervals.push(id);
    };
    scheduleMelody();

    const cleanup = () => {
      intervals.forEach(clearTimeout);
      nodes.forEach((n) => { try { n.stop(); } catch {} });
      try { windSrc.stop(); } catch {}
      ctx.close();
    };

    return { ctx, masterGain, cleanup };
  }, []);

  useEffect(() => {
    const ref = buildAmbient();
    ctxRef.current = ref;
    return () => ref.cleanup();
  }, [buildAmbient]);

  useEffect(() => {
    const ref = ctxRef.current;
    if (!ref) return;
    if (ref.ctx.state === "suspended") ref.ctx.resume();
    const now = ref.ctx.currentTime;
    ref.masterGain.gain.cancelScheduledValues(now);
    ref.masterGain.gain.setValueAtTime(ref.masterGain.gain.value, now);
    ref.masterGain.gain.linearRampToValueAtTime(muted ? 0 : 0.7, now + 0.8);
  }, [muted]);

  return (
    <button
      onClick={() => setMuted(!muted)}
      className="fixed top-4 left-4 z-50 w-12 h-12 rounded-full glass-card flex items-center justify-center text-lg hover:scale-110 transition-all duration-300 border border-border/30"
      title={muted ? "הפעל מוזיקה" : "השתק"}
    >
      <span className={`transition-transform duration-300 ${muted ? "" : "animate-pulse"}`}>
        {muted ? "🔇" : "🎵"}
      </span>
    </button>
  );
};

export default MusicPlayer;
