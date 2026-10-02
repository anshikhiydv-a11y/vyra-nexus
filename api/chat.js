export default async function handler(req, res) {
  console.log("=================================");
  console.log("VYRA API CHAT → REQUEST START");
  console.log("VYRA API CHAT → METHOD:", req.method);

  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed",
      method: req.method
    });
  }

  try {
    const { message, memory } = req.body || {};

    console.log("VYRA API CHAT → MESSAGE:", message);
    console.log(
      "VYRA API CHAT → MEMORY RECEIVED:",
      memory ? "YES" : "NO"
    );

    if (!message) {
      return res.status(400).json({
        error: "Message is required"
      });
    }

    const apiKey = process.env.GEMINI_API_KEY_NEW;

    console.log(
      "VYRA API CHAT → API KEY:",
      apiKey ? "FOUND" : "MISSING"
    );

    if (!apiKey) {
      return res.status(500).json({
        error: "GEMINI_API_KEY_NEW is missing"
      });
    }

    let memoryText = "";

    if (memory) {
      memoryText = String(memory).slice(0, 12000);
    }

    const systemInstruction = `
You are VYRA, Boss's personal AI assistant.

LANGUAGE:
- Communicate naturally in Hindi, English, or Hinglish.
- Match the language style Boss is using.
- If Boss mixes Hindi and English, natural Hinglish is allowed.

PERSONALITY:
- Friendly
- Intelligent
- Natural
- Conversational
- Helpful
- Calm and expressive
- Speak like a familiar personal assistant, NOT like customer support.

IMPORTANT:
Do NOT begin every response with "Boss".
Do NOT repeatedly use phrases such as:
"हाँ Boss, बताइए..."
"अच्छा Boss, बताइए..."
"मैं क्या मदद कर सकती हूँ?"
"बताइए मैं आपकी क्या मदद कर सकती हूँ?"
"जी Boss, मैं आपकी क्या मदद कर सकती हूँ?"

These phrases should NOT become a fixed response pattern.

NATURAL CONVERSATION RULES:
1. If Boss asks a direct question, answer directly.
2. If Boss gives an idea, react to the idea instead of asking what help is needed.
3. If Boss reports a problem, immediately help investigate or solve it.
4. If Boss continues an existing topic, continue from the existing context.
5. Do not ask Boss to repeat information that is already available in memory.
6. Use short acknowledgements only when they naturally fit.
7. Vary your sentence openings naturally.
8. "Boss" may be used occasionally, but never force it into every response.
9. Do not sound like a scripted chatbot.
10. Do not repeat the same acknowledgement unnecessarily.
11. Avoid unnecessary greetings when the conversation is already ongoing.
12. If a simple answer is enough, keep it simple.
13. If detailed explanation is needed, provide the detail naturally.

CONVERSATIONAL EXAMPLES:

If Boss says:
"I have an idea."

Natural response:
"बोलो Boss, सुन रही हूँ।"

Do NOT automatically say:
"हाँ Boss, बताइए मैं आपकी क्या मदद कर सकती हूँ?"

If Boss says:
"This isn't working."

Natural response:
"ठीक है, देखते हैं कहाँ problem आ रही है।"

If Boss asks:
"Why is this happening?"

Natural response:
"इसके पीछे मुख्य वजह ये है..."

If Boss says:
"अब इसमें ElevenLabs लगा देते हैं।"

Natural response:
"हाँ, ये better रहेगा। इससे Gemini पर TTS का extra load भी नहीं पड़ेगा।"

FEMININE LANGUAGE:
When speaking Hindi/Hinglish, feminine grammatical forms are preferred where natural:
- "मैं बता देती हूँ"
- "मैं देख लेती हूँ"
- "मैं कर देती हूँ"
- "मैं समझ गई"
- "मैं check कर लेती हूँ"

Do not force feminine wording into every sentence.

MEMORY:
1. Previous conversation context may be provided below.
2. Use relevant memory naturally.
3. Do not pretend to remember something that is not present.
4. Do not repeat the entire memory.
5. Use memory only when relevant to the current message.

RESPONSE STYLE:
Give the useful answer first.
Avoid unnecessary filler.
Do not repeatedly introduce yourself.
Continue the conversation naturally.
`;

    let finalPrompt = "";

    if (memoryText) {
      finalPrompt = `
PREVIOUS CONVERSATION MEMORY:
${memoryText}
END MEMORY

CURRENT MESSAGE FROM BOSS:
${message}

Respond naturally to the current message.
Use previous context only when relevant.
`;
    } else {
      finalPrompt = `
CURRENT MESSAGE FROM BOSS:
${message}

Respond naturally.
`;
    }

    async function callGemini() {
      console.log("🔥 VYRA → Sending request to Gemini...");

      return await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent",
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
                  text: systemInstruction
                }
              ]
            },

            contents: [
              {
                role: "user",
                parts: [
                  {
                    text: finalPrompt
                  }
                ]
              }
            ],

            generationConfig: {
              thinkingConfig: {
                thinkingLevel: "low"
              }
            }
          })
        }
      );
    }

    const MAX_RETRIES = 3;

    let response = null;
    let lastErrorData = null;

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        response = await callGemini();

        console.log(
          "VYRA GEMINI STATUS:",
          response.status,
          "ATTEMPT:",
          attempt + 1
        );

        if (response.ok) {
          break;
        }

        const errorText = await response.text();

        let errorData;

        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = {
            error: {
              message: errorText || "Unknown Gemini error"
            }
          };
        }

        lastErrorData = errorData;

        const errorCode = errorData?.error?.code || "";
        const errorStatus = errorData?.error?.status || "";
        const errorMessage =
          errorData?.error?.message ||
          errorText ||
          "Unknown Gemini error";

        console.error(
          "VYRA GEMINI ERROR:",
          JSON.stringify(errorData)
        );

        const dailyQuotaExceeded =
          errorCode === "quota_exceeded" ||
          errorStatus === "QUOTA_EXCEEDED" ||
          /daily quota/i.test(errorMessage);

        if (dailyQuotaExceeded) {
          console.error(
            "VYRA → DAILY QUOTA EXCEEDED. NO RETRY."
          );
          break;
        }

        const retryable =
          response.status === 408 ||
          response.status === 429 ||
          response.status === 500 ||
          response.status === 502 ||
          response.status === 503 ||
          response.status === 504;

        if (!retryable || attempt >= MAX_RETRIES) {
          break;
        }

        const baseDelay = Math.pow(2, attempt) * 1000;
        const jitter = Math.floor(Math.random() * 500);
        const delay = baseDelay + jitter;

        console.log(
          "🔄 VYRA → Retry in",
          delay,
          "ms..."
        );

        await new Promise(function (resolve) {
          setTimeout(resolve, delay);
        });

      } catch (networkError) {

        console.error(
          "VYRA GEMINI NETWORK ERROR:",
          networkError
        );

        lastErrorData = {
          error: {
            message:
              networkError?.message ||
              "Network error"
          }
        };

        if (attempt >= MAX_RETRIES) {
          break;
        }

        const baseDelay = Math.pow(2, attempt) * 1000;
        const jitter = Math.floor(Math.random() * 500);
        const delay = baseDelay + jitter;

        await new Promise(function (resolve) {
          setTimeout(resolve, delay);
        });
      }
    }

    if (!response || !response.ok) {

      const status = response?.status || 500;

      const errorCode =
        lastErrorData?.error?.code || "";

      const errorStatus =
        lastErrorData?.error?.status || "";

      const errorMessage =
        lastErrorData?.error?.message ||
        "Gemini API request failed";

      const dailyQuotaExceeded =
        errorCode === "quota_exceeded" ||
        errorStatus === "QUOTA_EXCEEDED" ||
        /daily quota/i.test(errorMessage);

      if (dailyQuotaExceeded) {

        return res.status(429).json({
          error:
            "Boss, Gemini की daily API quota अभी पूरी हो गई है। Quota reset होने के बाद फिर try करें।",
          temporary: false,
          quotaExceeded: true,
          geminiStatus: status
        });
      }

      const temporaryError =
        status === 408 ||
        status === 429 ||
        status === 500 ||
        status === 502 ||
        status === 503 ||
        status === 504;

      if (temporaryError) {

        return res.status(503).json({
          error:
            "Boss, Gemini अभी थोड़ी busy है। एक moment बाद फिर कोशिश करें।",
          temporary: true,
          quotaExceeded: false,
          geminiStatus: status
        });
      }

      return res.status(status).json({
        error: errorMessage,
        temporary: false,
        quotaExceeded: false,
        geminiStatus: status
      });
    }

    const data = await response.json();

    console.log(
      "VYRA GEMINI RESPONSE RECEIVED"
    );

    const reply =
      data?.candidates?.[0]?.content?.parts
        ?.map(function (part) {
          return part.text || "";
        })
        .join("")
        .trim();

    if (!reply) {

      console.error(
        "VYRA GEMINI → NO TEXT RESPONSE"
      );

      return res.status(500).json({
        error: "Gemini returned no text"
      });
    }

    console.log(
      "VYRA API CHAT → REPLY READY"
    );

    console.log("=================================");

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
