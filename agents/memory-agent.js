/* =========================================
   VYRA NEXUS — MEMORY AGENT
   Version 1.0
========================================= */

(function () {

  "use strict";

  const MEMORY_CONFIG = {

    name: "Memory Agent",

    version: "1.0",

    status: "active",

    storageKey: "VYRA_MEMORY_CORE"

  };


  // =========================================
  // LOAD MEMORY
  // =========================================

  function loadMemory() {

    try {

      const saved =
        localStorage.getItem(
          MEMORY_CONFIG.storageKey
        );

      if (!saved) {

        return [];

      }

      const memory =
        JSON.parse(saved);

      return Array.isArray(memory)
        ? memory
        : [];

    }

    catch (error) {

      console.error(
        "VYRA MEMORY LOAD ERROR:",
        error
      );

      return [];

    }

  }


  // =========================================
  // SAVE MEMORY
  // =========================================

  function saveMemory(memory) {

    try {

      localStorage.setItem(

        MEMORY_CONFIG.storageKey,

        JSON.stringify(memory)

      );

      return true;

    }

    catch (error) {

      console.error(
        "VYRA MEMORY SAVE ERROR:",
        error
      );

      return false;

    }

  }


  // =========================================
  // ADD MEMORY
  // =========================================

  function remember(role, message) {

    if (!message) {

      return false;

    }

    const memory =
      loadMemory();


    memory.push({

      role:
        role || "user",

      message:
        String(message),

      timestamp:
        new Date().toISOString()

    });


    // Keep latest 100 messages

    const limitedMemory =
      memory.slice(-100);


    saveMemory(
      limitedMemory
    );


    console.log(
      "VYRA MEMORY → Saved:",
      message
    );


    return true;

  }


  // =========================================
  // GET MEMORY
  // =========================================

  function getMemory() {

    return loadMemory();

  }


  // =========================================
  // GET RECENT MEMORY
  // =========================================

  function getRecentMemory(limit = 20) {

    const memory =
      loadMemory();

    return memory.slice(
      -Math.max(1, limit)
    );

  }


  // =========================================
  // BUILD CONTEXT
  // =========================================

  function buildContext(limit = 20) {

    const memory =
      getRecentMemory(limit);


    if (!memory.length) {

      return "";

    }


    return memory
      .map(function (item) {

        return (

          item.role.toUpperCase() +
          ": " +
          item.message

        );

      })
      .join("\n");

  }


  // =========================================
  // CLEAR MEMORY
  // =========================================

  function clearMemory() {

    localStorage.removeItem(
      MEMORY_CONFIG.storageKey
    );

    console.log(
      "VYRA MEMORY → Cleared"
    );

    return true;

  }


  // =========================================
  // MEMORY STATUS
  // =========================================

  function getStatus() {

    const memory =
      loadMemory();


    return {

      active: true,

      messages:
        memory.length,

      storage:
        "localStorage"

    };

  }


  // =========================================
  // PUBLIC MEMORY API
  // =========================================

  window.MemoryAgent = {

    config:
      MEMORY_CONFIG,

    remember:
      remember,

    getMemory:
      getMemory,

    getRecentMemory:
      getRecentMemory,

    buildContext:
      buildContext,

    clearMemory:
      clearMemory,

    getStatus:
      getStatus

  };


  // =========================================
  // STARTUP
  // =========================================

  console.log(
    "🧠 VYRA MEMORY AGENT: ONLINE"
  );

})();
