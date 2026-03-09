import { useCallback, useEffect, useRef, useState } from "react";

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
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const objectUrlRef = useRef<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const cleanupAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
      audioRef.current = null;
    }

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

    cleanupAudio();
    setIsSpeaking(false);
  }, [cleanupAudio, ttsSupported]);

  const speakWithBrowser = useCallback((voices?: SpeechSynthesisVoice[]) => {
    if (!ttsSupported) return;

    window.speechSynthesis.cancel();

    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = "he-IL";
    utter.rate = 0.9;
    utter.pitch = 1;

    const availableVoices = voices || window.speechSynthesis.getVoices();
    const heVoice =
      availableVoices.find((v) => v.lang.startsWith("he")) ||
      availableVoices.find((v) => v.lang.startsWith("ar")) ||
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

    stopSpeaking();

    if (cloudSupported) {
      try {
        const controller = new AbortController();
        abortControllerRef.current = controller;

        const audioBlob = await fetchCloudTtsAudio(text, controller.signal);
        if (controller.signal.aborted) return;

        const objectUrl = URL.createObjectURL(audioBlob);
        objectUrlRef.current = objectUrl;

        const audio = new Audio(objectUrl);
        audioRef.current = audio;

        audio.onplay = () => setIsSpeaking(true);
        audio.onended = () => {
          cleanupAudio();
          setIsSpeaking(false);
        };
        audio.onerror = () => {
          cleanupAudio();
          setIsSpeaking(false);
        };

        await audio.play();
        return;
      } catch (error) {
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
      }, 300);
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
