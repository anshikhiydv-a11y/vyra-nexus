/* =========================================
   AV — APP CONTROLLER
   Browser Speech Edition v3.0

   Speech Recognition
   Browser Speech Synthesis
   Master Core
   Memory
   AV UI States

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

  /* =========================================
     MASTER CORE CHECK
  ========================================= */

  if (!window.VYRA_MASTER) {

    console.error(
      "AV → Master Core not found."
    );

    if (window.AV_UI) {
      window.AV_UI.setState("standby");
    }

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
  console.log("=================================");


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


  recognition.continuous = false;

  recognition.interimResults = false;

  recognition.lang = "en-IN";


  /* =========================================
     STATE VARIABLES
  ========================================= */

  let isListening = false;

  let isSpeaking = false;

  let recognitionActive = false;

  let currentUtterance = null;


  /* =========================================
     UI STATE
  ========================================= */

  function setState(state) {

    const normalized =
      String(state || "standby")
        .toLowerCase();


    if (window.AV_UI &&
        typeof window.AV_UI.setState === "function") {

      window.AV_UI.setState(
        normalized
      );

    } else {

      console.log(
        "AV UI STATE →",
        normalized
      );
    }

  }


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

    currentUtterance = null;

    isSpeaking = false;

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


    /*
      Prefer Indian English voices.
    */

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
        voices.find(function (item) {

          return item.name
            .toLowerCase()
            .includes(
              preferredName.toLowerCase()
            );

        });


      if (voice) {
        return voice;
      }

    }


    /*
      Next preference:
      Indian English / Hindi.
    */

    const indianVoice =
      voices.find(function (voice) {

        const language =
          String(
            voice.lang || ""
          ).toLowerCase();

        return (
          language === "en-in" ||
          language === "hi-in"
        );

      });


    if (indianVoice) {
      return indianVoice;
    }


    /*
      Final fallback:
      English voice.
    */

    const englishVoice =
      voices.find(function (voice) {

        return String(
          voice.lang || ""
        )
        .toLowerCase()
        .startsWith("en");

      });


    return englishVoice || voices[0];

  }


  /* =========================================
     BROWSER TTS
  ========================================= */

  function speak(text) {

    return new Promise(function (resolve) {

      const cleanText =
        cleanSpeechText(text);


      if (!cleanText) {

        console.warn(
          "AV SPEECH → Empty response."
        );

        setState("standby");

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

        setState("standby");

        resolve();

        return;
      }


      console.log(
        "🔊 AV SPEECH → Speaking:",
        cleanText
      );


      setState("speaking");


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


      /*
        Indian English friendly settings.
        Browser/voice may interpret these differently.
      */

      utterance.lang =
        voice?.lang || "en-IN";


      utterance.rate =
        0.95;


      utterance.pitch =
        1.05;


      utterance.volume =
        1.0;


      utterance.onstart =
        function () {

          isSpeaking = true;

          console.log(
            "🔊 AV SPEECH → SPEAKING"
          );

          setState("speaking");

        };


      utterance.onend =
        function () {

          console.log(
            "🔊 AV SPEECH → FINISHED"
          );

          isSpeaking = false;

          currentUtterance =
            null;


          if (!isListening) {

            setState("standby");

          }


          resolve();

        };


      utterance.onerror =
        function (event) {

          console.error(
            "AV SPEECH SYNTHESIS ERROR:",
            event.error
          );

          isSpeaking = false;

          currentUtterance =
            null;

          setState("standby");

          resolve();

        };


      /*
        Some Android browsers need a
        small delay before speaking.
      */

      setTimeout(function () {

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

          isSpeaking = false;

          currentUtterance =
            null;

          setState("standby");

          resolve();

        }

      }, 80);

    });

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


  /*
    Initial voice loading attempt.
  */

  window.speechSynthesis
    .getVoices();


  /* =========================================
     REVEAL COMMAND DETECTION
  ========================================= */

  function isRevealCommand(message) {

    const text =
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

      /*
        Future avatar system will be
        connected here.

        For now the Core simply returns
        to standby.
      */

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
      Reveal command is detected
      before normal processing.
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

    /*
      If AV is speaking,
      stop it first.
    */

    if (isSpeaking) {

      console.log(
        "AV SPEECH → Stopping current speech."
      );

      stopSpeaking();

    }


    /*
      Prevent duplicate recognition.start()
    */

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


      /*
        Recognition has heard the user.
        Move immediately to THINKING.
      */

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


      /*
        Don't overwrite SPEAKING state.
      */

      if (!isSpeaking) {

        /*
          processVoiceMessage() may already
          have moved the system to THINKING.
          Therefore we don't force standby
          here if an AI request is running.
        */

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
