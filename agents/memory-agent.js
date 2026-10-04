/* =========================================
   VYRA NEXUS — MEMORY AGENT
   Version 2.0

   Persistent Memory
   Important Memory
   Relevant Memory Search
   Recent Conversation
========================================= */

(function () {

  "use strict";


  const MEMORY_CONFIG = {

    name: "Memory Agent",

    version: "2.0",

    status: "active",

    /*
      IMPORTANT:
      Keep the old storage key.
      This preserves existing memories.
    */

    storageKey: "VYRA_MEMORY_CORE",

    maxMessages: 300,

    recentLimit: 20,

    relevantLimit: 12

  };


  /* =========================================
     LOAD MEMORY
  ========================================= */

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


  /* =========================================
     SAVE MEMORY
  ========================================= */

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


  /* =========================================
     MEMORY IMPORTANCE DETECTION
  ========================================= */

  function detectImportance(
    role,
    message
  ) {

    const text =
      String(message || "")
        .toLowerCase();


    if (role !== "user") {

      return false;

    }


    const importantPatterns = [

      "my name is",
      "mera naam",
      "मेरा नाम",

      "my favorite",
      "my favourite",
      "meri favourite",
      "meri favorite",
      "मेरी फेवरेट",
      "मेरा पसंदीदा",

      "i like",
      "i love",
      "mujhe pasand",
      "mujhe पसंद",
      "मुझे पसंद",

      "i prefer",
      "i want",
      "i use",
      "i have",

      "मुझे चाहिए",
      "मुझे पसंद है",
      "मैं पसंद करता",
      "मैं पसंद करती",

      "remember this",
      "remember that",
      "याद रखना",
      "याद रखो",

      "important",
      "जरूरी",
      "ज़रूरी",

      "my project",
      "mera project",
      "मेरा प्रोजेक्ट",

      "my channel",
      "mera channel",
      "मेरा चैनल"

    ];


    return importantPatterns.some(
      function (pattern) {

        return text.includes(
          pattern
        );

      }
    );

  }


  /* =========================================
     ADD MEMORY
  ========================================= */

  function remember(
    role,
    message
  ) {

    if (!message) {

      return false;

    }


    const memory =
      loadMemory();


    const text =
      String(message).trim();


    if (!text) {

      return false;

    }


    /*
      Prevent exact duplicate messages
      from unnecessarily filling memory.
    */

    const last =
      memory[memory.length - 1];


    if (
      last &&
      last.role === (role || "user") &&
      last.message === text
    ) {

      return true;

    }


    const important =
      detectImportance(
        role || "user",
        text
      );


    memory.push({

      role:
        role || "user",

      message:
        text,

      timestamp:
        new Date().toISOString(),

      important:
        important

    });


    /*
      Keep a larger history than before.
    */

    const limitedMemory =
      memory.slice(
        -MEMORY_CONFIG.maxMessages
      );


    saveMemory(
      limitedMemory
    );


    console.log(
      "🧠 VYRA MEMORY → Saved:",
      text,
      important
        ? "⭐ IMPORTANT"
        : ""
    );


    return true;

  }


  /* =========================================
     GET ALL MEMORY
  ========================================= */

  function getMemory() {

    return loadMemory();

  }


  /* =========================================
     GET RECENT MEMORY
  ========================================= */

  function getRecentMemory(
    limit = MEMORY_CONFIG.recentLimit
  ) {

    const memory =
      loadMemory();


    return memory.slice(
      -Math.max(1, limit)
    );

  }


  /* =========================================
     NORMALIZE SEARCH TEXT
  ========================================= */

  function normalizeText(text) {

    return String(text || "")

      .toLowerCase()

      .replace(
        /[^\p{L}\p{N}\s]/gu,
        " "
      )

      .replace(
        /\s+/g,
        " "
      )

      .trim();

  }


  /* =========================================
     SEARCH WORDS
  ========================================= */

  function getWords(text) {

    const normalized =
      normalizeText(text);


    if (!normalized) {

      return [];

    }


    return normalized
      .split(" ")
      .filter(function (word) {

        return word.length >= 3;

      });

  }


  /* =========================================
     RELEVANT MEMORY SEARCH
  ========================================= */

  function getRelevantMemory(
    query,
    limit = MEMORY_CONFIG.relevantLimit
  ) {

    const memory =
      loadMemory();


    if (!memory.length) {

      return [];

    }


    const queryWords =
      getWords(query);


    if (!queryWords.length) {

      return [];

    }


    const scored =
      memory.map(
        function (item, index) {

          const memoryText =
            normalizeText(
              item.message
            );


          let score = 0;


          /*
            Word overlap.
          */

          queryWords.forEach(
            function (word) {

              if (
                memoryText.includes(
                  word
                )
              ) {

                score += 2;

              }

            }
          );


          /*
            Important memories get
            a strong priority.
          */

          if (item.important) {

            score += 3;

          }


          /*
            Newer memories get
            a small advantage.
          */

          score +=
            index /
            Math.max(
              1,
              memory.length
            );


          return {

            item:
              item,

            score:
              score

          };

        }
      );


    return scored

      .filter(function (entry) {

        return entry.score > 0;

      })

      .sort(
        function (a, b) {

          return b.score - a.score;

        }
      )

      .slice(
        0,
        Math.max(1, limit)
      )

      .map(
        function (entry) {

          return entry.item;

        }
      );

  }


  /* =========================================
     GET IMPORTANT MEMORY
  ========================================= */

  function getImportantMemory(
    limit = 20
  ) {

    const memory =
      loadMemory();


    return memory

      .filter(function (item) {

        return item.important === true;

      })

      .slice(
        -Math.max(1, limit)
      );

  }


  /* =========================================
     FORMAT MEMORY
  ========================================= */

  function formatMemory(
    memory
  ) {

    if (
      !Array.isArray(memory) ||
      !memory.length
    ) {

      return "";

    }


    return memory
      .map(function (item) {

        const label =
          item.role
            ? item.role.toUpperCase()
            : "MEMORY";


        return (
          label +
          ": " +
          item.message
        );

      })
      .join("\n");

  }


  /* =========================================
     BUILD CONTEXT
  ========================================= */

  function buildContext(
    limit = MEMORY_CONFIG.recentLimit
  ) {

    return formatMemory(
      getRecentMemory(limit)
    );

  }


  /* =========================================
     BUILD SMART CONTEXT
  ========================================= */

  function buildSmartContext(
    query
  ) {

    const important =
      getImportantMemory(15);


    const relevant =
      getRelevantMemory(
        query,
        MEMORY_CONFIG.relevantLimit
      );


    const recent =
      getRecentMemory(
        MEMORY_CONFIG.recentLimit
      );


    /*
      Combine memories without duplicates.
    */

    const combined = [];


    function addUnique(item) {

      if (!item) {
        return;
      }


      const exists =
        combined.some(
          function (existing) {

            return (
              existing.timestamp ===
              item.timestamp
            );

          }
        );


      if (!exists) {

        combined.push(item);

      }

    }


    important.forEach(addUnique);

    relevant.forEach(addUnique);

    recent.forEach(addUnique);


    return formatMemory(
      combined
    );

  }


  /* =========================================
     CLEAR MEMORY
  ========================================= */

  function clearMemory() {

    localStorage.removeItem(
      MEMORY_CONFIG.storageKey
    );


    console.log(
      "VYRA MEMORY → Cleared"
    );


    return true;

  }


  /* =========================================
     MEMORY STATUS
  ========================================= */

  function getStatus() {

    const memory =
      loadMemory();


    const important =
      memory.filter(
        function (item) {

          return item.important === true;

        }
      );


    return {

      active:
        true,

      messages:
        memory.length,

      important:
        important.length,

      storage:
        "localStorage",

      storageKey:
        MEMORY_CONFIG.storageKey

    };

  }


  /* =========================================
     PUBLIC API
  ========================================= */

  window.MemoryAgent = {

    config:
      MEMORY_CONFIG,

    remember:
      remember,

    getMemory:
      getMemory,

    getRecentMemory:
      getRecentMemory,

    getRelevantMemory:
      getRelevantMemory,

    getImportantMemory:
      getImportantMemory,

    buildContext:
      buildContext,

    buildSmartContext:
      buildSmartContext,

    clearMemory:
      clearMemory,

    getStatus:
      getStatus

  };


  /* =========================================
     STARTUP
  ========================================= */

  console.log(
    "🧠 VYRA MEMORY AGENT v2.0: ONLINE"
  );


  console.log(
    "🧠 Existing memories:",
    loadMemory().length
  );


})();
