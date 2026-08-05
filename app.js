// ==================================
// VYRA NEXUS - COMMAND SYSTEM
// ==================================

document.addEventListener("DOMContentLoaded", function () {

  // Command input ढूँढो
  const input = document.querySelector(
    ".command input"
  );

  // Command section का button ढूँढो
  const sendButton = document.querySelector(
    ".command button"
  );

  // VYRA का message area
  const messageBox = document.querySelector(
    ".greeting p"
  );


  // अगर कोई element नहीं मिला
  if (!input || !sendButton || !messageBox) {

    console.log(
      "VYRA: Required UI element not found."
    );

    return;

  }


  // VYRA reply function

  function sendCommand() {

    const userMessage =
      input.value.trim();


    // खाली message मत भेजो

    if (userMessage === "") {

      messageBox.innerHTML =
        "Boss, पहले कोई command लिखो 💜";

      return;

    }


    const text =
      userMessage.toLowerCase();


    // User message दिखाओ

    messageBox.innerHTML =

      "<b>Boss:</b> " +

      userMessage +

      "<br><br>" +

      "<b>VYRA:</b> Processing...";


    // Input खाली करो

    input.value = "";


    // VYRA reply

    setTimeout(function () {

      let reply;


      if (

        text.includes("तुम कौन हो") ||

        text.includes("who are you")

      ) {

        reply =

          "मैं VYRA हूँ, Boss 💜<br>" +

          "मैं तुम्हारे AI Ecosystem की " +

          "Master AI हूँ।";

      }


      else if (

        text.includes("hello") ||

        text.includes("hi") ||

        text.includes("हेलो") ||

        text.includes("हाय")

      ) {

        reply =

          "Hello, Boss 👋<br>" +

          "मैं online हूँ। " +

          "मैं आपकी कैसे मदद कर सकती हूँ?";

      }


      else if (

        text.includes("कैसे हो") ||

        text.includes("how are you")

      ) {

        reply =

          "मैं पूरी तरह online हूँ, Boss 💜<br>" +

          "मेरे सभी मुख्य systems " +

          "सही तरीके से चल रहे हैं।";

      }


      else {

        reply =

          "मैंने आपका संदेश प्राप्त कर लिया है, Boss 💜<br><br>" +

          "अभी मेरा Advanced Chat Agent " +

          "तैयार किया जा रहा है।";

      }


      messageBox.innerHTML =

        "<b>VYRA:</b><br>" +

        reply;


    }, 700);

  }


  // Button click

  sendButton.addEventListener(

    "click",

    sendCommand

  );


  // Enter key

  input.addEventListener(

    "keydown",

    function (event) {

      if (event.key === "Enter") {

        event.preventDefault();

        sendCommand();

      }

    }

  );

});
