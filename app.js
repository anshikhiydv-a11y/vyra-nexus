/* =========================================
   VYRA NEXUS — APP CONTROLLER
   Master Core Connected
========================================= */

document.addEventListener("DOMContentLoaded", function () {

  "use strict";


  // =========================================
  // UI ELEMENTS
  // =========================================

  const input = document.querySelector(
    ".command input"
  );

  const sendButton = document.querySelector(
    ".send"
  );

  const messageBox = document.querySelector(
    ".greeting p"
  );


  // =========================================
  // SYSTEM CHECK
  // =========================================

  if (!input || !sendButton || !messageBox) {

    console.error(
      "VYRA: Required UI elements not found."
    );

    return;
  }


  if (!window.VYRA_MASTER) {

    console.error(
      "VYRA: Master Core not found."
    );

    messageBox.innerHTML =
      "Boss, मेरा Master Core अभी connect नहीं हुआ है।";

    return;
  }


  // =========================================
  // DISPLAY RESPONSE
  // =========================================

  function displayResponse(response) {

    messageBox.innerHTML =
      "<b>VYRA:</b><br><br>" +
      response;

  }


  // =========================================
  // CHAT AGENT
  // =========================================

  function runChatAgent(message) {

    const text =
      message.toLowerCase();


    if (
      text.includes("तुम कौन हो") ||
      text.includes("who are you")
    ) {

      return (
        "मैं VYRA हूँ, Boss 💜<br>" +
        "मैं तुम्हारे AI Ecosystem की " +
        "Master AI हूँ।"
      );

    }


    if (
      text.includes("hello") ||
      text.includes("hi") ||
      text.includes("हेलो") ||
      text.includes("हाय")
    ) {

      return (
        "Hello, Boss 👋<br>" +
        "मैं online हूँ। " +
        "मैं आपकी कैसे मदद कर सकती हूँ?"
      );

    }


    if (
      text.includes("कैसे हो") ||
      text.includes("how are you")
    ) {

      return (
        "मैं पूरी तरह online हूँ, Boss 💜<br>" +
        "मेरे मुख्य systems अभी सही तरीके से चल रहे हैं।"
      );

    }


    if (
      text.includes("नाम") ||
      text.includes("name")
    ) {

      return (
        "मेरा नाम VYRA है, Boss 💜"
      );

    }


    return (
      "मैंने आपका message समझ लिया है, Boss 💜<br><br>" +
      "Chat Agent अभी basic mode में चल रहा है।"
    );

  }


  // =========================================
  // AGENT ROUTER
  // =========================================

  function executeAgent(message, routing) {

    switch (routing.agentId) {


      // -------------------------------------
      // CHAT
      // -------------------------------------

      case "chat":

        return runChatAgent(message);


      // -------------------------------------
      // FUTURE AGENTS
      // -------------------------------------

      case "study":

        return (
          "Study Agent अभी तैयार किया जा रहा है, Boss 📚"
        );


      case "story":

        return (
          "Story Agent अभी तैयार किया जा रहा है, Boss 📖"
        );


      case "image":

        return (
          "Image Agent अभी तैयार किया जा रहा है, Boss 🖼️"
        );


      case "video":

        return (
          "Video Agent अभी तैयार किया जा रहा है, Boss 🎬"
        );


      case "voice":

        return (
          "Voice Agent अभी तैयार किया जा रहा है, Boss 🎙️"
        );


      case "sound":

        return (
          "Sound Agent अभी तैयार किया जा रहा है, Boss 🔊"
        );


      case "editing":

        return (
          "Editing Agent अभी तैयार किया जा रहा है, Boss ✂️"
        );


      case "coding":

        return (
          "Coding Agent अभी तैयार किया जा रहा है, Boss 💻"
        );


      case "presentation":

        return (
          "Presentation Agent अभी तैयार किया जा रहा है, Boss 📊"
        );


      case "task":

        return (
          "Task Agent अभी तैयार किया जा रहा है, Boss ⚙️"
        );


      case "memory":

        return (
          "Memory Agent अभी तैयार किया जा रहा है, Boss 🧠"
        );


      default:

        return runChatAgent(message);

    }

  }


  // =========================================
  // MAIN COMMAND PROCESSOR
  // =========================================

  function processCommand() {

    const message =
      input.value.trim();


    if (!message) {

      messageBox.innerHTML =
        "Boss, कोई command लिखो या बोलो 💜";

      return;

    }


    // ---------------------------------------
    // USER MESSAGE
    // ---------------------------------------

    messageBox.innerHTML =
      "<b>Boss:</b><br>" +
      message +
      "<br><br>" +
      "<b>VYRA:</b><br>" +
      "Thinking...";


    input.value = "";


    // ========================================
// MASTER CORE
// ========================================

setTimeout(async function () {

  try {

    const routing =
      window.VYRA_MASTER.route(message);

    console.log(
      "VYRA ROUTING:",
      routing
    );

    const result =
      await window.VYRA_MASTER.process(message);

    if (result?.message) {

      displayResponse(
        result.message
      );

    } else if (result?.reply) {

      displayResponse(
        result.reply
      );

    } else {

      displayResponse(
        "Boss 💜 कोई response नहीं मिला।"
      );

    }

  } catch (error) {

    console.error(
      "VYRA MASTER ERROR:",
      error
    );

    displayResponse(
      "Boss 💜 VYRA Master Core से connection नहीं हो पाया।"
    );

  }

}, 300);
  }


  // =========================================
  // SEND BUTTON
  // =========================================

  sendButton.addEventListener(
    "click",
    processCommand
  );


  // =========================================
  // ENTER KEY
  // =========================================

  input.addEventListener(
    "keydown",
    function (event) {

      if (event.key === "Enter") {

        event.preventDefault();

        processCommand();

      }

    }
  );


  // =========================================
  // STARTUP
  // =========================================

  console.log(
    "VYRA APP CONTROLLER: ONLINE"
  );

  console.log(
    "Master Core:",
    window.VYRA_MASTER
      ? "CONNECTED"
      : "NOT FOUND"
  );

});
