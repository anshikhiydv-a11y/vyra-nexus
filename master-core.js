/* =========================================
   VYRA NEXUS — MASTER AI CORE
   Version 2.0
========================================= */

(function () {

  "use strict";


  // =========================================
  // VYRA CONFIG
  // =========================================

  const VYRA_CONFIG = {

    name: "VYRA",

    version: "2.0",

    userName: "Boss"

  };


  // =========================================
  // AGENT REGISTRY
  // =========================================

  const AGENTS = {

    chat: {
      name: "Chat Agent",
      status: "active",
      type: "conversation"
    },

    language: {
      name: "Language Agent",
      status: "active",
      type: "language"
    },

    story: {
      name: "Story Agent",
      status: "active",
      type: "creative"
    },

    image: {
      name: "Image Agent",
      status: "planned",
      type: "generation"
    },

    video: {
      name: "Video Agent",
      status: "planned",
      type: "generation"
    },

    voice: {
      name: "Voice Agent",
      status: "planned",
      type: "generation"
    },

    sound: {
      name: "Sound Agent",
      status: "planned",
      type: "generation"
    },

    editing: {
      name: "Editing Agent",
      status: "planned",
      type: "editing"
    },

    coding: {
      name: "Coding Agent",
      status: "planned",
      type: "development"
    },

    presentation: {
      name: "Presentation Agent",
      status: "planned",
      type: "generation"
    },

    task: {
      name: "Task Agent",
      status: "planned",
      type: "automation"
    },

    memory: {
      name: "Memory Agent",
      status: "active",
      type: "memory"
    }

  };


  // =========================================
  // CHECK AVAILABLE AGENTS
  // =========================================

  function getAvailableAgents() {

    const available = {};

    Object.keys(AGENTS).forEach(function (id) {

      available[id] = AGENTS[id];

    });

    return available;

  }


  // =========================================
  // LANGUAGE ROUTING
  // =========================================

  function isLanguageRequest(message) {

    const text =
      String(message || "").toLowerCase();


    const keywords = [

      // English

      "learn english",
      "learn hindi",
      "learn spanish",
      "learn french",
      "learn japanese",
      "learn a language",
      "language learning",

      // Hindi

      "भाषा सीखना",
      "भाषा सिखाओ",
      "इंग्लिश सीखना",
      "अंग्रेजी सीखना",
      "हिंदी सीखना",
      "स्पेनिश सीखना",
      "फ्रेंच सीखना",
      "जापानी सीखना",

      // Hinglish

      "mujhe english sikhni hai",
      "mujhe hindi sikhni hai",
      "mujhe spanish sikhni hai",
      "mujhe french sikhni hai",
      "mujhe japanese sikhni hai",
      "language seekhni hai"

    ];


    return keywords.some(function (keyword) {

      return text.includes(keyword);

    });

  }


  // =========================================
  // CREATIVE ROUTING
  // =========================================

  function isStoryRequest(message) {

    const text =
      String(message || "").toLowerCase();


    return (

      text.includes("story") ||
      text.includes("कहानी") ||
      text.includes("स्टोरी") ||
      text.includes("story लिखो")

    );

  }


  // =========================================
  // IMAGE ROUTING
  // =========================================

  function isImageRequest(message) {

    const text =
      String(message || "").toLowerCase();


    return (

      text.includes("image") ||
      text.includes("picture") ||
      text.includes("photo") ||
      text.includes("इमेज") ||
      text.includes("फोटो") ||
      text.includes("तस्वीर")

    );

  }


  // =========================================
  // VIDEO ROUTING
  // =========================================

  function isVideoRequest(message) {

    const text =
      String(message || "").toLowerCase();


    return (

      text.includes("video") ||
      text.includes("वीडियो")

    );

  }


  // =========================================
  // CODING ROUTING
  // =========================================

  function isCodingRequest(message) {

    const text =
      String(message || "").toLowerCase();


    return (

      text.includes("code") ||
      text.includes("coding") ||
      text.includes("javascript") ||
      text.includes("html") ||
      text.includes("css") ||
      text.includes("कोड") ||
      text.includes("कोडिंग")

    );

  }


  // =========================================
  // PRESENTATION ROUTING
  // =========================================

  function isPresentationRequest(message) {

    const text =
      String(message || "").toLowerCase();


    return (

      text.includes("presentation") ||
      text.includes("ppt") ||
      text.includes("प्रेजेंटेशन")

    );

  }


  // =========================================
  // MAIN CLASSIFIER
  // =========================================

  function classifyMessage(message) {

    const text =
      String(message || "").trim();


    if (!text) {

      return "chat";

    }


    /*
      IMPORTANT:
      Language requests are checked first.
      This prevents messages such as
      "I want to learn English"
      from being routed to Chat Agent.
    */

    if (isLanguageRequest(text)) {

      return "language";

    }


    if (isStoryRequest(text)) {

      return "story";

    }


    if (isImageRequest(text)) {

      return "image";

    }


    if (isVideoRequest(text)) {

      return "video";

    }


    if (isCodingRequest(text)) {

      return "coding";

    }


    if (isPresentationRequest(text)) {

      return "presentation";

    }


    // Default

    return "chat";

  }


  // =========================================
  // ROUTER
  // =========================================

  function route(message) {

    const agentId =
      classifyMessage(message);


    const agent =
      AGENTS[agentId];


    return {

      success: true,

      agentId: agentId,

      agentName:
        agent
          ? agent.name
          : "Chat Agent",

      status:
        agent
          ? agent.status
          : "active",

      originalMessage:
        message

    };

  }


  // =========================================
  // EXECUTE ROUTE
  // =========================================

  async function process(message) {

    const routing =
      route(message);


    console.log(
      "VYRA MASTER CORE →",
      routing.agentName
    );


    // ---------------------------------------
    // LANGUAGE AGENT
    // ---------------------------------------

    if (
      routing.agentId === "language" &&
      window.LanguageAgent
    ) {

      return await window.LanguageAgent.handle(
        message
      );

    }

     // ---------------------------------------
// STORY AGENT
// ---------------------------------------

if (
  routing.agentId === "story" &&
  window.StoryAgent
) {

  return await window.StoryAgent.handle(
    message
  );

}

    // ---------------------------------------
    // CHAT AGENT
    // ---------------------------------------

    if (
      routing.agentId === "chat" &&
      window.ChatAgent
    ) {

      return await window.ChatAgent.handle(
        message
      );

    }


    // ---------------------------------------
    // FUTURE AGENTS
    // ---------------------------------------

    return {

      success: true,

      agentId:
        routing.agentId,

      agentName:
        routing.agentName,

      status:
        routing.status,

      message:
        routing.agentName +
        " is not connected yet."

    };

  }


  // =========================================
  // AGENT STATUS
  // =========================================

  function getAgentStatus() {

    const result = {};


    Object.keys(AGENTS).forEach(function (id) {

      result[id] = {

        name:
          AGENTS[id].name,

        status:
          AGENTS[id].status,

        connected:
          checkAgentConnection(id)

      };

    });


    return result;

  }


  // =========================================
  // CONNECTION CHECK
  // =========================================

  function checkAgentConnection(id) {

    switch (id) {

      case "chat":

        return !!window.ChatAgent;


      case "language":

  return !!window.LanguageAgent;


case "story":

  return !!window.StoryAgent;


case "memory":

  return !!window.MemoryAgent;


default:

  return false;
    }

  }


  // =========================================
  // REGISTER NEW AGENT
  // =========================================

  function registerAgent(id, config) {

    if (!id || !config) {

      return false;

    }


    AGENTS[id] = {

      name:
        config.name || id,

      status:
        config.status || "active",

      type:
        config.type || "general"

    };


    console.log(
      "VYRA: Agent Registered →",
      id
    );


    return true;

  }


  // =========================================
  // PUBLIC MASTER API
  // =========================================

  window.VYRA_MASTER = {

    config:
      VYRA_CONFIG,

    agents:
      AGENTS,

    classify:
      classifyMessage,

    route:
      route,

    process:
      process,

    getAgentStatus:
      getAgentStatus,

    getAvailableAgents:
      getAvailableAgents,

    checkAgentConnection:
      checkAgentConnection,

    registerAgent:
      registerAgent

  };


  // =========================================
  // COMPATIBILITY
  // =========================================

  window.VYRAMaster =
    window.VYRA_MASTER;


  window.MasterCore =
    window.VYRA_MASTER;


  // =========================================
  // STARTUP
  // =========================================

  console.log(
    "================================="
  );

  console.log(
    "VYRA NEXUS MASTER CORE"
  );

  console.log(
    "Version:",
    VYRA_CONFIG.version
  );

  console.log(
    "Status: ONLINE"
  );

  console.log(
    "Chat Agent:",
    checkAgentConnection("chat")
      ? "CONNECTED"
      : "NOT FOUND"
  );

  console.log(
    "Language Agent:",
    checkAgentConnection("language")
      ? "CONNECTED"
      : "NOT FOUND"
  );

  console.log(
    "================================="
  );

})();
