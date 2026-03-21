/**
 * Global audio unlock utility.
 * Mobile browsers (iOS Safari, Android Chrome) block audio autoplay.
 * Calling this inside a user-gesture handler primes both HTMLMediaElement
 * and SpeechSynthesis so subsequent programmatic calls succeed.
 */

const SILENT_WAV =
  "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAESsAACJWAAACABAAZGF0YQAAAAA=";

let _unlocked = false;

export const unlockAudioOnGesture = () => {
  if (_unlocked) return;
  _unlocked = true;

  // Unlock HTMLMediaElement (used by cloud TTS)
  try {
    const audio = new Audio();
    audio.src = SILENT_WAV;
    audio.play().catch(() => {});
  } catch {}

  // Unlock SpeechSynthesis (used by browser TTS fallback)
  try {
    if ("speechSynthesis" in window) {
      const utt = new SpeechSynthesisUtterance("");
      window.speechSynthesis.speak(utt);
      window.speechSynthesis.cancel();
    }
  } catch {}
};
