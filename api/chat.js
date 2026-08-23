export default async function handler(req, res) {

  console.log("VYRA API CHAT → METHOD:", req.method);

  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed",
      method: req.method
    });
  }

  try {

    const { message } = req.body || {};

    console.log(
      "VYRA API CHAT → MESSAGE:",
      message
    );

    if (!message) {
      return res.status(400).json({
        error: "Message is required"
      });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    console.log(
      "VYRA API CHAT → API KEY:",
      apiKey ? "FOUND" : "MISSING"
    );

    if (!apiKey) {
      return res.status(500).json({
        error: "GEMINI_API_KEY is missing"
      });
    }

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.7-flash:generateContent",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey
        },

        body: JSON.stringify({

          systemInstruction: {
            parts: [
              {
                text:
                  'You are VYRA, a helpful personal AI assistant. Address the user as "Boss". Reply naturally in Hindi, English or Hinglish.'
              }
            ]
          },

          contents: [
            {
              role: "user",
              parts: [
                {
                  text: message
                }
              ]
            }
          ]

        })
      }
    );

    const data = await response.json();

    console.log(
      "VYRA GEMINI STATUS:",
      response.status
    );

    console.log(
      "VYRA GEMINI DATA:",
      JSON.stringify(data)
    );

    if (!response.ok) {

      return res.status(response.status).json({
        error:
          data?.error?.message ||
          "Gemini API request failed",

        geminiStatus:
          response.status
      });

    }

    const reply =
      data?.candidates?.[0]?.content?.parts
        ?.map(part => part.text || "")
        .join("")
        .trim();

    if (!reply) {

      return res.status(500).json({
        error: "Gemini returned no text",
        debug: data
      });

    }

    return res.status(200).json({
      reply
    });

  } catch (error) {

    console.error(
      "VYRA API CHAT ERROR:",
      error
    );

    return res.status(500).json({
      error:
        error?.message ||
        "Internal server error"
    });

  }

      }
