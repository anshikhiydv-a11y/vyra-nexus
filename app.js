/* =========================================
   AV — APP CONTROLLER
   Speech-to-Speech Edition v2.0
   ElevenLabs TTS + Master Core + Memory
========================================= */

document.addEventListener("DOMContentLoaded", function () {

  "use strict";

  const input = document.querySelector(".command input");
  const sendButton = document.querySelector(".send");
  const micButton = document.querySelector(".mic");
  const messageBox = document.querySelector(".greeting p");

  if (!micButton) {
    console.error("AV SPEECH → Mic button not found.");
    return;
  }

  if (!window.VYRA_MASTER) {
    console.error("AV → Master Core not found.");

    if (messageBox) {
      messageBox.textContent = "AV system connection error.";
    }

    return;
  }

  console.log("=================================");
  console.log("AV SPEECH SYSTEM: INITIALIZING");
  console.log("Master Core: CONNECTED");
  console.log("ElevenLabs TTS: READY");
  console.log("=================================");

  const SpeechRecognition =
    window.SpeechRecognition ||
    window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    console.error("AV SPEECH → Speech Recognition not supported.");
    micButton.title = "Speech recognition is not supported";
    return;
  }

  const recognition = new SpeechRecognition();

  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.lang = "en-IN";

  let isListening = false;
  let isSpeaking = false;
  let currentAudio = null;
  let currentAudioUrl = null;

  /* =========================================
     CLEAN TEXT FOR SPEECH
  ========================================= */

  function cleanSpeechText(text) {
    return String(text || "")
      .replace(/```[\s\S]*?```/g, "")
      .replace(/<br\s*\/?>/gi, " ")
      .replace(/<[^>]*>/g, "")
      .replace(/\*\*/g, "")
      .replace(/\*/g, "")
      .replace(/#{1,6}\s/g, "")
      .replace(/^\s*[-•]\s*/gm, "")
      .replace(/\s+/g, " ")
      .trim();
  }

  /* =========================================
     STOP CURRENT AUDIO
  ========================================= */

  function stopCurrentAudio() {
    if (currentAudio) {
      try {
        currentAudio.pause();
        currentAudio.currentTime = 0;
      } catch (error) {
        console.warn("AV AUDIO STOP:", error);
      }

      currentAudio = null;
    }

    if (currentAudioUrl) {
      URL.revokeObjectURL(currentAudioUrl);
      currentAudioUrl = null;
    }

    isSpeaking = false;
  }

  /* =========================================
     ELEVENLABS TTS
  ========================================= */

  async function speak(text) {

    const cleanText = cleanSpeechText(text);

    if (!cleanText) {
      console.warn("AV TTS → Empty text.");
      return;
    }

    stopCurrentAudio();

    try {

      console.log("🔊 AV TTS → Requesting voice...");
      console.log("AV TTS → Text:", cleanText);

      setStatus("VYLEN SPEAKING");

      const response = await fetch("/api/tts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          text: cleanText
        })
      });

      console.log(
        "🔊 AV TTS → Response:",
        response.status
      );

      if (!response.ok) {

        let errorMessage = "Voice generation failed.";

        try {
          const data = await response.json();

          if (data?.error) {
            errorMessage = data.error;
          }

        } catch (error) {
          console.warn("AV TTS → Error response was not JSON.");
        }

        throw new Error(errorMessage);
      }

      const audioBlob = await response.blob();

      if (!audioBlob.size) {
        throw new Error("Empty audio received.");
      }

      currentAudioUrl = URL.createObjectURL(audioBlob);

      currentAudio = new Audio(currentAudioUrl);

      currentAudio.preload = "auto";
      currentAudio.volume = 1.0;

      currentAudio.onplay = function () {
        isSpeaking = true;

        console.log("🔊 AV TTS → SPEAKING");
        setStatus("VYLEN SPEAKING");
      };

      currentAudio.onended = function () {

        console.log("🔊 AV TTS → FINISHED");

        isSpeaking = false;

        if (currentAudioUrl) {
          URL.revokeObjectURL(currentAudioUrl);
          currentAudioUrl = null;
        }

        currentAudio = null;

        if (!isListening) {
          setStatus("STANDBY");
        }
      };

      currentAudio.onerror = function (error) {

        console.error(
          "AV AUDIO PLAYBACK ERROR:",
          error
        );

        isSpeaking = false;
        currentAudio = null;

        if (currentAudioUrl) {
          URL.revokeObjectURL(currentAudioUrl);
          currentAudioUrl = null;
        }

        setStatus("STANDBY");
      };

      const playPromise = currentAudio.play();

      if (playPromise !== undefined) {

        await playPromise;

        console.log("🔊 AV TTS → Playback started.");

      }

    } catch (error) {

      console.error("AV TTS ERROR:", error);

      isSpeaking = false;

      setStatus("STANDBY");

      if (messageBox) {
        messageBox.textContent =
          "AV voice service में थोड़ी problem आ गई।";
      }
    }
  }

  /* =========================================
     STATUS
  ========================================= */

  function setStatus(status) {

    const statusElements =
      document.querySelectorAll(".card p");

    statusElements.forEach(function (element) {

      const text =
        element.textContent.trim().toUpperCase();

      if (
        text === "STANDBY" ||
        text === "LISTENING" ||
        text === "THINKING" ||
        text === "VYRA SPEAKING" ||
        text === "VYLEN SPEAKING" ||
        text === "AV SPEAKING"
      ) {
        element.textContent = status;
      }

    });

    console.log("AV STATUS →", status);
  }

  /* =========================================
     HIDE CONVERSATION TEXT
  ========================================= */

  function hideConversationText() {

    if (!messageBox) return;

    messageBox.innerHTML =
      "Voice mode active. 🎙️";
  }

  /* =========================================
     PROCESS MESSAGE
  ========================================= */

  async function processVoiceMessage(message) {

    if (!message) return;

    console.log("AV SPEECH → USER:", message);

    setStatus("THINKING");

    try {

      const result =
        await window.VYRA_MASTER.process(message);

      console.log(
        "AV SPEECH → AI RESULT:",
        result
      );

      let reply = "";

      if (result?.reply) {
        reply = result.reply;
      } else if (result?.message) {
        reply = result.message;
      }

      if (!reply) {

        console.error(
          "AV SPEECH → Empty AI response."
        );

        setStatus("STANDBY");
        return;
      }

      hideConversationText();

      console.log("AV SPEECH → AV:", reply);

      await speak(reply);

    } catch (error) {

      console.error(
        "AV SPEECH ERROR:",
        error
      );

      setStatus("STANDBY");

      if (messageBox) {
        messageBox.textContent =
          "AV connection में थोड़ी problem आ गई।";
      }
    }
  }

  /* =========================================
     START LISTENING
  ========================================= */

  function startListening() {

    if (isListening) {

      console.log(
        "AV SPEECH → Already listening."
      );

      return;
    }

    if (isSpeaking) {
      stopCurrentAudio();
    }

    try {

      recognition.lang = "en-IN";

      recognition.start();

    } catch (error) {

      console.warn(
        "AV SPEECH START:",
        error
      );
    }
  }

  /* =========================================
     SPEECH RECOGNITION EVENTS
  ========================================= */

  recognition.onstart = function () {

    isListening = true;

    console.log(
      "🎤 AV SPEECH → LISTENING"
    );

    setStatus("LISTENING");
  };

  recognition.onresult = function (event) {

    const transcript =
      event.results[
        event.results.length - 1
      ][0].transcript.trim();

    console.log(
      "🎤 AV SPEECH → HEARD:",
      transcript
    );

    if (!transcript) {

      setStatus("STANDBY");

      return;
    }

    hideConversationText();

    processVoiceMessage(transcript);
  };

  recognition.onend = function () {

    isListening = false;

    console.log(
      "AV SPEECH → LISTENING ENDED"
    );

    if (!isSpeaking) {
      setStatus("STANDBY");
    }
  };

  recognition.onerror = function (event) {

    isListening = false;

    console.error(
      "AV SPEECH RECOGNITION ERROR:",
      event.error
    );

    setStatus("STANDBY");

    if (event.error === "not-allowed") {

      console.warn(
        "AV SPEECH → Microphone permission denied."
      );
    }

    if (event.error === "no-speech") {

      console.log(
        "AV SPEECH → No speech detected."
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
     TEXT SEND BUTTON
  ========================================= */

  if (sendButton && input) {

    sendButton.addEventListener(
      "click",
      async function () {

        const message =
          input.value.trim();

        if (!message) return;

        input.value = "";

        await processVoiceMessage(message);
      }
    );

    input.addEventListener(
      "keydown",
      function (event) {

        if (event.key === "Enter") {

          event.preventDefault();

          const message =
            input.value.trim();

          if (!message) return;

          input.value = "";

          processVoiceMessage(message);
        }
      }
    );
  }

  /* =========================================
     INITIAL STATE
  ========================================= */

  hideConversationText();

  setStatus("STANDBY");

  console.log(
    "AV SPEECH SYSTEM: ONLINE"
  );

  console.log(
    "AV ELEVENLABS TTS: CONNECTED"
  );

  console.log(
    "================================="
  );

});
