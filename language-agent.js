/* =========================================
   VYRA NEXUS — LANGUAGE AGENT
   Version 1.0
========================================= */

const LanguageAgent = {

  name: "Language Agent",

  version: "1.0",

  // =========================================
  // SUPPORTED LANGUAGES
  // =========================================

  languages: {

    hi: {
      name: "Hindi",
      nativeName: "हिन्दी",
      status: "active"
    },

    en: {
      name: "English",
      nativeName: "English",
      status: "active"
    },

    hinglish: {
      name: "Hinglish",
      nativeName: "Hinglish",
      status: "active"
    },

    es: {
      name: "Spanish",
      nativeName: "Español",
      status: "planned"
    },

    fr: {
      name: "French",
      nativeName: "Français",
      status: "planned"
    },

    ja: {
      name: "Japanese",
      nativeName: "日本語",
      status: "planned"
    }

  },


  // =========================================
  // LANGUAGE DETECTION
  // =========================================

  detect(message) {

    const text = String(message || "").trim();

    if (!text) {
      return "unknown";
    }


    // Hindi characters

    const hasHindi =
      /[\u0900-\u097F]/.test(text);


    // Japanese characters

    const hasJapanese =
      /[\u3040-\u30FF\u4E00-\u9FFF]/.test(text);


    // Spanish/French basic detection
    // This is intentionally simple for now.

    const spanishWords = [
      "hola",
      "gracias",
      "cómo",
      "como",
      "quiero",
      "puedo"
    ];

    const frenchWords = [
      "bonjour",
      "merci",
      "comment",
      "je",
      "vous"
    ];


    const lower =
      text.toLowerCase();


    const hasSpanish =
      spanishWords.some(word =>
        lower.includes(word)
      );


    const hasFrench =
      frenchWords.some(word =>
        lower.includes(word)
      );


    // Japanese first

    if (hasJapanese) {
      return "ja";
    }


    if (hasSpanish) {
      return "es";
    }


    if (hasFrench) {
      return "fr";
    }


    // Hindi + English = Hinglish

    if (
      hasHindi &&
      /[a-zA-Z]/.test(text)
    ) {
      return "hinglish";
    }


    if (hasHindi) {
      return "hi";
    }


    // Default Latin text → English

    if (/[a-zA-Z]/.test(text)) {
      return "en";
    }


    return "unknown";

  },


  // =========================================
  // LANGUAGE INFORMATION
  // =========================================

  getLanguageInfo(languageCode) {

    return (
      this.languages[languageCode] ||
      null
    );

  },


  // =========================================
  // LEARNING MODE
  // =========================================

  startLearning(languageCode) {

    const language =
      this.getLanguageInfo(languageCode);


    if (!language) {

      return {
        success: false,
        message:
          "This language is not registered yet."
      };

    }


    if (language.status === "planned") {

      return {
        success: false,
        message:
          language.name +
          " learning support is planned."
      };

    }


    return {
      success: true,
      mode: "learning",
      language: languageCode,
      message:
        "Language Learning Mode started."
    };

  },


  // =========================================
  // LEARNING COMMAND DETECTION
  // =========================================

  isLearningRequest(message) {

    const text =
      String(message || "").toLowerCase();


    const keywords = [

      "learn language",
      "learn english",
      "learn hindi",
      "learn spanish",
      "learn french",
      "learn japanese",

      "language सीखना",
      "भाषा सीखना",
      "इंग्लिश सीखना",
      "अंग्रेजी सीखना",
      "स्पेनिश सीखना",
      "फ्रेंच सीखना",
      "जापानी सीखना"

    ];


    return keywords.some(keyword =>
      text.includes(keyword)
    );

  },


  // =========================================
  // PROCESS LANGUAGE REQUEST
  // =========================================

  async handle(message) {

    const detected =
      this.detect(message);


    return {

      success: true,

      detectedLanguage:
        detected,

      languageInfo:
        this.getLanguageInfo(detected),

      isLearningRequest:
        this.isLearningRequest(message)

    };

  }

};


// =========================================
// GLOBAL REGISTRATION
// =========================================

window.LanguageAgent =
  LanguageAgent;


console.log(
  "VYRA Language Agent: ONLINE"
);
