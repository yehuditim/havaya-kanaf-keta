import { useState, createContext, useContext } from "react";

/**
 * Global SFX mute toggle. No background music — only short sound effects.
 * SoundEffects.tsx checks this context to decide whether to play.
 */

interface SFXContextValue {
  muted: boolean;
  toggle: () => void;
}

export const SFXContext = createContext<SFXContextValue>({ muted: false, toggle: () => {} });
export const useSFX = () => useContext(SFXContext);

export const SFXProvider = ({ children }: { children: React.ReactNode }) => {
  const [muted, setMuted] = useState(false);
  return (
    <SFXContext.Provider value={{ muted, toggle: () => setMuted(m => !m) }}>
      {children}
    </SFXContext.Provider>
  );
};

const SFXToggle = () => {
  const { muted, toggle } = useSFX();

  return (
    <button
      onClick={toggle}
      className="fixed top-3 left-3 sm:top-4 sm:left-4 z-50 w-10 h-10 sm:w-11 sm:h-11 rounded-full glass-card flex items-center justify-center text-sm sm:text-base hover:scale-110 transition-all duration-300 border border-border/30"
      title={muted ? "הפעל צלילים" : "השתק צלילים"}
    >
      <span className="transition-transform duration-300">
        {muted ? "🔇" : "🔊"}
      </span>
    </button>
  );
};

export default SFXToggle;
