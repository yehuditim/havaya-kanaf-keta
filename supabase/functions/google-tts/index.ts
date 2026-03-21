import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const decodeBase64 = (base64: string) => {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);

  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }

  return bytes;
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const GOOGLE_CLOUD_TTS_API_KEY = Deno.env.get("GOOGLE_CLOUD_TTS_API_KEY");
    if (!GOOGLE_CLOUD_TTS_API_KEY) {
      throw new Error("GOOGLE_CLOUD_TTS_API_KEY is not configured");
    }

    const { text } = await req.json();

    if (!text || typeof text !== "string") {
      return new Response(JSON.stringify({ error: "text is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const trimmedText = text.trim();
    if (!trimmedText) {
      return new Response(JSON.stringify({ error: "text must not be empty" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Clean Hebrew text for better TTS pronunciation
    const cleanedText = trimmedText
      .replace(/ק״מ/g, "קילומטר")
      .replace(/אתב״ש/g, "אתבש")
      .replace(/[״׳]/g, "")
      .replace(/—/g, ", ");

    const response = await fetch(
      `https://texttospeech.googleapis.com/v1/text:synthesize?key=${GOOGLE_CLOUD_TTS_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          input: { text: cleanedText },
          voice: {
            languageCode: "he-IL",
            name: "he-IL-Neural2-C",
          },
          audioConfig: {
            audioEncoding: "MP3",
            speakingRate: 0.9,
            pitch: 0,
          },
        }),
      },
    );

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Google TTS failed [${response.status}]: ${errorBody}`);
    }

    const data = await response.json();

    if (!data.audioContent) {
      throw new Error("Google TTS returned no audioContent");
    }

    const audioBytes = decodeBase64(data.audioContent);

    return new Response(audioBytes, {
      headers: {
        ...corsHeaders,
        "Content-Type": "audio/mpeg",
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("google-tts error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";

    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
