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

    // =========================================
    // READ REQUEST
    // =========================================

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
    // API KEY
    // =========================================

    const apiKey =
      process.env.GEMINI_API_KEY_NEW;


    console.log(
      "VYRA API CHAT → API KEY:",
      apiKey ? "FOUND" : "MISSING"
    );


    if (!apiKey) {

      return res.status(500).json({
        error: "GEMINI_API_KEY_NEW is missing"
      });

    }


    // =========================================
    // MEMORY CONTEXT
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
    // VYRA SYSTEM INSTRUCTION
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
    // BUILD PROMPT
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


    console.log(
      "VYRA API CHAT → Sending request to Gemini..."
    );


    // =========================================
    // GEMINI API
    // =========================================

    const response = await fetch(

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


          // =====================================
          // FAST RESPONSE MODE
          // =====================================

          generationConfig: {

            thinkingConfig: {

              thinkingLevel:
                "low"

            }

          }

        })

      }

    );


    // =========================================
    // GEMINI RESPONSE
    // =========================================

    const data =
      await response.json();


    console.log(
      "VYRA GEMINI STATUS:",
      response.status
    );


    console.log(
      "VYRA GEMINI RESPONSE RECEIVED"
    );


    // =========================================
    // GEMINI ERROR
    // =========================================

    if (!response.ok) {

      console.error(
        "VYRA GEMINI ERROR:",
        JSON.stringify(data)
      );


      return res.status(
        response.status
      ).json({

        error:
          data?.error?.message ||
          "Gemini API request failed",

        geminiStatus:
          response.status

      });

    }


    // =========================================
    // EXTRACT REPLY
    // =========================================

    const reply =

      data
        ?.candidates?.[0]
        ?.content?.parts
        ?.map(
          part =>
            part.text || ""
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
          "Gemini returned no text",

        debug:
          data

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

      reply: reply

    });


  }


  // =========================================
  // SERVER ERROR
  // =========================================

  catch (error) {

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
