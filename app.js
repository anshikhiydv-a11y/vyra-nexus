/* =========================================
   AV — APP CONTROLLER
   Simple Voice Conversation v1.0

   MIC
   SPEECH RECOGNITION
   MASTER CORE
   CHAT AGENT
   BROWSER SPEECH SYNTHESIS
========================================= */

document.addEventListener("DOMContentLoaded", function () {

  "use strict";

  console.log("=================================");
  console.log("AV VOICE SYSTEM: STARTING");
  console.log("=================================");


  /* =========================================
     ELEMENTS
  ========================================= */

  const micButton =
    document.querySelector(".mic");

  const input =
    document.querySelector(".command input");

  const sendButton =
    document.querySelector(".send");

  const messageBox =
    document.querySelector(".greeting p");


  /* =========================================
     BASIC CHECKS
  ========================================= */

  if (!micButton) {

    console.error(
      "AV → Microphone button not found."
    );

    return;
  }


  if (!window.VYRA_MASTER) {

    console.error(
      "AV → Master Core not found."
    );

    if (messageBox) {
      messageBox.textContent =
        "AV system connection error.";
    }

    return;
  }


  console.log(
    "✅ AV → Master Core connected."
  );


  /* =========================================
     SPEECH RECOGNITION
  ========================================= */

  const SpeechRecognition =
    window.SpeechRecognition ||
    window.webkitSpeechRecognition;


  if (!SpeechRecognition) {

    console.error(
      "AV → Speech Recognition is not supported."
    );

    if (messageBox) {
      messageBox.textContent =
        "Speech recognition is not supported in this browser.";
    }

    return;
  }


  const recognition =
    new SpeechRecognition();


  recognition.continuous = false;

  recognition.interimResults = false;

  recognition.lang = "en-IN";


  /* =========================================
     STATE
  ========================================= */

  let isListening = false;

  let isSpeaking = false;

  let currentUtterance = null;


  /* =========================================
     STATUS
  ========================================= */

  function setStatus(status) {

    console.log(
      "AV STATUS →",
      status
    );


    /*
      Support the current UI.
    */

    const statusElement =
      document.querySelector(
        ".ai-status p"
      );


    if (statusElement) {

      statusElement.textContent =
        status;

    }

  }


  /* =========================================
     CLEAN TEXT
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
     STOP SPEAKING
  ========================================= */

  function stopSpeaking() {

    try {

      window.speechSynthesis.cancel();

    } catch (error) {

      console.warn(
        "AV → Speech stop error:",
        error
      );

    }


    currentUtterance =
      null;

    isSpeaking =
      false;

  }


  /* =========================================
     FIND BROWSER VOICE
  ========================================= */

  function getPreferredVoice() {

    const voices =
      window.speechSynthesis
        .getVoices();


    if (!voices.length) {
      return null;
    }


    /*
      Prefer Indian voices first.
    */

    const indianVoice =
      voices.find(
        function (voice) {

          const lang =
            String(
              voice.lang || ""
            ).toLowerCase();


          return (
            lang === "en-in" ||
            lang === "hi-in"
          );

        }
      );


    if (indianVoice) {
      return indianVoice;
    }


    /*
      Then any English voice.
    */

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


    return englishVoice || voices[0];

  }


  /* =========================================
     BROWSER TEXT TO SPEECH
  ========================================= */

  function speak(text) {

    return new Promise(
      function (resolve) {

        const cleanText =
          cleanSpeechText(text);


        if (!cleanText) {

          console.warn(
            "AV → Nothing to speak."
          );

          resolve();

          return;
        }


        stopSpeaking();


        if (
          !window.speechSynthesis
        ) {

          console.error(
            "AV → Browser TTS unavailable."
          );

          resolve();

          return;
        }


        console.log(
          "🔊 AV → Speaking:",
          cleanText
        );


        setStatus(
          "AV SPEAKING"
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

          utterance.lang =
            voice.lang;


          console.log(
            "🔊 AV VOICE →",
            voice.name,
            voice.lang
          );

        } else {

          utterance.lang =
            "en-IN";

        }


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

            setStatus(
              "AV SPEAKING"
            );

          };


        utterance.onend =
          function () {

            console.log(
              "🔊 AV → Speech finished."
            );


            isSpeaking =
              false;

            currentUtterance =
              null;


            if (!isListening) {

              setStatus(
                "AV ONLINE"
              );

            }


            resolve();

          };


        utterance.onerror =
          function (event) {

            console.error(
              "AV TTS ERROR:",
              event.error
            );


            isSpeaking =
              false;

            currentUtterance =
              null;


            setStatus(
              "AV ONLINE"
            );


            resolve();

          };


        /*
          Small delay helps some
          Android browsers.
        */

        setTimeout(
          function () {

            try {

              window.speechSynthesis
                .speak(
                  utterance
                );

            } catch (error) {

              console.error(
                "AV TTS START ERROR:",
                error
              );


              isSpeaking =
                false;

              currentUtterance =
                null;


              setStatus(
                "AV ONLINE"
              );


              resolve();

            }

          },
          100
        );

      }
    );

  }


  /* =========================================
     LOAD VOICES
  ========================================= */

  if (
    window.speechSynthesis
  ) {

    window.speechSynthesis
      .getVoices();


    window.speechSynthesis
      .onvoiceschanged =
      function () {

        const voices =
          window.speechSynthesis
            .getVoices();


        console.log(
          "🔊 AV → Voices loaded:",
          voices.length
        );

      };

  }


  /* =========================================
     PROCESS MESSAGE
  ========================================= */

  async function processMessage(
    message
  ) {

    const text =
      String(message || "")
        .trim();


    if (!text) {
      return;
    }


    console.log(
      "🎤 AV USER →",
      text
    );


    /*
      AI is thinking.
    */

    setStatus(
      "THINKING"
    );


    try {

      console.log(
        "🧠 AV → Sending to Master Core..."
      );


      const result =
        await window.VYRA_MASTER
          .process(
            text
          );


      console.log(
        "🧠 AV → Master result:",
        result
      );


      let reply =
        "";


      if (
        result &&
        result.reply
      ) {

        reply =
          result.reply;

      } else if (
        result &&
        result.message
      ) {

        reply =
          result.message;

      }


      if (!reply) {

        console.error(
          "AV → Empty AI reply."
        );


        setStatus(
          "AV ONLINE"
        );


        return;
      }


      console.log(
        "💜 AV →",
        reply
      );


      /*
        Now speak the reply.
      */

      await speak(
        reply
      );


    } catch (error) {

      console.error(
        "❌ AV MESSAGE ERROR:",
        error
      );


      setStatus(
        "AV ONLINE"
      );


      if (messageBox) {

        messageBox.textContent =
          "AV connection में problem आ गई।";

      }

    }

  }


  /* =========================================
     START LISTENING
  ========================================= */

  function startListening() {

    /*
      Stop current speech first.
    */

    if (isSpeaking) {

      stopSpeaking();

    }


    if (isListening) {

      console.log(
        "AV → Already listening."
      );

      return;

    }


    try {

      recognition.lang =
        "en-IN";


      recognition.start();

    } catch (error) {

      console.warn(
        "AV → Recognition start:",
        error
      );

    }

  }


  /* =========================================
     RECOGNITION START
  ========================================= */

  recognition.onstart =
    function () {

      isListening =
        true;


      console.log(
        "🎤 AV → LISTENING"
      );


      setStatus(
        "LISTENING"
      );

    };


  /* =========================================
     RECOGNITION RESULT
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

        setStatus(
          "AV ONLINE"
        );

        return;
      }


      /*
        Stop listening state.
      */

      isListening =
        false;


      /*
        Process with AI.
      */

      processMessage(
        transcript
      );

    };


  /* =========================================
     RECOGNITION END
  ========================================= */

  recognition.onend =
    function () {

      isListening =
        false;


      console.log(
        "🎤 AV → Listening ended."
      );


      if (!isSpeaking) {

        /*
          Don't immediately overwrite
          THINKING if AI is processing.
        */

        console.log(
          "AV → Waiting for response..."
        );

      }

    };


  /* =========================================
     RECOGNITION ERROR
  ========================================= */

  recognition.onerror =
    function (event) {

      isListening =
        false;


      console.error(
        "❌ AV MIC ERROR:",
        event.error
      );


      setStatus(
        "AV ONLINE"
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

    };


  /* =========================================
     MIC BUTTON
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
     TEXT SEND
  ========================================= */

  if (
    sendButton &&
    input
  ) {

    sendButton.addEventListener(
      "click",
      function () {

        const message =
          input.value.trim();


        if (!message) {
          return;
        }


        input.value =
          "";


        processMessage(
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


          processMessage(
            message
          );

        }

      }
    );

  }


  /* =========================================
     INITIAL STATE
  ========================================= */

  setStatus(
    "AV ONLINE"
  );


  console.log(
    "================================="
  );

  console.log(
    "✅ AV VOICE SYSTEM: ONLINE"
  );

  console.log(
    "✅ Browser Speech Recognition: READY"
  );

  console.log(
    "✅ Browser Speech Synthesis: READY"
  );

  console.log(
    "================================="

  );

});
