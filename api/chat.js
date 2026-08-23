export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  try {

    const {
      message,
      history = [],
      systemInstruction
    } = req.body || {};

    if (!message) {
      return res.status(400).json({
        error: "Message is required"
      });
    }

    const contents = [
      ...history,
      {
        role: "user",
        parts: [
          {
            text: message
          }
        ]
      }
    ];

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": process.env.GEMINI_API_KEY
        },

        body: JSON.stringify({

          systemInstruction: {
            parts: [
              {
                text:
                  systemInstruction ||
                  `You are VYRA, an intelligent personal AI assistant.
Address the user as "Boss".
Be helpful, concise, natural and friendly.
You can communicate in Hindi, English or Hinglish depending on the user's language.
Do not mention internal API details unless asked.`
              }
            ]
          },

          contents: contents

        })
      }
    );

    const data = await response.json();

    console.log(
      "VYRA GEMINI RESPONSE:",
      data
    );

    if (!response.ok) {

      console.error(
        "Gemini API error:",
        data
      );

      return res.status(response.status).json({
        error:
          data?.error?.message ||
          "Gemini API request failed"
      });

    }

    const reply =
  data?.candidates?.[0]?.content?.parts
    ?.map(part => part?.text || "")
    .join("")
    .trim();

if (!reply) {

  console.error(
    "Gemini returned no text:",
    JSON.stringify(data, null, 2)
  );

  return res.status(500).json({
    error:
      data?.promptFeedback?.blockReason ||
      data?.candidates?.[0]?.finishReason ||
      "Gemini returned no text response.",
    debug: data
  });

}

return res.status(200).json({
  reply: reply
});

  } catch (error) {

    console.error(
      "VYRA BACKEND ERROR:",
      error
    );

    return res.status(500).json({
      error:
        error?.message ||
        "Internal server error"
    });

  }

    }
