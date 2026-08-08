/* =========================================
   VYRA NEXUS — MASTER AI CORE
   Version 1.0
========================================= */

(function () {

  "use strict";

  // =========================================
  // VYRA CONFIGURATION
  // =========================================

  const VYRA_CONFIG = {
    name: "VYRA",
    version: "1.0",
    userName: "Boss"
  };


  // =========================================
  // AGENT REGISTRY
  // =========================================
  // बाद में यहीं नए AI Agents जोड़ेंगे।

  const AGENTS = {

    chat: {
      name: "Chat Agent",
      status: "active",
      description: "General conversation and questions"
    },

    study: {
      name: "Study Agent",
      status: "planned",
      description: "Study and education"
    },

    story: {
      name: "Story Agent",
      status: "planned",
      description: "Story generation"
    },

    image: {
      name: "Image Agent",
      status: "planned",
      description: "Image generation"
    },

    video: {
      name: "Video Agent",
      status: "planned",
      description: "Video generation"
    },

    voice: {
      name: "Voice Agent",
      status: "planned",
      description: "Voice generation"
    },

    sound: {
      name: "Sound Agent",
      status: "planned",
      description: "Sound effect generation"
    },

    editing: {
      name: "Editing Agent",
      status: "planned",
      description: "Media editing and combining"
    },

    coding: {
      name: "Coding Agent",
      status: "planned",
      description: "Coding assistance"
    },

    presentation: {
      name: "Presentation Agent",
      status: "planned",
      description: "Presentation generation"
    },

    task: {
      name: "Task Agent",
      status: "planned",
      description: "Task execution"
    },

    memory: {
      name: "Memory Agent",
      status: "planned",
      description: "Memory management"
    }

  };


  // =========================================
  // MESSAGE CLASSIFIER
  // =========================================

  function classifyMessage(message) {

    const text = String(message || "").toLowerCase().trim();

    if (!text) {
      return "chat";
    }


    // Study

    if (
      text.includes("study") ||
      text.includes("पढ़ाई") ||
      text.includes("पढ़ना") ||
      text.includes("homework") ||
      text.includes("question")
    ) {
      return "study";
    }


    // Story

    if (
      text.includes("story") ||
      text.includes("कहानी") ||
      text.includes("स्टोरी")
    ) {
      return "story";
    }


    // Image

    if (
      text.includes("image") ||
      text.includes("photo") ||
      text.includes("picture") ||
      text.includes("इमेज") ||
      text.includes("फोटो")
    ) {
      return "image";
    }


    // Video

    if (
      text.includes("video") ||
      text.includes("वीडियो")
    ) {
      return "video";
    }


    // Voice

    if (
      text.includes("voice") ||
      text.includes("आवाज़") ||
      text.includes("आवाज")
    ) {
      return "voice";
    }


    // Sound

    if (
      text.includes("sound") ||
      text.includes("साउंड") ||
      text.includes("effect") ||
      text.includes("इफेक्ट")
    ) {
      return "sound";
    }


    // Coding

    if (
      text.includes("code") ||
      text.includes("coding") ||
      text.includes("javascript") ||
      text.includes("html") ||
      text.includes("css") ||
      text.includes("coding")
    ) {
      return "coding";
    }


    // Presentation

    if (
      text.includes("presentation") ||
      text.includes("ppt") ||
      text.includes("प्रेजेंटेशन")
    ) {
      return "presentation";
    }


    // Task

    if (
      text.includes("task") ||
      text.includes("काम करो") ||
      text.includes("काम करना")
    ) {
      return "task";
    }


    // Memory

    if (
      text.includes("remember") ||
      text.includes("याद रखो") ||
      text.includes("याद रखना")
    ) {
      return "memory";
    }


    // Default

    return "chat";
  }


  // =========================================
  // ROUTER
  // =========================================

  function route(message) {

    const agentId = classifyMessage(message);

    const agent = AGENTS[agentId];

    return {
      success: true,
      agentId: agentId,
      agentName: agent ? agent.name : "Chat Agent",
      status: agent ? agent.status : "active",
      originalMessage: message
    };
  }


  // =========================================
  // MASTER AI
  // =========================================

  function process(message) {

    const routing = route(message);

    console.log(
      "VYRA MASTER CORE →",
      routing.agentName
    );

    return routing;
  }


  // =========================================
  // AGENT STATUS
  // =========================================

  function getAgentStatus() {

    const result = {};

    Object.keys(AGENTS).forEach(function (key) {

      result[key] = {
        name: AGENTS[key].name,
        status: AGENTS[key].status
      };

    });

    return result;
  }


  // =========================================
  // REGISTER NEW AGENT
  // =========================================

  function registerAgent(id, config) {

    if (!id || !config) {
      return false;
    }

    AGENTS[id] = {
      name: config.name || id,
      status: config.status || "active",
      description: config.description || ""
    };

    console.log(
      "VYRA: New Agent Registered →",
      id
    );

    return true;
  }


  // =========================================
  // PUBLIC VYRA MASTER API
  // =========================================

  window.VYRA_MASTER = {

    config: VYRA_CONFIG,

    agents: AGENTS,

    classify: classifyMessage,

    route: route,

    process: process,

    getAgentStatus: getAgentStatus,

    registerAgent: registerAgent

  };


  // =========================================
  // COMPATIBILITY ALIASES
  // =========================================

  window.VYRAMaster = window.VYRA_MASTER;
  window.MasterCore = window.VYRA_MASTER;


  // =========================================
  // STARTUP
  // =========================================

  console.log("=================================");
  console.log("VYRA NEXUS MASTER CORE");
  console.log("Version:", VYRA_CONFIG.version);
  console.log("Status: ONLINE");
  console.log("Agents:", Object.keys(AGENTS).length);
  console.log("=================================");

})();
