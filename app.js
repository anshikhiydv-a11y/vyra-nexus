/* =========================================
   AV — APP CONTROLLER
   Safe Voice Conversation v2.0

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

  const statusElement =
    document.querySelector(".ai-status p");


  /* =========================================
     BASIC MIC CHECK
  ========================================= */

  if (!micButton) {

    console.error(
      "❌ AV → Microphone button not found."
    );

    return;
  }

  console.log(
    "✅ AV → Microphone button found."
  );


  /* =========================================
     SPEECH RECOGNITION
  ========================================= */

  const SpeechRecognition =
    window.SpeechRecognition ||
    window.webkitSpeechRecognition;


  if (!SpeechRecognition) {

    console.error(
      "❌ AV → Speech Recognition not supported."
    );

    if (messageBox) {
      messageBox.textContent =
        "Speech recognition is not supported.";
    }

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
     STATE
  ========================================= */

  let isListening =
    false;

  let isSpeaking =
    false;

  let recognitionActive =
    false;

  let currentUtterance =
    null;


  /* =========================================
     STATUS
  ========================================= */

  function setStatus(status) {

    console.log(
      "AV STATUS →",
      status
    );


    if (statusElement) {

      statusElement.textContent =
        status;

    }

  }


  /* =========================================
     CLEAN SPEECH TEXT
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

      if (
        window.speechSynthesis
      ) {

        window.speechSynthesis.cancel();

      }

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

    if (
      !window.speechSynthesis
    ) {

      return null;

    }


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

            return String(
              item.name || ""
            )
            .toLowerCase()
            .includes(
              preferredName.toLowerCase()
            );

          }
        );


      if (voice) {

        return voice;

      }

    }


    /* Indian voices */

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


    /* Any English voice */

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
     BROWSER TEXT TO SPEECH
  ========================================= */

  function speak(text) {

    return new Promise(
      function (resolve) {

        const cleanText =
          cleanSpeechText(text);


        if (!cleanText) {

          setStatus(
            "AV ONLINE"
          );

          resolve();

          return;

        }


        stopSpeaking();


        if (
          !window.speechSynthesis
        ) {

          console.error(
            "❌ AV → Browser TTS unavailable."
          );

          setStatus(
            "AV ONLINE"
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
              "❌ AV TTS ERROR:",
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


        setTimeout(
          function () {

            try {

              window.speechSynthesis
                .speak(
                  utterance
                );

            } catch (error) {

              console.error(
                "❌ AV TTS START ERROR:",
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
     LOAD BROWSER VOICES
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


    /* =====================================
       MASTER CORE CHECK
    ===================================== */

    if (
      !window.VYRA_MASTER ||
      typeof window.VYRA_MASTER.process !==
        "function"
    ) {

      console.error(
        "❌ AV → Master Core is not connected."
      );


      setStatus(
        "CORE ERROR"
      );


      if (messageBox) {

        messageBox.textContent =
          "AV Master Core connection error.";

      }


      return;

    }


    console.log(
      "✅ AV → Master Core available."
    );


    /* =====================================
       THINKING
    ===================================== */

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
          "❌ AV → Empty AI reply."
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


      await speak(
        reply
      );


    } catch (error) {

      console.error(
        "❌ AV MESSAGE ERROR:",
        error
      );


      setStatus(
        "CORE ERROR"
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

    /* Stop current speech */

    if (isSpeaking) {

      console.log(
        "🔊 AV → Stopping current speech."
      );

      stopSpeaking();

    }


    /* Prevent duplicate start */

    if (
      isListening ||
      recognitionActive
    ) {

      console.log(
        "🎤 AV → Already listening."
      );

      return;

    }


    try {

      recognition.lang =
        "en-IN";


      recognition.start();


      recognitionActive =
        true;


      console.log(
        "🎤 AV → Recognition starting..."
      );

    } catch (error) {

      recognitionActive =
        false;


      console.error(
        "❌ AV → Recognition start error:",
        error
      );


      setStatus(
        "AV ONLINE"
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

      recognitionActive =
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


      isListening =
        false;


      recognitionActive =
        false;


      console.log(
        "🧠 AV → Moving to THINKING..."
      );


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

      recognitionActive =
        false;


      console.log(
        "🎤 AV → Listening ended."
      );


      /*
        Do NOT change THINKING or SPEAKING
        here.
      */

    };


  /* =========================================
     RECOGNITION ERROR
  ========================================= */

  recognition.onerror =
    function (event) {

      isListening =
        false;

      recognitionActive =
        false;


      console.error(
        "❌ AV MIC ERROR:",
        event.error
      );


      if (
        event.error ===
        "not-allowed"
      ) {

        setStatus(
          "MIC PERMISSION ERROR"
        );

      } else if (
        event.error ===
        "no-speech"
      ) {

        setStatus(
          "NO SPEECH"
        );

      } else {

        setStatus(
          "MIC ERROR"
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
     INITIAL STATUS
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
    "✅ Speech Recognition: READY"
  );

  console.log(
    "✅ Browser TTS: READY"
  );

  console.log(
    "================================="

  );

});
