/* =========================================
   AV — APP CONTROLLER
   Browser Speech Edition v4.0

   Speech Recognition
   Browser Speech Synthesis
   Master Core
   Memory
   AV UI STATES

   STATES:
   STANDBY
   LISTENING
   THINKING
   SPEAKING
   REVEAL
========================================= */

document.addEventListener("DOMContentLoaded", function () {

  "use strict";

  /* =========================================
     ELEMENTS
  ========================================= */

  const micButton =
    document.querySelector(".mic");

  const input =
    document.querySelector(".command input");

  const sendButton =
    document.querySelector(".send");

  const core =
    document.querySelector(".av-core");

  const coreSection =
    document.querySelector(".core-section");

  const statusText =
    document.querySelector(".ai-status p");

  const statusDot =
    document.querySelector(".status-dot");


  /* =========================================
     MASTER CORE CHECK
  ========================================= */

  if (!window.VYRA_MASTER) {

    console.error(
      "AV → Master Core not found."
    );

    setTimeout(function () {

      applyState("standby");

    }, 0);

    return;
  }


  /* =========================================
     MICROPHONE CHECK
  ========================================= */

  if (!micButton) {

    console.error(
      "AV SPEECH → Mic button not found."
    );

    return;
  }


  console.log("=================================");
  console.log("AV SPEECH SYSTEM: INITIALIZING");
  console.log("Master Core: CONNECTED");
  console.log("Browser Speech: READY");
  console.log("AV UI STATES: READY");
  console.log("=================================");


  /* =========================================
     STATE STYLE SYSTEM
  ========================================= */

  function installStateStyles() {

    if (document.getElementById("av-state-styles")) {
      return;
    }

    const style =
      document.createElement("style");

    style.id =
      "av-state-styles";

    style.textContent = `

      /* =====================================
         AV STATE BASE
      ===================================== */

      body[data-av-state] .av-core {
        transition:
          transform 0.55s ease,
          filter 0.55s ease;
      }

      body[data-av-state] .core-section {
        transition:
          background 0.7s ease,
          box-shadow 0.7s ease;
      }

      body[data-av-state] .core-inner {
        transition:
          background 0.7s ease,
          border-color 0.7s ease,
          box-shadow 0.7s ease,
          transform 0.5s ease;
      }

      body[data-av-state] .core-ring {
        transition:
          border-color 0.7s ease,
          box-shadow 0.7s ease,
          opacity 0.7s ease;
      }

      body[data-av-state] .status-dot {
        transition:
          background 0.5s ease,
          box-shadow 0.5s ease,
          transform 0.3s ease;
      }


      /* =====================================
         STANDBY
      ===================================== */

      body[data-av-state="standby"] .core-section {

        background:
          radial-gradient(
            circle at center,
            rgba(52, 24, 100, 0.70),
            rgba(8, 6, 18, 0.96) 58%,
            #03040b 100%
          );

        box-shadow:
          inset 0 0 55px rgba(111, 56, 255, 0.10),
          0 0 35px rgba(111, 56, 255, 0.12);

      }

      body[data-av-state="standby"] .av-core {

        transform:
          scale(1);

      }


      /* =====================================
         LISTENING
      ===================================== */

      body[data-av-state="listening"] .core-section {

        background:
          radial-gradient(
            circle at center,
            rgba(0, 96, 180, 0.42),
            rgba(7, 16, 35, 0.96) 58%,
            #02060e 100%
          );

        box-shadow:
          inset 0 0 70px rgba(0, 180, 255, 0.18),
          0 0 55px rgba(0, 180, 255, 0.18);

      }

      body[data-av-state="listening"] .av-core {

        transform:
          scale(1.08);

        filter:
          drop-shadow(
            0 0 25px rgba(0, 200, 255, 0.45)
          );

      }

      body[data-av-state="listening"] .core-inner {

        border-color:
          rgba(80, 217, 255, 0.95);

        background:
          radial-gradient(
            circle at 35% 30%,
            #153f67,
            #071522 72%
          );

        box-shadow:
          0 0 35px rgba(80, 217, 255, 0.80),
          inset 0 0 30px rgba(80, 217, 255, 0.22);

      }

      body[data-av-state="listening"] .ring-one {

        border-top-color:
          #50d9ff;

        border-right-color:
          #278bff;

        box-shadow:
          0 0 25px rgba(80, 217, 255, 0.85);

      }

      body[data-av-state="listening"] .ring-two {

        border-bottom-color:
          #35c9ff;

        border-left-color:
          #477aff;

        box-shadow:
          0 0 28px rgba(61, 139, 255, 0.70);

      }

      body[data-av-state="listening"] .status-dot {

        background:
          #50d9ff;

        box-shadow:
          0 0 15px rgba(80, 217, 255, 1);

      }


      /* =====================================
         THINKING
      ===================================== */

      body[data-av-state="thinking"] .core-section {

        background:
          radial-gradient(
            circle at center,
            rgba(110, 38, 180, 0.52),
            rgba(19, 7, 37, 0.97) 58%,
            #04020b 100%
          );

        box-shadow:
          inset 0 0 80px rgba(180, 70, 255, 0.22),
          0 0 65px rgba(155, 92, 255, 0.22);

      }

      body[data-av-state="thinking"] .av-core {

        transform:
          scale(1.10);

        filter:
          drop-shadow(
            0 0 32px rgba(190, 70, 255, 0.55)
          );

      }

      body[data-av-state="thinking"] .core-inner {

        border-color:
          #d47cff;

        background:
          radial-gradient(
            circle at 35% 30%,
            #5d247d,
            #180923 72%
          );

        box-shadow:
          0 0 45px rgba(199, 90, 255, 0.90),
          inset 0 0 35px rgba(190, 70, 255, 0.30);

      }

      body[data-av-state="thinking"] .ring-one {

        border-top-color:
          #e17cff;

        border-right-color:
          #914dff;

        box-shadow:
          0 0 30px rgba(210, 100, 255, 0.95);

        animation-duration:
          2.5s !important;

      }

      body[data-av-state="thinking"] .ring-two {

        border-bottom-color:
          #b76cff;

        border-left-color:
          #6845ff;

        box-shadow:
          0 0 35px rgba(155, 92, 255, 0.85);

        animation-duration:
          3.5s !important;

      }

      body[data-av-state="thinking"] .ring-three {

        border-top-color:
          #df8cff;

        border-bottom-color:
          #8c5cff;

        opacity:
          0.95;

        animation-duration:
          5s !important;

      }

      body[data-av-state="thinking"] .status-dot {

        background:
          #c77dff;

        box-shadow:
          0 0 18px rgba(199, 125, 255, 1);

      }


      /* =====================================
         SPEAKING
      ===================================== */

      body[data-av-state="speaking"] .core-section {

        background:
          radial-gradient(
            circle at center,
            rgba(45, 75, 170, 0.50),
            rgba(15, 8, 38, 0.96) 58%,
            #03040b 100%
          );

        box-shadow:
          inset 0 0 85px rgba(80, 217, 255, 0.16),
          0 0 70px rgba(155, 92, 255, 0.25);

      }

      body[data-av-state="speaking"] .av-core {

        transform:
          scale(1.12);

        filter:
          drop-shadow(
            0 0 38px rgba(80, 217, 255, 0.55)
          );

      }

      body[data-av-state="speaking"] .core-inner {

        border-color:
          #c77dff;

        background:
          radial-gradient(
            circle at 35% 30%,
            #4e2d87,
            #11152f 72%
          );

        box-shadow:
          0 0 48px rgba(80, 217, 255, 0.55),
          0 0 70px rgba(199, 125, 255, 0.45),
          inset 0 0 35px rgba(80, 217, 255, 0.20);

        animation:
          speakingPulse 1.15s ease-in-out infinite !important;

      }

      body[data-av-state="speaking"] .ring-one {

        border-top-color:
          #e28cff;

        border-right-color:
          #50d9ff;

        box-shadow:
          0 0 30px rgba(80, 217, 255, 0.75);

      }

      body[data-av-state="speaking"] .ring-two {

        border-bottom-color:
          #50d9ff;

        border-left-color:
          #a85cff;

        box-shadow:
          0 0 35px rgba(155, 92, 255, 0.75);

      }

      body[data-av-state="speaking"] .status-dot {

        background:
          #50d9ff;

        box-shadow:
          0 0 18px rgba(80, 217, 255, 1);

      }


      /* =====================================
         REVEAL
      ===================================== */

      body[data-av-state="reveal"] .core-section {

        background:
          radial-gradient(
            circle at center,
            rgba(155, 25, 190, 0.58),
            rgba(25, 5, 45, 0.97) 58%,
            #05010b 100%
          );

        box-shadow:
          inset 0 0 100px rgba(255, 70, 220, 0.25),
          0 0 90px rgba(210, 70, 255, 0.30);

      }

      body[data-av-state="reveal"] .av-core {

        transform:
          scale(1.20);

        filter:
          drop-shadow(
            0 0 45px rgba(255, 70, 220, 0.75)
          );

      }

      body[data-av-state="reveal"] .core-inner {

        border-color:
          #ff7ce8;

        background:
          radial-gradient(
            circle at 35% 30%,
            #722c85,
            #220622 72%
          );

        box-shadow:
          0 0 55px rgba(255, 70, 220, 0.90),
          0 0 90px rgba(155, 92, 255, 0.60),
          inset 0 0 40px rgba(255, 100, 220, 0.28);

      }

      body[data-av-state="reveal"] .ring-one {

        border-top-color:
          #ff83e9;

        border-right-color:
          #bd5cff;

        box-shadow:
          0 0 35px rgba(255, 90, 220, 0.95);

        animation-duration:
          4s !important;

      }

      body[data-av-state="reveal"] .ring-two {

        border-bottom-color:
          #ff55d7;

        border-left-color:
          #6f5cff;

        box-shadow:
          0 0 40px rgba(255, 80, 220, 0.80);

      }

      body[data-av-state="reveal"] .ring-three {

        border-top-color:
          #ff72e8;

        border-bottom-color:
          #8b6cff;

        opacity:
          1;

      }

      body[data-av-state="reveal"] .status-dot {

        background:
          #ff6cdd;

        box-shadow:
          0 0 20px rgba(255, 100, 220, 1);

      }


      /* =====================================
         SPEAKING PULSE
      ===================================== */

      @keyframes speakingPulse {

        0%, 100% {
          transform: scale(0.96);
        }

        50% {
          transform: scale(1.07);
        }

      }

    `;

    document.head.appendChild(style);
  }


  installStateStyles();


  /* =========================================
     SPEECH RECOGNITION
  ========================================= */

  const SpeechRecognition =
    window.SpeechRecognition ||
    window.webkitSpeechRecognition;


  if (!SpeechRecognition) {

    console.error(
      "AV SPEECH → Speech Recognition not supported."
    );

    micButton.title =
      "Speech recognition is not supported";

    return;
  }


  const recognition =
    new SpeechRecognition();


  recognition.continuous =
    false;

  recognition.interimResults =
    false;

  recognition.lang =
    "en-IN";


  /* =========================================
     STATE VARIABLES
  ========================================= */

  let isListening =
    false;

  let isSpeaking =
    false;

  let recognitionActive =
    false;

  let isThinking =
    false;

  let currentUtterance =
    null;


  /* =========================================
     APPLY AV STATE
  ========================================= */

  function applyState(state) {

    const normalized =
      String(state || "standby")
        .toLowerCase()
        .trim();


    document.body.dataset.avState =
      normalized;


    /*
      Optional external AV_UI
    */

    if (
      window.AV_UI &&
      typeof window.AV_UI.setState ===
      "function"
    ) {

      try {

        window.AV_UI.setState(
          normalized
        );

      } catch (error) {

        console.warn(
          "AV_UI STATE ERROR:",
          error
        );

      }

    }


    /*
      Visible status text
    */

    const labels = {

      standby:
        "STANDBY",

      listening:
        "LISTENING",

      thinking:
        "THINKING",

      speaking:
        "AV SPEAKING",

      reveal:
        "REVEAL"

    };


    if (statusText) {

      statusText.textContent =
        labels[normalized] ||
        "STANDBY";

    }


    /*
      Status dot
    */

    if (statusDot) {

      statusDot.classList
        .remove(
          "state-standby",
          "state-listening",
          "state-thinking",
          "state-speaking",
          "state-reveal"
        );

      statusDot.classList
        .add(
          "state-" + normalized
        );

    }


    /*
      Helpful browser-console log
    */

    console.log(
      "💜 AV UI STATE →",
      normalized.toUpperCase()
    );

  }


  /* =========================================
     PUBLIC STATE ACCESS
  ========================================= */

  window.AV_STATE =
    function (state) {

      applyState(state);

    };


  /* =========================================
     SPEECH TEXT CLEANER
  ========================================= */

  function cleanSpeechText(text) {

    return String(text || "")

      .replace(
        /```[\s\S]*?```/g,
        ""
      )

      .replace(
        /<br\s*\/?>/gi,
        " "
      )

      .replace(
        /<[^>]*>/g,
        ""
      )

      .replace(
        /\*\*/g,
        ""
      )

      .replace(
        /\*/g,
        ""
      )

      .replace(
        /#{1,6}\s/g,
        ""
      )

      .replace(
        /^\s*[-•]\s*/gm,
        ""
      )

      .replace(
        /\s+/g,
        " "
      )

      .trim();

  }


  /* =========================================
     STOP BROWSER SPEECH
  ========================================= */

  function stopSpeaking() {

    try {

      window.speechSynthesis.cancel();

    } catch (error) {

      console.warn(
        "AV SPEECH STOP:",
        error
      );

    }


    currentUtterance =
      null;

    isSpeaking =
      false;

  }


  /* =========================================
     FIND BEST BROWSER VOICE
  ========================================= */

  function getPreferredVoice() {

    const voices =
      window.speechSynthesis
        .getVoices();


    if (!voices.length) {

      return null;

    }


    const preferredNames = [

      "Microsoft Heera",
      "Microsoft Neerja",
      "Microsoft Aditi",
      "Google हिन्दी",
      "Google Hindi",
      "Google UK English Female",
      "Google US English Female"

    ];


    for (
      const preferredName
      of preferredNames
    ) {

      const voice =
        voices.find(
          function (item) {

            return item.name
              .toLowerCase()
              .includes(
                preferredName
                  .toLowerCase()
              );

          }
        );


      if (voice) {

        return voice;

      }

    }


    const indianVoice =
      voices.find(
        function (voice) {

          const language =
            String(
              voice.lang || ""
            ).toLowerCase();


          return (
            language === "en-in" ||
            language === "hi-in"
          );

        }
      );


    if (indianVoice) {

      return indianVoice;

    }


    const englishVoice =
      voices.find(
        function (voice) {

          return String(
            voice.lang || ""
          )
          .toLowerCase()
          .startsWith("en");

        }
      );


    return (
      englishVoice ||
      voices[0]
    );

  }


  /* =========================================
     BROWSER TTS
  ========================================= */

  function speak(text) {

    return new Promise(
      function (resolve) {

        const cleanText =
          cleanSpeechText(text);


        if (!cleanText) {

          applyState(
            "standby"
          );

          resolve();

          return;

        }


        stopSpeaking();


        if (
          !window.speechSynthesis
        ) {

          console.error(
            "AV SPEECH → Browser speech synthesis unavailable."
          );

          applyState(
            "standby"
          );

          resolve();

          return;

        }


        console.log(
          "🔊 AV SPEECH →",
          cleanText
        );


        applyState(
          "speaking"
        );


        const utterance =
          new SpeechSynthesisUtterance(
            cleanText
          );


        currentUtterance =
          utterance;


        const voice =
          getPreferredVoice();


        if (voice) {

          utterance.voice =
            voice;


          console.log(
            "🔊 AV VOICE →",
            voice.name,
            voice.lang
          );

        }


        utterance.lang =
          voice?.lang ||
          "en-IN";


        utterance.rate =
          0.95;


        utterance.pitch =
          1.05;


        utterance.volume =
          1.0;


        utterance.onstart =
          function () {

            isSpeaking =
              true;


            applyState(
              "speaking"
            );

          };


        utterance.onend =
          function () {

            isSpeaking =
              false;


            currentUtterance =
              null;


            if (!isListening) {

              applyState(
                "standby"
              );

            }


            resolve();

          };


        utterance.onerror =
          function (event) {

            console.error(
              "AV SPEECH SYNTHESIS ERROR:",
              event.error
            );


            isSpeaking =
              false;


            currentUtterance =
              null;


            applyState(
              "standby"
            );


            resolve();

          };


        setTimeout(
          function () {

            try {

              window.speechSynthesis
                .speak(
                  utterance
                );

            } catch (error) {

              console.error(
                "AV SPEECH START ERROR:",
                error
              );


              isSpeaking =
                false;


              currentUtterance =
                null;


              applyState(
                "standby"
              );


              resolve();

            }

          },
          80
        );

      }
    );

  }


  /* =========================================
     LOAD BROWSER VOICES
  ========================================= */

  if (
    "onvoiceschanged"
    in window.speechSynthesis
  ) {

    window.speechSynthesis
      .onvoiceschanged =
      function () {

        const voices =
          window.speechSynthesis
            .getVoices();


        console.log(
          "🔊 AV VOICES LOADED:",
          voices.length
        );

      };

  }


  window.speechSynthesis
    .getVoices();


  /* =========================================
     REVEAL COMMAND DETECTION
  ========================================= */

  function isRevealCommand(message) {

    const 
      text =
        String(message || "")
          .toLowerCase()
          .trim();


    const revealKeywords = [

      "अपने दर्शन",
      "दर्शन कराओ",
      "दर्शन तो कराओ",
      "अपना चेहरा",
      "चेहरा तो दिखाओ",
      "चेहरा दिखाओ",
      "खुद को दिखाओ",
      "तुम्हें देखना चाहते",
      "तुम्हारा चेहरा",
      "show yourself",
      "show your face",
      "show yourself av",
      "reveal yourself",
      "reveal av"

    ];


    return revealKeywords.some(
      function (keyword) {

        return text.includes(
          keyword
        );

      }
    );

  }


  /* =========================================
     REVEAL STATE
  ========================================= */

  function triggerReveal() {

    console.log(
      "✨ AV → REVEAL TRIGGERED"
    );


    setState("reveal");


    /*
      Keep reveal state visible
      briefly before normal flow.
    */

    setTimeout(function () {

      if (!isSpeaking &&
          !isListening) {

        setState("standby");

      }

    }, 3500);

  }


  /* =========================================
     PROCESS MESSAGE
  ========================================= */

  async function processVoiceMessage(
    message
  ) {

    const original =
      String(message || "")
        .trim();


    if (!original) {
      return;
    }


    console.log(
      "🎤 AV USER →",
      original
    );


    /*
      Reveal command detection.
    */

    if (
      isRevealCommand(
        original
      )
    ) {

      triggerReveal();

    }


    /*
      AI processing starts.
    */

    setState("thinking");


    try {

      const result =
        await window.VYRA_MASTER
          .process(
            original
          );


      console.log(
        "🧠 AV AI RESULT →",
        result
      );


      let reply = "";


      if (result?.reply) {

        reply =
          result.reply;

      } else if (
        result?.message
      ) {

        reply =
          result.message;

      }


      if (!reply) {

        console.error(
          "AV SPEECH → Empty AI response."
        );

        setState("standby");

        return;

      }


      console.log(
        "💜 AV →",
        reply
      );


      /*
        Browser speaks the response.
      */

      await speak(
        reply
      );


    } catch (error) {

      console.error(
        "AV SPEECH ERROR:",
        error
      );


      setState("standby");

    }

  }


  /* =========================================
     START LISTENING
  ========================================= */

  function startListening() {

    if (isSpeaking) {

      console.log(
        "AV SPEECH → Stopping current speech."
      );

      stopSpeaking();

    }


    if (
      isListening ||
      recognitionActive
    ) {

      console.log(
        "AV SPEECH → Already listening."
      );

      return;

    }


    try {

      recognition.lang =
        "en-IN";


      recognition.start();


      recognitionActive =
        true;


    } catch (error) {

      console.warn(
        "AV SPEECH START:",
        error
      );

      recognitionActive =
        false;

    }

  }


  /* =========================================
     SPEECH RECOGNITION — START
  ========================================= */

  recognition.onstart =
    function () {

      isListening =
        true;

      recognitionActive =
        true;


      console.log(
        "🎤 AV → LISTENING"
      );


      setState(
        "listening"
      );

    };


  /* =========================================
     SPEECH RECOGNITION — RESULT
  ========================================= */

  recognition.onresult =
    function (event) {

      const lastResult =
        event.results[
          event.results.length - 1
        ];


      const transcript =
        lastResult[0]
          .transcript
          .trim();


      console.log(
        "🎤 AV HEARD →",
        transcript
      );


      if (!transcript) {

        setState(
          "standby"
        );

        return;

      }


      setState(
        "thinking"
      );


      processVoiceMessage(
        transcript
      );

    };


  /* =========================================
     SPEECH RECOGNITION — END
  ========================================= */

  recognition.onend =
    function () {

      isListening =
        false;

      recognitionActive =
        false;


      console.log(
        "🎤 AV → LISTENING ENDED"
      );


      if (!isSpeaking) {

        console.log(
          "AV → Recognition ended."
        );

      }

    };


  /* =========================================
     SPEECH RECOGNITION — ERROR
  ========================================= */

  recognition.onerror =
    function (event) {

      isListening =
        false;

      recognitionActive =
        false;


      console.error(
        "AV SPEECH RECOGNITION ERROR:",
        event.error
      );


      if (
        event.error ===
        "not-allowed"
      ) {

        console.warn(
          "AV → Microphone permission denied."
        );

      }


      if (
        event.error ===
        "no-speech"
      ) {

        console.log(
          "AV → No speech detected."
        );

      }


      if (
        event.error ===
        "aborted"
      ) {

        console.log(
          "AV → Recognition aborted."
        );

      }


      if (!isSpeaking) {

        setState(
          "standby"
        );

      }

    };


  /* =========================================
     MICROPHONE BUTTON
  ========================================= */

  micButton.addEventListener(
    "click",
    function () {

      console.log(
        "🎤 AV MIC → CLICK"
      );


      startListening();

    }
  );


  /* =========================================
     OPTIONAL TEXT INPUT
  ========================================= */

  if (
    sendButton &&
    input
  ) {

    sendButton.addEventListener(
      "click",
      async function () {

        const message =
          input.value.trim();


        if (!message) {
          return;
        }


        input.value =
          "";


        await processVoiceMessage(
          message
        );

      }
    );


    input.addEventListener(
      "keydown",
      function (event) {

        if (
          event.key ===
          "Enter"
        ) {

          event.preventDefault();


          const message =
            input.value.trim();


          if (!message) {
            return;
          }


          input.value =
            "";


          processVoiceMessage(
            message
          );

        }

      }
    );

  }


  /* =========================================
     INITIAL STATE
  ========================================= */

  setState(
    "standby"
  );


  console.log(
    "================================="
  );

  console.log(
    "AV SPEECH SYSTEM: ONLINE"
  );

  console.log(
    "AV BROWSER TTS: CONNECTED"
  );

  console.log(
    "AV UI STATES: READY"
  );

  console.log(
    "================================="
  );

});
