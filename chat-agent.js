const ChatAgent = {

  name: "Chat Agent",

  async handle(message) {

    const text = message.toLowerCase();

    if (
      text.includes("hello") ||
      text.includes("hi") ||
      text.includes("hii") ||
      text.includes("नमस्ते")
    ) {

      return "Hello, Boss 👋 मैं VYRA Nexus हूँ। मैं आपकी कैसे मदद कर सकती हूँ?";

    }

    if (
      text.includes("तुम कौन हो") ||
      text.includes("who are you")
    ) {

      return "मैं VYRA Nexus हूँ—एक modular AI ecosystem। अभी मेरा Master Core और Chat Agent तैयार हो रहे हैं।";

    }

    if (
      text.includes("कैसे हो") ||
      text.includes("how are you")
    ) {

      return "मैं पूरी तरह online हूँ, Boss ⚡ आप क्या करना चाहते हैं?";

    }

    return (
      "मैंने आपका संदेश समझ लिया है, Boss. " +
      "अभी मेरा AI system development mode में है।"
    );

  }

};
