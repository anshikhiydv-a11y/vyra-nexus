const ChatAgent = {

  name: "Chat Agent",

  async handle(message) {

    const original = String(message || "").trim();
    const text = original.toLowerCase();

    if (!original) {
      return "Boss, मैं सुन रही हूँ। आप क्या कहना चाहते हैं?";
    }

    // -------------------------
    // LANGUAGE DETECTION
    // -------------------------

    const hasHindi = /[\u0900-\u097F]/.test(original);

    const englishWords = [
      "hello",
      "hi",
      "hey",
      "who",
      "what",
      "how",
      "can",
      "please",
      "help",
      "tell",
      "make",
      "create",
      "write",
      "explain"
    ];

    const hasEnglish = englishWords.some(word =>
      new RegExp("\\b" + word + "\\b", "i").test(original)
    );

    // Hindi gets priority when Devanagari is present
    const language = hasHindi ? "hi" : (hasEnglish ? "en" : "hi");


    // -------------------------
    // GREETING
    // -------------------------

    if (
      text.includes("hello") ||
      text.includes("hi") ||
      text.includes("hii") ||
      text.includes("hey") ||
      text.includes("नमस्ते") ||
      text.includes("नमस्कार")
    ) {

      if (language === "en") {
        return "Hello, Boss 👋 I'm VYRA Nexus. How can I assist you today?";
      }

      return "नमस्ते, Boss 👋 मैं VYRA Nexus हूँ। मैं आपकी कैसे मदद कर सकती हूँ?";
    }


    // -------------------------
    // WHO ARE YOU
    // -------------------------

    if (
      text.includes("who are you") ||
      text.includes("what are you") ||
      text.includes("तुम कौन हो") ||
      text.includes("आप कौन हो")
    ) {

      if (language === "en") {
        return "I'm VYRA Nexus, Boss — the Master AI interface of your modular AI ecosystem.";
      }

      return "मैं VYRA Nexus हूँ, Boss — आपके modular AI ecosystem का Master AI interface.";
    }


    // -------------------------
    // HOW ARE YOU
    // -------------------------

    if (
      text.includes("how are you") ||
      text.includes("how r u") ||
      text.includes("कैसे हो") ||
      text.includes("कैसी हो")
    ) {

      if (language === "en") {
        return "I'm online and ready, Boss ⚡ What would you like to do?";
      }

      return "मैं पूरी तरह online और ready हूँ, Boss ⚡ आप क्या करना चाहते हैं?";
    }


    // -------------------------
    // HELP
    // -------------------------

    if (
      text.includes("help me") ||
      text.includes("help") ||
      text.includes("मदद करो") ||
      text.includes("मदद चाहिए")
    ) {

      if (language === "en") {
        return "Of course, Boss. Tell me what you need help with.";
      }

      return "बिल्कुल, Boss। बताइए आपको किस चीज़ में मदद चाहिए?";
    }


    // -------------------------
    // DEVELOPMENT MODE
    // -------------------------

    if (
      text.includes("test") ||
      text.includes("testing") ||
      text.includes("टेस्ट") ||
      text.includes("testing vyra")
    ) {

      if (language === "en") {
        return "VYRA systems are online, Boss ⚡ Chat Agent is currently running in development mode.";
      }

      return "VYRA systems online हैं, Boss ⚡ Chat Agent अभी development mode में चल रहा है।";
    }


    // -------------------------
    // DEFAULT RESPONSE
    // -------------------------

    if (language === "en") {

      return (
        "I understood your message, Boss. " +
        "The Chat Agent is currently running in development mode. " +
        "A full AI model will be connected here later."
      );

    }

    return (
      "मैंने आपका संदेश समझ लिया है, Boss। " +
      "Chat Agent अभी development mode में चल रहा है। " +
      "बाद में यहाँ full AI model connect किया जाएगा।"
    );

  }

};
window.ChatAgent = ChatAgent;

console.log(
  "VYRA CHAT AGENT: CONNECTED"
);
