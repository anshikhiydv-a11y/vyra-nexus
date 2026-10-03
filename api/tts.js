export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  try {
    const apiKey = process.env.ELEVENLABS_API_KEY;

    if (!apiKey) {
      console.error("AV TTS → ELEVENLABS_API_KEY missing");

      return res.status(500).json({
        error: "ElevenLabs API key is not configured."
      });
    }

    const { text } = req.body || {};

    if (!text || !String(text).trim()) {
      return res.status(400).json({
        error: "Text is required."
      });
    }

    const voiceId = "mSYK1wXyDo9la60dBOyK";

    const cleanText = String(text)
      .replace(/```[\s\S]*?```/g, "")
      .replace(/<br\s*\/?>/gi, " ")
      .replace(/<[^>]*>/g, "")
      .replace(/\*\*/g, "")
      .replace(/\*/g, "")
      .replace(/#{1,6}\s/g, "")
      .replace(/\s+/g, " ")
      .trim();

    if (!cleanText) {
      return res.status(400).json({
        error: "No usable text found."
      });
    }

    const elevenResponse = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`,
      {
        method: "POST",
        headers: {
          "xi-api-key": apiKey,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          text: cleanText,
          model_id: "eleven_multilingual_v2",
          voice_settings: {
            stability: 0.45,
            similarity_boost: 0.80,
            style: 0.25,
            use_speaker_boost: true,
            speed: 1.0
          }
        })
      }
    );

    if (!elevenResponse.ok) {
      const errorText = await elevenResponse.text();

      console.error(
        "AV TTS → ElevenLabs Error:",
        elevenResponse.status,
        errorText
      );

      return res.status(elevenResponse.status).json({
        error: "ElevenLabs voice generation failed."
      });
    }

    const audioBuffer = Buffer.from(
      await elevenResponse.arrayBuffer()
    );

    res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader("Cache-Control", "no-store");

    return res.status(200).send(audioBuffer);

  } catch (error) {
    console.error("AV TTS SERVER ERROR:", error);

    return res.status(500).json({
      error: "AV voice service encountered an error."
    });
  }
  }
