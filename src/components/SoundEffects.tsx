// Lightweight sound effects using Web Audio API - no external files needed
// Checks global mute state before playing.

let audioCtx: AudioContext | null = null;
let globalMuted = false;

/** Called by SFXProvider to sync mute state */
export const setSFXMuted = (muted: boolean) => { globalMuted = muted; };

const getCtx = () => {
  if (globalMuted) return null;
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (audioCtx.state === "suspended") audioCtx.resume();
  return audioCtx;
};

export const playSuccess = () => {
  try {
    const ctx = getCtx();
    if (!ctx) return;
    const now = ctx.currentTime;
    [523, 659, 784, 1047].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0, now + i * 0.12);
      gain.gain.linearRampToValueAtTime(0.15, now + i * 0.12 + 0.05);
      gain.gain.linearRampToValueAtTime(0, now + i * 0.12 + 0.4);
      osc.connect(gain).connect(ctx.destination);
      osc.start(now + i * 0.12);
      osc.stop(now + i * 0.12 + 0.5);
    });
  } catch {}
};

export const playReveal = () => {
  try {
    const ctx = getCtx();
    if (!ctx) return;
    const now = ctx.currentTime;
    [880, 1100, 1320].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.linearRampToValueAtTime(freq * 1.02, now + 0.6);
      gain.gain.setValueAtTime(0, now + i * 0.08);
      gain.gain.linearRampToValueAtTime(0.08, now + i * 0.08 + 0.1);
      gain.gain.linearRampToValueAtTime(0, now + 0.8);
      osc.connect(gain).connect(ctx.destination);
      osc.start(now + i * 0.08);
      osc.stop(now + 1);
    });
  } catch {}
};

export const playError = () => {
  try {
    const ctx = getCtx();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "square";
    osc.frequency.setValueAtTime(200, now);
    osc.frequency.linearRampToValueAtTime(150, now + 0.3);
    gain.gain.setValueAtTime(0.06, now);
    gain.gain.linearRampToValueAtTime(0, now + 0.3);
    osc.connect(gain).connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.35);
  } catch {}
};

export const playClick = () => {
  try {
    const ctx = getCtx();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = 600;
    gain.gain.setValueAtTime(0.08, now);
    gain.gain.linearRampToValueAtTime(0, now + 0.08);
    osc.connect(gain).connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.1);
  } catch {}
};

export const playComplete = () => {
  try {
    const ctx = getCtx();
    if (!ctx) return;
    const now = ctx.currentTime;
    [523, 659, 784, 1047, 784, 1047, 1318].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = i < 4 ? "sine" : "triangle";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0, now + i * 0.15);
      gain.gain.linearRampToValueAtTime(0.12, now + i * 0.15 + 0.05);
      gain.gain.linearRampToValueAtTime(i === 6 ? 0.08 : 0, now + i * 0.15 + (i === 6 ? 1.2 : 0.5));
      if (i === 6) gain.gain.linearRampToValueAtTime(0, now + i * 0.15 + 1.5);
      osc.connect(gain).connect(ctx.destination);
      osc.start(now + i * 0.15);
      osc.stop(now + i * 0.15 + 1.6);
    });
  } catch {}
};
