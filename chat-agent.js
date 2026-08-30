const ChatAgent = {

  name: "Chat Agent",

  async handle(message) {

    const original = String(message || "").trim();

    if (!original) {

      return {
        success: true,
        reply: "Boss, मैं सुन रही हूँ। आप क्या कहना चाहते हैं?"
      };

    }

    try {

      // =========================================
      // MEMORY — SAVE USER MESSAGE
      // =========================================

      if (
        window.MemoryAgent &&
        typeof window.MemoryAgent.remember === "function"
      ) {

        window.MemoryAgent.remember(
          "user",
          original
        );

        console.log(
          "🧠 VYRA MEMORY → User message saved"
        );

      }


      // =========================================
      // MEMORY — GET PREVIOUS CONTEXT
      // =========================================

      let memoryContext = "";

      if (
        window.MemoryAgent &&
        typeof window.MemoryAgent.buildContext === "function"
      ) {

        memoryContext =
          window.MemoryAgent.buildContext(20);

      }


      console.log(
        "🧠 VYRA MEMORY → Context:",
        memoryContext
      );


      // =========================================
      // SEND REQUEST TO BACKEND
      // =========================================

      console.log(
        "VYRA CHAT AGENT → Sending request:",
        original
      );


      console.log(
        "🔥 VYRA → Calling /api/chat"
      );


      const response = await fetch(
        "/api/chat",
        {

          method: "POST",

          headers: {
            "Content-Type": "application/json"
          },

          body: JSON.stringify({

            message: original,

            memory: memoryContext

          })

        }
      );


      console.log(
        "🔥 VYRA → Backend response received"
      );


      // =========================================
      // READ RESPONSE
      // =========================================

      const raw =
        await response.text();


      let data;


      try {

        data =
          JSON.parse(raw);

      }

      catch {

        data = {

          error:
            raw ||
            "Empty response"

        };

      }


      console.log(
        "VYRA CHAT AGENT → Backend response:",
        data
      );


      // =========================================
      // ERROR CHECK
      // =========================================

      if (!response.ok) {

        throw new Error(

          data?.error ||
          "Backend request failed"

        );

      }


      // =========================================
      // GET REPLY
      // =========================================

      const reply =

        data?.reply ||

        data?.message ||

        "Boss, backend से कोई response नहीं मिला।";


      // =========================================
      // MEMORY — SAVE VYRA REPLY
      // =========================================

      if (
        window.MemoryAgent &&
        typeof window.MemoryAgent.remember === "function"
      ) {

        window.MemoryAgent.remember(
          "assistant",
          reply
        );

        console.log(
          "🧠 VYRA MEMORY → Assistant reply saved"
        );

      }


      // =========================================
      // RETURN
      // =========================================

      return {

        success: true,

        reply: reply

      };


    }

    catch (error) {

      console.error(
        "VYRA CHAT AGENT ERROR:",
        error
      );


      return {

        success: false,

        reply:
          "Boss, Chat Agent Error: " +
          (
            error?.message ||
            "Unknown error"
          )

      };

    }

  }

};


// =========================================
// GLOBAL CONNECTION
// =========================================

window.ChatAgent =
  ChatAgent;


console.log(
  "🔥 VYRA CHAT AGENT: CONNECTED"
);
