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

      console.log(
        "VYRA CHAT AGENT → Sending request:",
        original
      );

      const response = await fetch("/api/chat", {

        method: "POST",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify({
          message: original
        })

      });

      const data = await response.json();

      console.log(
        "VYRA CHAT AGENT → Backend response:",
        data
      );

      if (!response.ok) {

        throw new Error(
          data?.error ||
          "Backend request failed"
        );

      }

      return {
        success: true,
        reply:
          data?.reply ||
          "Boss, backend से कोई response नहीं मिला।"
      };

    } catch (error) {

      console.error(
        "VYRA CHAT AGENT ERROR:",
        error
      );

      return {
        success: false,
        reply:
          "Boss 💜 Backend से connection नहीं हो पाया।"
      };

    }

  }

};


// =========================================
// GLOBAL CONNECTION
// =========================================

window.ChatAgent = ChatAgent;

console.log(
  "VYRA CHAT AGENT: CONNECTED"
);
