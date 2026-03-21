/**
 * Global audio unlock utility.
 * Mobile browsers (iOS Safari, Android Chrome) block audio autoplay.
 *
 * Strategy: on the very first user gesture we play a silent audio through a
 * singleton HTMLAudioElement.  That same element is then reused for all Cloud
 * TTS playback — because iOS only allows programmatic play on an element that
 * has already been played inside a gesture.
 */

const SILENT_WAV =
  "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAESsAACJWAAACABAAZGF0YQAAAAA=";

let _unlocked = false;
let _sharedAudio: HTMLAudioElement | null = null;

/** Return (and lazily create) the singleton audio element. */
export const getSharedAudio = (): HTMLAudioElement => {
  if (!_sharedAudio) _sharedAudio = new Audio();
  return _sharedAudio;
};

/**
 * Call this inside any user-gesture handler (click / touchend).
 * After the first call the shared audio element is unlocked and can play
 * programmatically at any time during the session.
 */
export const unlockAudioOnGesture = () => {
  if (_unlocked) return;
  _unlocked = true;

  // Unlock HTMLMediaElement via the shared singleton
  try {
    const audio = getSharedAudio();
    audio.muted = true;
    audio.src = SILENT_WAV;
    audio.play()
      .then(() => {
        // Only clean up the silent WAV if nothing else has taken over the
        // element yet (e.g. playWav() may have already set a new src).
        if (audio.src === SILENT_WAV) {
          audio.pause();
          audio.removeAttribute("src");
          audio.load();
        }
        audio.muted = false;
      })
      .catch(() => {});
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
