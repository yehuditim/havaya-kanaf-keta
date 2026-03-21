import { useCallback, useEffect, useRef, useState } from "react";
import { unlockAudioOnGesture, getSharedAudio } from "../lib/audioUnlock";

/** Strip Hebrew nikud (vowel points) so browser TTS engines that don't support
 *  them don't mispronounce or garble the text. */
const stripNikud = (text: string): string =>
  text.replace(/[\u05B0-\u05C7\uFB1D-\uFB4E]/g, "");

const CLOUD_TTS_URL = import.meta.env.VITE_SUPABASE_URL
  ? `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/google-tts`
  : null;

const fetchCloudTtsAudio = async (text: string, signal: AbortSignal) => {
  const publishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

  if (!CLOUD_TTS_URL || !publishableKey) {
    throw new Error("Cloud TTS is not configured on this project");
  }

  const response = await fetch(CLOUD_TTS_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: publishableKey,
      Authorization: `Bearer ${publishableKey}`,
    },
    body: JSON.stringify({ text }),
    signal,
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`Cloud TTS failed [${response.status}]: ${message}`);
  }

  return response.blob();
};

export const useHebrewNarration = (text: string) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const ttsSupported = typeof window !== "undefined" && "speechSynthesis" in window;
  const cloudSupported = Boolean(CLOUD_TTS_URL && import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY);
  const canSpeak = ttsSupported || cloudSupported;

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const objectUrlRef = useRef<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const cleanupAudio = useCallback(() => {
    // Detach event listeners from the shared audio element so they don't fire
    // for future playbacks.
    const audio = getSharedAudio();
    audio.onplay = null;
    audio.onended = null;
    audio.onerror = null;

    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
  }, []);

  const stopSpeaking = useCallback(() => {
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;

    if (ttsSupported) {
      window.speechSynthesis.cancel();
    }

    // Pause the shared audio element without destroying it
    try {
      const audio = getSharedAudio();
      audio.pause();
    } catch {}

    cleanupAudio();
    setIsSpeaking(false);
  }, [cleanupAudio, ttsSupported]);

  const speakWithBrowser = useCallback((voices?: SpeechSynthesisVoice[]) => {
    if (!ttsSupported) return;

    window.speechSynthesis.cancel();

    // Strip nikud so browser TTS engines that don't support vowel points
    // don't garble the pronunciation.
    const cleanText = stripNikud(text);
    const utter = new SpeechSynthesisUtterance(cleanText);
    utter.lang = "he-IL";
    utter.rate = 0.78;
    utter.pitch = 1;

    const availableVoices = voices || window.speechSynthesis.getVoices();
    // Prefer a local (non-network) Hebrew voice for best quality/latency
    const heVoice =
      availableVoices.find((v) => v.lang.startsWith("he") && v.localService) ||
      availableVoices.find((v) => v.lang.startsWith("he")) ||
      null;
    if (heVoice) utter.voice = heVoice;

    utter.onstart = () => setIsSpeaking(true);
    utter.onend = () => setIsSpeaking(false);
    utter.onerror = () => setIsSpeaking(false);

    utteranceRef.current = utter;
    window.speechSynthesis.speak(utter);
  }, [text, ttsSupported]);

  const speak = useCallback(async () => {
    if (!canSpeak) return;

    // Best-effort unlock in case the caller is inside a user gesture
    unlockAudioOnGesture();

    stopSpeaking();

    if (cloudSupported) {
      try {
        const controller = new AbortController();
        abortControllerRef.current = controller;

        // Reuse the singleton audio element that was already unlocked on the
        // first user gesture.  On iOS, a new Audio() created outside a gesture
        // cannot call play() — but reusing the pre-unlocked element works.
        const audio = getSharedAudio();

        const audioBlob = await fetchCloudTtsAudio(text, controller.signal);
        if (controller.signal.aborted) return;

        // Revoke any previous object URL before creating a new one
        if (objectUrlRef.current) {
          URL.revokeObjectURL(objectUrlRef.current);
        }
        const objectUrl = URL.createObjectURL(audioBlob);
        objectUrlRef.current = objectUrl;

        audio.onplay = () => setIsSpeaking(true);
        audio.onended = () => {
          abortControllerRef.current = null;
          cleanupAudio();
          setIsSpeaking(false);
        };
        audio.onerror = () => {
          abortControllerRef.current = null;
          cleanupAudio();
          setIsSpeaking(false);
        };

        audio.src = objectUrl;
        await audio.play();
        return;
      } catch (error) {
        abortControllerRef.current = null;
        cleanupAudio();
        console.warn("Cloud TTS failed, falling back to browser voice", error);
      }
    }

    if (!ttsSupported) {
      setIsSpeaking(false);
      return;
    }

    const voices = window.speechSynthesis.getVoices();
    if (voices.length === 0) {
      const onVoices = () => {
        window.speechSynthesis.removeEventListener("voiceschanged", onVoices);
        speakWithBrowser(window.speechSynthesis.getVoices());
      };

      window.speechSynthesis.addEventListener("voiceschanged", onVoices);

      setTimeout(() => {
        window.speechSynthesis.removeEventListener("voiceschanged", onVoices);
        speakWithBrowser(window.speechSynthesis.getVoices());
      }, 1000);
    } else {
      speakWithBrowser(voices);
    }
  }, [canSpeak, cleanupAudio, cloudSupported, speakWithBrowser, stopSpeaking, text, ttsSupported]);

  useEffect(() => {
    return () => {
      stopSpeaking();
    };
  }, [stopSpeaking]);

  return {
    isSpeaking,
    canSpeak,
    speak,
    stopSpeaking,
  };
};
