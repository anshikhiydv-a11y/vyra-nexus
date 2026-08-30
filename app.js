/* =========================================
   VYRA NEXUS — APP CONTROLLER
   Speech-to-Speech Edition v1.0
   Master Core + Memory Connected
========================================= */

document.addEventListener("DOMContentLoaded", function () {

  "use strict";


  // =========================================
  // UI ELEMENTS
  // =========================================

  const input =
    document.querySelector(".command input");

  const sendButton =
    document.querySelector(".send");

  const micButton =
    document.querySelector(".mic");

  const messageBox =
    document.querySelector(".greeting p");


  // =========================================
  // SYSTEM CHECK
  // =========================================

  if (!micButton) {

    console.error(
      "VYRA SPEECH → Mic button not found."
    );

    return;
  }


  if (!window.VYRA_MASTER) {

    console.error(
      "VYRA → Master Core not found."
    );

    if (messageBox) {
      messageBox.textContent =
        "VYRA system connection error.";
    }

    return;
  }


  console.log(
    "================================="
  );

  console.log(
    "VYRA SPEECH SYSTEM: INITIALIZING"
  );

  console.log(
    "Master Core: CONNECTED"
  );


  // =========================================
  // SPEECH RECOGNITION
  // =========================================

  const SpeechRecognition =
    window.SpeechRecognition ||
    window.webkitSpeechRecognition;


  if (!SpeechRecognition) {

    console.error(
      "VYRA SPEECH → Speech Recognition not supported."
    );

    micButton.title =
      "Speech recognition is not supported";

    return;
  }


  const recognition =
    new SpeechRecognition();


  recognition.continuous = false;

  recognition.interimResults = false;

  recognition.lang = "en-IN";


  // =========================================
  // SPEECH STATE
  // =========================================

  let isListening = false;

  let isSpeaking = false;


  // =========================================
  // VYRA SPEAK
  // =========================================

  function speak(text) {

    if (!text) return;


    if (
      !("speechSynthesis" in window)
    ) {

      console.warn(
        "VYRA SPEECH → Text-to-Speech not supported."
      );

      return;
    }


    window.speechSynthesis.cancel();


    const cleanText =
      String(text)
        .replace(/<br\s*\/?>/gi, " ")
        .replace(/<[^>]*>/g, "")
        .trim();


    if (!cleanText) return;


    const utterance =
      new SpeechSynthesisUtterance(
        cleanText
      );


    /*
      VYRA voice settings
    */

    utterance.lang = "en-IN";

    utterance.rate = 0.95;

    utterance.pitch = 1.05;

    utterance.volume = 1;


    utterance.onstart =
      function () {

        isSpeaking = true;

        console.log(
          "VYRA SPEECH → Speaking"
        );

        setStatus(
          "VYRA SPEAKING"
        );

      };


    utterance.onend =
      function () {

        isSpeaking = false;

        console.log(
          "VYRA SPEECH → Finished"
        );

        setStatus(
          "STANDBY"
        );

      };


    utterance.onerror =
      function (error) {

        isSpeaking = false;

        console.error(
          "VYRA TTS ERROR:",
          error
        );

        setStatus(
          "STANDBY"
        );

      };


    window.speechSynthesis
      .speak(utterance);

  }


  // =========================================
  // STATUS
  // =========================================

  function setStatus(status) {

    const statusElements =
      document.querySelectorAll(
        ".card p"
      );


    statusElements.forEach(
      function (element) {

        const text =
          element.textContent
            .trim()
            .toUpperCase();


        if (
          text === "STANDBY" ||
          text === "LISTENING" ||
          text === "THINKING" ||
          text === "VYRA SPEAKING"
        ) {

          element.textContent =
            status;

        }

      }
    );


    console.log(
      "VYRA STATUS →",
      status
    );

  }


  // =========================================
  // HIDE TEXT RESPONSE
  // =========================================

  function hideConversationText() {

    /*
      We deliberately do not place
      conversation messages inside
      the greeting box.
    */

    if (!messageBox) return;


    messageBox.innerHTML =
      "Voice mode active. 🎙️";

  }


  // =========================================
  // PROCESS AI MESSAGE
  // =========================================

  async function processVoiceMessage(message) {

    if (!message) return;


    console.log(
      "VYRA SPEECH → USER:",
      message
    );


    setStatus(
      "THINKING"
    );


    try {

      /*
        Existing Master Core
        handles:

        Chat Agent
        Language Agent
        Story Agent
        Memory Agent
        Backend
      */

      const result =
        await window.VYRA_MASTER.process(
          message
        );


      console.log(
        "VYRA SPEECH → AI RESULT:",
        result
      );


      let reply = "";


      if (result?.reply) {

        reply =
          result.reply;

      }

      else if (result?.message) {

        reply =
          result.message;

      }


      if (!reply) {

        console.error(
          "VYRA SPEECH → Empty AI response."
        );

        setStatus(
          "STANDBY"
        );

        return;
      }


      /*
        IMPORTANT:

        Do NOT display reply
        as conversation text.
      */

      hideConversationText();


      console.log(
        "VYRA SPEECH → VYRA:",
        reply
      );


      speak(reply);

    }


    catch (error) {

      console.error(
        "VYRA SPEECH ERROR:",
        error
      );


      setStatus(
        "STANDBY"
      );


      speak(
        "Sorry Boss, connection mein thodi problem aa gayi."
      );

    }

  }


  // =========================================
  // START LISTENING
  // =========================================

  function startListening() {

    if (isListening) {

      console.log(
        "VYRA SPEECH → Already listening."
      );

      return;
    }


    if (isSpeaking) {

      window.speechSynthesis.cancel();

      isSpeaking = false;

    }


    try {

      recognition.lang =
        "en-IN";


      recognition.start();

    }


    catch (error) {

      console.warn(
        "VYRA SPEECH START:",
        error
      );

    }

  }


  // =========================================
  // RECOGNITION START
  // =========================================

  recognition.onstart =
    function () {

      isListening = true;


      console.log(
        "🎤 VYRA SPEECH → LISTENING"
      );


      setStatus(
        "LISTENING"
      );

    };


  // =========================================
  // SPEECH RESULT
  // =========================================

  recognition.onresult =
    function (event) {

      const transcript =
        event
          .results[
            event.results.length - 1
          ][0]
          .transcript
          .trim();


      console.log(
        "🎤 VYRA SPEECH → HEARD:",
        transcript
      );


      if (!transcript) {

        setStatus(
          "STANDBY"
        );

        return;
      }


      /*
        Do not show transcript
        inside UI.
      */

      hideConversationText();


      processVoiceMessage(
        transcript
      );

    };


  // =========================================
  // RECOGNITION END
  // =========================================

  recognition.onend =
    function () {

      isListening = false;


      console.log(
        "VYRA SPEECH → LISTENING ENDED"
      );


      if (!isSpeaking) {

        setStatus(
          "STANDBY"
        );

      }

    };


  // =========================================
  // RECOGNITION ERROR
  // =========================================

  recognition.onerror =
    function (event) {

      isListening = false;


      console.error(
        "VYRA SPEECH RECOGNITION ERROR:",
        event.error
      );


      setStatus(
        "STANDBY"
      );


      if (
        event.error ===
        "not-allowed"
      ) {

        console.warn(
          "VYRA SPEECH → Microphone permission denied."
        );

      }


      if (
        event.error ===
        "no-speech"
      ) {

        console.log(
          "VYRA SPEECH → No speech detected."
        );

      }

    };


  // =========================================
  // MIC BUTTON
  // =========================================

  micButton.addEventListener(
    "click",
    function () {

      console.log(
        "🎤 VYRA MIC → CLICK"
      );


      startListening();

    }
  );


  // =========================================
  // TEXT SEND — HIDDEN FALLBACK
  // =========================================

  if (
    sendButton &&
    input
  ) {

    sendButton.addEventListener(
      "click",
      async function () {

        const message =
          input.value.trim();


        if (!message) return;


        input.value = "";


        await processVoiceMessage(
          message
        );

      }
    );


    input.addEventListener(
      "keydown",
      function (event) {

        if (
          event.key === "Enter"
        ) {

          event.preventDefault();


          const message =
            input.value.trim();


          if (!message) return;


          input.value = "";


          processVoiceMessage(
            message
          );

        }

      }
    );

  }


  // =========================================
  // INITIAL STATE
  // =========================================

  hideConversationText();


  setStatus(
    "STANDBY"
  );


  console.log(
    "VYRA SPEECH SYSTEM: ONLINE"
  );

  console.log(
    "================================="
  );

});
