export default async function handler(req, res) {

  console.log("=================================");
  console.log("VYRA API CHAT → REQUEST START");
  console.log("VYRA API CHAT → METHOD:", req.method);

  // =========================================
  // METHOD CHECK
  // =========================================

  if (req.method !== "POST") {

    return res.status(405).json({
      error: "Method not allowed",
      method: req.method
    });

  }


  try {

    const {
      message,
      memory
    } = req.body || {};


    console.log(
      "VYRA API CHAT → MESSAGE:",
      message
    );


    console.log(
      "VYRA API CHAT → MEMORY RECEIVED:",
      memory ? "YES" : "NO"
    );


    // =========================================
    // MESSAGE CHECK
    // =========================================

    if (!message) {

      return res.status(400).json({
        error: "Message is required"
      });

    }


    // =========================================
    // GEMINI API KEY
    // =========================================

    const apiKey =
      process.env.GEMINI_API_KEY_NEW;


    console.log(
      "VYRA API CHAT → API KEY:",
      apiKey ? "FOUND" : "MISSING"
    );


    if (!apiKey) {

      return res.status(500).json({
        error:
          "GEMINI_API_KEY_NEW is missing"
      });

    }


    // =========================================
    // MEMORY
    // =========================================

    let memoryText = "";


    if (memory) {

      memoryText =
        String(memory).slice(0, 12000);

    }


    console.log(
      "VYRA API CHAT → MEMORY LENGTH:",
      memoryText.length
    );


    // =========================================
    // SYSTEM INSTRUCTION
    // =========================================

    const systemInstruction = `
You are VYRA, a personal AI assistant.

Always address the user as "Boss".

You can naturally communicate in:
- Hindi
- English
- Hinglish

You are friendly, helpful, intelligent and natural.

IMPORTANT MEMORY RULES:

1. Previous conversation context may be provided below.
2. Use it to understand references such as:
   "meri wali choice",
   "kal hum kya baat kar rahe the?",
   "maine tumhe kya bataya tha?"
3. Do not pretend to remember something that is not present in the memory context.
4. If the memory context contains the answer, use it naturally.
5. Do not unnecessarily repeat the entire memory.
6. Continue the conversation naturally.

IMPORTANT RESPONSE RULE:

Give a direct answer first.

Do not spend unnecessary reasoning on simple conversation.

Keep normal conversational replies concise unless Boss asks for detail.
`;


    // =========================================
    // FINAL PROMPT
    // =========================================

    let finalPrompt = "";


    if (memoryText) {

      finalPrompt = `
PREVIOUS CONVERSATION MEMORY:

${memoryText}

END MEMORY

CURRENT MESSAGE FROM BOSS:

${message}

Respond naturally based on the current message and the relevant previous context.
`;

    } else {

      finalPrompt = `
CURRENT MESSAGE FROM BOSS:

${message}

Respond naturally.
`;

    }


    // =========================================
    // GEMINI REQUEST
    // =========================================

    async function callGemini() {

      console.log(
        "🔥 VYRA → Sending request to Gemini..."
      );


      return await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            "x-goog-api-key":
              apiKey
          },

          body: JSON.stringify({

            systemInstruction: {

              parts: [
                {
                  text:
                    systemInstruction
                }
              ]

            },

            contents: [

              {
                role: "user",

                parts: [

                  {
                    text:
                      finalPrompt
                  }

                ]

              }

            ],

            generationConfig: {

              thinkingConfig: {

                thinkingLevel:
                  "low"

              }

            }

          })

        }
      );

    }


    // =========================================
    // RETRY SETTINGS
    // =========================================

    const MAX_RETRIES = 3;

    let response = null;

    let lastErrorData = null;


    // =========================================
    // GEMINI REQUEST LOOP
    // =========================================

    for (
      let attempt = 0;
      attempt <= MAX_RETRIES;
      attempt++
    ) {

      try {

        response =
          await callGemini();


        console.log(
          "VYRA GEMINI STATUS:",
          response.status,
          "ATTEMPT:",
          attempt + 1
        );


        // =====================================
        // SUCCESS
        // =====================================

        if (response.ok) {

          break;

        }


        // =====================================
        // READ ERROR BODY
        // =====================================

        const errorText =
          await response.text();


        let errorData;


        try {

          errorData =
            JSON.parse(errorText);

        } catch {

          errorData = {
            error: {
              message:
                errorText ||
                "Unknown Gemini error"
            }
          };

        }


        lastErrorData =
          errorData;


        const errorCode =
          errorData?.error?.code ||
          "";


        const errorStatus =
          errorData?.error?.status ||
          "";


        const errorMessage =
          errorData?.error?.message ||
          errorText ||
          "Unknown Gemini error";


        console.error(
          "VYRA GEMINI ERROR:",
          JSON.stringify(errorData)
        );


        console.error(
          "VYRA GEMINI ERROR CODE:",
          errorCode
        );


        console.error(
          "VYRA GEMINI ERROR STATUS:",
          errorStatus
        );


        // =====================================
        // DAILY QUOTA EXHAUSTED
        // =====================================
        //
        // Do NOT waste retries when Gemini says
        // the daily quota itself is exhausted.
        // =====================================

        const dailyQuotaExceeded =
          errorCode === "quota_exceeded" ||
          errorStatus === "QUOTA_EXCEEDED" ||
          /daily quota/i.test(
            errorMessage
          );


        if (dailyQuotaExceeded) {

          console.error(
            "VYRA → DAILY QUOTA EXCEEDED. NO RETRY."
          );

          break;

        }


        // =====================================
        // RETRYABLE ERRORS
        // =====================================

        const retryable =
          response.status === 408 ||
          response.status === 429 ||
          response.status === 500 ||
          response.status === 502 ||
          response.status === 503 ||
          response.status === 504;


        // =====================================
        // STOP IF NOT RETRYABLE
        // =====================================

        if (
          !retryable ||
          attempt >= MAX_RETRIES
        ) {

          break;

        }


        // =====================================
        // EXPONENTIAL BACKOFF + JITTER
        // =====================================

        const baseDelay =
          Math.pow(
            2,
            attempt
          ) * 1000;


        const jitter =
          Math.floor(
            Math.random() * 500
          );


        const delay =
          baseDelay + jitter;


        console.log(
          "🔄 VYRA → Gemini temporary error."
        );


        console.log(
          "🔄 VYRA → Retry",
          attempt + 1,
          "in",
          delay,
          "ms..."
        );


        await new Promise(
          function (resolve) {

            setTimeout(
              resolve,
              delay
            );

          }
        );

      } catch (networkError) {

        // =====================================
        // NETWORK ERROR
        // =====================================

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


        // Retry network errors too,
        // but only a limited number of times.

        if (
          attempt >= MAX_RETRIES
        ) {

          break;

        }


        const baseDelay =
          Math.pow(
            2,
            attempt
          ) * 1000;


        const jitter =
          Math.floor(
            Math.random() * 500
          );


        const delay =
          baseDelay + jitter;


        console.log(
          "🔄 VYRA → Network retry in",
          delay,
          "ms..."
        );


        await new Promise(
          function (resolve) {

            setTimeout(
              resolve,
              delay
            );

          }
        );

      }

    }


    // =========================================
    // FINAL ERROR
    // =========================================

    if (
      !response ||
      !response.ok
    ) {

      const status =
        response?.status || 500;


      const errorCode =
        lastErrorData
          ?.error
          ?.code ||
        "";


      const errorStatus =
        lastErrorData
          ?.error
          ?.status ||
        "";


      const errorMessage =
        lastErrorData
          ?.error
          ?.message ||
        "Gemini API request failed";


      console.error(
        "VYRA FINAL GEMINI ERROR:",
        status,
        errorCode,
        errorStatus,
        errorMessage
      );


      // =====================================
      // DAILY QUOTA MESSAGE
      // =====================================

      const dailyQuotaExceeded =
        errorCode === "quota_exceeded" ||
        errorStatus === "QUOTA_EXCEEDED" ||
        /daily quota/i.test(
          errorMessage
        );


      if (dailyQuotaExceeded) {

        return res.status(429).json({

          error:
            "Boss, Gemini की daily API quota अभी पूरी हो गई है। Quota reset होने के बाद फिर try करें।",

          temporary:
            false,

          quotaExceeded:
            true,

          geminiStatus:
            status

        });

      }


      // =====================================
      // TEMPORARY ERROR MESSAGE
      // =====================================

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

          temporary:
            true,

          quotaExceeded:
            false,

          geminiStatus:
            status

        });

      }


      // =====================================
      // NON-RETRYABLE ERROR
      // =====================================

      return res.status(status).json({

        error:
          errorMessage,

        temporary:
          false,

        quotaExceeded:
          false,

        geminiStatus:
          status

      });

    }


    // =========================================
    // SUCCESS RESPONSE
    // =========================================

    const data =
      await response.json();


    console.log(
      "VYRA GEMINI RESPONSE RECEIVED"
    );


    const reply =
      data
        ?.candidates?.[0]
        ?.content?.parts
        ?.map(
          function (part) {

            return part.text || "";

          }
        )
        ?.join("")
        ?.trim();


    // =========================================
    // EMPTY RESPONSE
    // =========================================

    if (!reply) {

      console.error(
        "VYRA GEMINI → NO TEXT RESPONSE"
      );


      return res.status(500).json({

        error:
          "Gemini returned no text"

      });

    }


    // =========================================
    // SUCCESS
    // =========================================

    console.log(
      "VYRA API CHAT → REPLY READY"
    );


    console.log(
      "================================="
    );


    return res.status(200).json({

      reply:
        reply

    });


  } catch (error) {

    // =========================================
    // UNEXPECTED SERVER ERROR
    // =========================================

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
