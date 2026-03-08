import { useState, useEffect, useRef } from "react";

const MusicPlayer = () => {
  const [muted, setMuted] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Create ambient mystery music using Web Audio API
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const gainNode = ctx.createGain();
    gainNode.gain.value = 0;
    gainNode.connect(ctx.destination);

    const playAmbient = () => {
      // Pad 1 - deep drone
      const osc1 = ctx.createOscillator();
      osc1.type = "sine";
      osc1.frequency.value = 110;
      const g1 = ctx.createGain();
      g1.gain.value = 0.12;
      osc1.connect(g1).connect(gainNode);
      osc1.start();

      // Pad 2 - mystery fifth
      const osc2 = ctx.createOscillator();
      osc2.type = "sine";
      osc2.frequency.value = 165;
      const g2 = ctx.createGain();
      g2.gain.value = 0.07;
      osc2.connect(g2).connect(gainNode);
      osc2.start();

      // Pad 3 - shimmer
      const osc3 = ctx.createOscillator();
      osc3.type = "triangle";
      osc3.frequency.value = 330;
      const g3 = ctx.createGain();
      g3.gain.value = 0.03;
      osc3.connect(g3).connect(gainNode);
      osc3.start();

      // Slow LFO for movement
      const lfo = ctx.createOscillator();
      lfo.type = "sine";
      lfo.frequency.value = 0.15;
      const lfoGain = ctx.createGain();
      lfoGain.gain.value = 8;
      lfo.connect(lfoGain).connect(osc2.frequency);
      lfo.start();

      return () => {
        osc1.stop();
        osc2.stop();
        osc3.stop();
        lfo.stop();
      };
    };

    const stop = playAmbient();
    audioRef.current = { ctx, gainNode, stop } as any;

    return () => {
      stop();
      ctx.close();
    };
  }, []);

  useEffect(() => {
    const ref = audioRef.current as any;
    if (!ref) return;
    const { ctx, gainNode } = ref;
    if (ctx.state === "suspended") ctx.resume();
    gainNode.gain.linearRampToValueAtTime(muted ? 0 : 0.6, ref.ctx.currentTime + 0.5);
  }, [muted]);

  return (
    <button
      onClick={() => setMuted(!muted)}
      className="fixed top-4 left-4 z-50 w-11 h-11 rounded-full glass-card flex items-center justify-center text-lg hover:scale-110 transition-transform"
      title={muted ? "הפעל מוזיקה" : "השתק"}
    >
      {muted ? "🔇" : "🎵"}
    </button>
  );
};

export default MusicPlayer;
