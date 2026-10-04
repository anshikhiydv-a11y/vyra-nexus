/* =========================================
   AV NEXUS — MEMORY AGENT
   Version 3.0

   Persistent Memory
   Structured Preferences
   Important Memory
   Relevant Memory Search
   Recent Conversation
   Legacy Memory Compatibility
========================================= */

(function () {

  "use strict";


  const MEMORY_CONFIG = {

    name: "Memory Agent",

    version: "3.0",

    status: "active",

    /*
      IMPORTANT:
      Keep the old storage key.
      This preserves existing memories.
    */

    storageKey: "VYRA_MEMORY_CORE",

    maxMessages: 300,

    recentLimit: 20,

    relevantLimit: 12,

    structuredLimit: 50

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


      if (!Array.isArray(memory)) {

        return [];

      }


      return memory.map(function (item) {

        return normalizeMemoryItem(item);

      });

    }

    catch (error) {

      console.error(
        "AV MEMORY LOAD ERROR:",
        error
      );

      return [];

    }

  }


  /* =========================================
     NORMALIZE OLD MEMORY
  ========================================= */

  function normalizeMemoryItem(item) {

    if (!item || typeof item !== "object") {

      return null;

    }


    return {

      role:
        item.role || "user",

      message:
        String(item.message || ""),

      timestamp:
        item.timestamp ||
        new Date().toISOString(),

      important:
        item.important === true,

      memoryType:
        item.memoryType || null,

      memoryKey:
        item.memoryKey || null,

      memoryValue:
        item.memoryValue || null

    };

  }


  /* =========================================
     CLEAN MEMORY ARRAY
  ========================================= */

  function cleanMemory(memory) {

    return memory.filter(function (item) {

      return (
        item &&
        typeof item.message === "string" &&
        item.message.trim()
      );

    });

  }


  /* =========================================
     SAVE MEMORY
  ========================================= */

  function saveMemory(memory) {

    try {

      const cleaned =
        cleanMemory(memory);


      const limited =
        cleaned.slice(
          -MEMORY_CONFIG.maxMessages
        );


      localStorage.setItem(

        MEMORY_CONFIG.storageKey,

        JSON.stringify(limited)

      );


      return true;

    }

    catch (error) {

      console.error(
        "AV MEMORY SAVE ERROR:",
        error
      );

      return false;

    }

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
     GET WORDS
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

        return word.length >= 2;

      });

  }


  /* =========================================
     IMPORTANCE DETECTION
  ========================================= */

  function detectImportance(
    role,
    message
  ) {

    if (role !== "user") {

      return false;

    }


    const text =
      normalizeText(message);


    const importantPatterns = [

      "my name is",
      "mera naam",
      "मेरा नाम",

      "my favorite",
      "my favourite",
      "meri favorite",
      "meri favourite",
      "meri favourite",
      "मेरी फेवरेट",
      "मेरा पसंदीदा",

      "my favourite",
      "my preferred",

      "i like",
      "i love",
      "i prefer",

      "mujhe pasand",
      "मुझे पसंद",
      "मुझे पसंद है",

      "i want",
      "i use",
      "i have",

      "mujhe chahiye",
      "मुझे चाहिए",

      "remember this",
      "remember that",
      "yaad rakhna",
      "yaad rakho",
      "याद रखना",
      "याद रखो",

      "important",
      "jaruri",
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
          normalizeText(pattern)
        );

      }
    );

  }


  /* =========================================
     STRUCTURED MEMORY DETECTION
  ========================================= */

  function detectStructuredMemory(
    message
  ) {

    const original =
      String(message || "").trim();


    const text =
      normalizeText(original);


    if (!text) {

      return null;

    }


    /* -----------------------------------------
       NAME
    ----------------------------------------- */

    let match =
      original.match(
        /(?:my name is|mera naam|मेरा नाम)\s*(?:hai|है|is)?\s*([^\n.!?,]+)/i
      );


    if (match && match[1]) {

      return {

        memoryType:
          "identity",

        memoryKey:
          "name",

        memoryValue:
          cleanValue(match[1])

      };

    }


    /* -----------------------------------------
       FAVORITE DRINK
    ----------------------------------------- */

    match =
      original.match(
        /(?:my favorite drink is|my favourite drink is|my fav(?:orite)? drink is|mera favorite drink|meri favorite drink|मेरा फेवरेट ड्रिंक|मेरी फेवरेट ड्रिंक|मेरा पसंदीदा ड्रिंक)\s*(?:is|hai|है)?\s*(.+?)(?:[.!?]|$)/i
      );


    if (match && match[1]) {

      return {

        memoryType:
          "preference",

        memoryKey:
          "favorite_drink",

        memoryValue:
          cleanValue(match[1])

      };

    }


    /* -----------------------------------------
       FAVORITE FOOD
    ----------------------------------------- */

    match =
      original.match(
        /(?:my favorite food is|my favourite food is|mera favorite food|meri favorite food|मेरा फेवरेट खाना|मेरी फेवरेट फूड|मेरा पसंदीदा खाना)\s*(?:is|hai|है)?\s*(.+?)(?:[.!?]|$)/i
      );


    if (match && match[1]) {

      return {

        memoryType:
          "preference",

        memoryKey:
          "favorite_food",

        memoryValue:
          cleanValue(match[1])

      };

    }


    /* -----------------------------------------
       FAVORITE GAME
    ----------------------------------------- */

    match =
      original.match(
        /(?:my favorite game is|my favourite game is|mera favorite game|meri favorite game|मेरा फेवरेट गेम|मेरा पसंदीदा गेम)\s*(?:is|hai|है)?\s*(.+?)(?:[.!?]|$)/i
      );


    if (match && match[1]) {

      return {

        memoryType:
          "preference",

        memoryKey:
          "favorite_game",

        memoryValue:
          cleanValue(match[1])

      };

    }


    /* -----------------------------------------
       FAVORITE COLOR
    ----------------------------------------- */

    match =
      original.match(
        /(?:my favorite color is|my favourite color is|mera favorite color|meri favorite color|मेरा फेवरेट कलर|मेरा पसंदीदा रंग)\s*(?:is|hai|है)?\s*(.+?)(?:[.!?]|$)/i
      );


    if (match && match[1]) {

      return {

        memoryType:
          "preference",

        memoryKey:
          "favorite_color",

        memoryValue:
          cleanValue(match[1])

      };

    }


    /* -----------------------------------------
       FAVORITE MOVIE
    ----------------------------------------- */

    match =
      original.match(
        /(?:my favorite movie is|my favourite movie is|mera favorite movie|meri favorite movie|मेरा फेवरेट मूवी|मेरा पसंदीदा फिल्म)\s*(?:is|hai|है)?\s*(.+?)(?:[.!?]|$)/i
      );


    if (match && match[1]) {

      return {

        memoryType:
          "preference",

        memoryKey:
          "favorite_movie",

        memoryValue:
          cleanValue(match[1])

      };

    }


    /* -----------------------------------------
       FAVORITE SONG
    ----------------------------------------- */

    match =
      original.match(
        /(?:my favorite song is|my favourite song is|mera favorite song|meri favorite song|मेरा फेवरेट गाना|मेरा पसंदीदा गाना)\s*(?:is|hai|है)?\s*(.+?)(?:[.!?]|$)/i
      );


    if (match && match[1]) {

      return {

        memoryType:
          "preference",

        memoryKey:
          "favorite_song",

        memoryValue:
          cleanValue(match[1])

      };

    }


    /* -----------------------------------------
       GENERIC FAVORITE
    ----------------------------------------- */

    match =
      original.match(
        /(?:my favorite|my favourite|mera favorite|meri favorite|मेरा फेवरेट|मेरी फेवरेट|मेरा पसंदीदा|मेरी पसंदीदा)\s+([a-zA-Z\u0900-\u097F]+)\s*(?:is|hai|है)?\s*(.+?)(?:[.!?]|$)/i
      );


    if (match && match[1] && match[2]) {

      const category =
        normalizeCategory(
          match[1]
        );


      return {

        memoryType:
          "preference",

        memoryKey:
          "favorite_" + category,

        memoryValue:
          cleanValue(match[2])

      };

    }


    return null;

  }


  /* =========================================
     CLEAN STRUCTURED VALUE
  ========================================= */

  function cleanValue(value) {

    return String(value || "")

      .trim()

      .replace(
        /^[=:,\s]+/,
        ""
      )

      .replace(
        /[.!?]+$/,
        ""
      )

      .trim();

  }


  /* =========================================
     NORMALIZE CATEGORY
  ========================================= */

  function normalizeCategory(
    category
  ) {

    const text =
      normalizeText(category);


    const aliases = {

      drink:
        "drink",

      drinks:
        "drink",

      "ड्रिंक":
        "drink",

      food:
        "food",

      "खाना":
        "food",

      game:
        "game",

      "गेम":
        "game",

      color:
        "color",

      colour:
        "color",

      "कलर":
        "color",

      movie:
        "movie",

      film:
        "movie",

      song:
        "song",

      music:
        "song"

    };


    return (
      aliases[text] ||
      text
    );

  }


  /* =========================================
     SAVE STRUCTURED MEMORY
  ========================================= */

  function saveStructuredMemory(
    structured
  ) {

    if (
      !structured ||
      !structured.memoryKey ||
      !structured.memoryValue
    ) {

      return false;

    }


    const memory =
      loadMemory();


    /*
      Find an existing structured
      memory with the same key.
    */

    let existingIndex = -1;


    for (
      let i = memory.length - 1;
      i >= 0;
      i--
    ) {

      if (
        memory[i].memoryKey ===
        structured.memoryKey
      ) {

        existingIndex = i;

        break;

      }

    }


    const item = {

      role:
        "user",

      message:
        structured.memoryKey +
        " = " +
        structured.memoryValue,

      timestamp:
        new Date().toISOString(),

      important:
        true,

      memoryType:
        structured.memoryType,

      memoryKey:
        structured.memoryKey,

      memoryValue:
        structured.memoryValue

    };


    if (existingIndex >= 0) {

      /*
        Update the existing fact instead
        of creating endless duplicates.
      */

      memory[existingIndex] =
        item;


      console.log(
        "🧠 AV MEMORY → Updated:",
        structured.memoryKey,
        "=",
        structured.memoryValue
      );

    }

    else {

      memory.push(item);


      console.log(
        "🧠 AV MEMORY → Structured:",
        structured.memoryKey,
        "=",
        structured.memoryValue
      );

    }


    saveMemory(memory);


    return true;

  }


  /* =========================================
     REMEMBER USER / ASSISTANT MESSAGE
  ========================================= */

  function remember(
    role,
    message
  ) {

    if (!message) {

      return false;

    }


    const text =
      String(message).trim();


    if (!text) {

      return false;

    }


    const memory =
      loadMemory();


    const actualRole =
      role || "user";


    /*
      Prevent exact consecutive duplicates.
    */

    const last =
      memory[memory.length - 1];


    if (
      last &&
      last.role === actualRole &&
      last.message === text
    ) {

      return true;

    }


    const important =
      detectImportance(
        actualRole,
        text
      );


    memory.push({

      role:
        actualRole,

      message:
        text,

      timestamp:
        new Date().toISOString(),

      important:
        important

    });


    saveMemory(memory);


    console.log(
      "🧠 AV MEMORY → Saved:",
      text,
      important
        ? "⭐ IMPORTANT"
        : ""
    );


    /*
      If this is a user message,
      also attempt structured extraction.
    */

    if (
      actualRole === "user"
    ) {

      const structured =
        detectStructuredMemory(
          text
        );


      if (structured) {

        saveStructuredMemory(
          structured
        );

      }

    }


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
    limit =
      MEMORY_CONFIG.recentLimit
  ) {

    const memory =
      loadMemory();


    return memory.slice(
      -Math.max(1, limit)
    );

  }


  /* =========================================
     GET STRUCTURED MEMORY
  ========================================= */

  function getStructuredMemory(
    key
  ) {

    const memory =
      loadMemory();


    if (!key) {

      return null;

    }


    for (
      let i = memory.length - 1;
      i >= 0;
      i--
    ) {

      const item =
        memory[i];


      if (
        item.memoryKey === key
      ) {

        return item;

      }

    }


    return null;

  }


  /* =========================================
     GET ALL STRUCTURED MEMORY
  ========================================= */

  function getAllStructuredMemory() {

    const memory =
      loadMemory();


    return memory.filter(
      function (item) {

        return !!item.memoryKey;

      }
    );

  }


  /* =========================================
     DETECT MEMORY QUERY
  ========================================= */

  function detectMemoryQuery(
    query
  ) {

    const text =
      normalizeText(query);


    if (!text) {

      return null;

    }


    /*
      Favorite drink
    */

    if (
      (
        text.includes("favorite drink") ||
        text.includes("favourite drink") ||
        text.includes("fav drink") ||
        text.includes("favorite beverage") ||
        text.includes("मेरा फेवरेट ड्रिंक") ||
        text.includes("मेरी फेवरेट ड्रिंक") ||
        text.includes("मेरा पसंदीदा ड्रिंक") ||
        text.includes("पसंदीदा ड्रिंक") ||
        text.includes("मुझे कौन सा ड्रिंक पसंद")
      ) &&
      (
        text.includes("what") ||
        text.includes("क्या") ||
        text.includes("which") ||
        text.includes("कौन") ||
        text.includes("my") ||
        text.includes("मेरा") ||
        text.includes("मेरी") ||
        text.includes("favorite") ||
        text.includes("favourite")
      )
    ) {

      return "favorite_drink";

    }


    /*
      Favorite food
    */

    if (
      text.includes("favorite food") ||
      text.includes("favourite food") ||
      text.includes("मेरा पसंदीदा खाना") ||
      text.includes("मेरा फेवरेट खाना") ||
      text.includes("मुझे क्या खाना पसंद")
    ) {

      return "favorite_food";

    }


    /*
      Favorite game
    */

    if (
      text.includes("favorite game") ||
      text.includes("favourite game") ||
      text.includes("मेरा फेवरेट गेम") ||
      text.includes("मेरा पसंदीदा गेम") ||
      text.includes("मेरा पसंदीदा खेल")
    ) {

      return "favorite_game";

    }


    /*
      Favorite color
    */

    if (
      text.includes("favorite color") ||
      text.includes("favourite color") ||
      text.includes("मेरा फेवरेट कलर") ||
      text.includes("मेरा पसंदीदा रंग")
    ) {

      return "favorite_color";

    }


    /*
      Favorite movie
    */

    if (
      text.includes("favorite movie") ||
      text.includes("favourite movie") ||
      text.includes("मेरा फेवरेट मूवी") ||
      text.includes("मेरा पसंदीदा फिल्म")
    ) {

      return "favorite_movie";

    }


    /*
      Favorite song
    */

    if (
      text.includes("favorite song") ||
      text.includes("favourite song") ||
      text.includes("मेरा फेवरेट गाना") ||
      text.includes("मेरा पसंदीदा गाना")
    ) {

      return "favorite_song";

    }


    /*
      Name query
    */

    if (
      text.includes("what is my name") ||
      text.includes("whats my name") ||
      text.includes("मेरा नाम क्या") ||
      text.includes("मेरा नाम क्या है") ||
      text.includes("my name")
    ) {

      return "name";

    }


    return null;

  }


  /* =========================================
     GET MEMORY ANSWER
  ========================================= */

  function getMemoryAnswer(
    query
  ) {

    const key =
      detectMemoryQuery(query);


    if (!key) {

      return null;

    }


    const item =
      getStructuredMemory(key);


    if (!item) {

      console.log(
        "🧠 AV MEMORY → No structured match:",
        key
      );

      return null;

    }


    console.log(
      "🧠 AV MEMORY → MATCH:",
      key,
      "=",
      item.memoryValue
    );


    return {

      key:
        key,

      value:
        item.memoryValue,

      item:
        item

    };

  }


  /* =========================================
     RELEVANT MEMORY SEARCH
  ========================================= */

  function getRelevantMemory(
    query,
    limit =
      MEMORY_CONFIG.relevantLimit
  ) {

    const memory =
      loadMemory();


    if (!memory.length) {

      return [];

    }


    /*
      First check for a structured
      memory query.
    */

    const direct =
      getMemoryAnswer(query);


    if (direct && direct.item) {

      /*
        Put the exact structured
        memory first.
      */

      const result = [
        direct.item
      ];


      const rest =
        memory.filter(
          function (item) {

            return (
              item.timestamp !==
              direct.item.timestamp
            );

          }
        );


      return result.concat(
        getRelevantMemoryByWords(
          query,
          rest,
          Math.max(
            1,
            limit - 1
          )
        )
      );

    }


    return getRelevantMemoryByWords(
      query,
      memory,
      limit
    );

  }


  /* =========================================
     WORD-BASED MEMORY SEARCH
  ========================================= */

  function getRelevantMemoryByWords(
    query,
    memory,
    limit
  ) {

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


          /* -----------------------------------------
             WORD OVERLAP
          ----------------------------------------- */

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


          /* -----------------------------------------
             IMPORTANT MEMORY BONUS
          ----------------------------------------- */

          if (item.important) {

            score += 3;

          }


          /* -----------------------------------------
             STRUCTURED MEMORY BONUS
          ----------------------------------------- */

          if (item.memoryKey) {

            score += 4;

          }


          /* -----------------------------------------
             RECENCY BONUS
          ----------------------------------------- */

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

      .filter(
        function (entry) {

          return entry.score > 0;

        }
      )

      .sort(
        function (a, b) {

          return b.score - a.score;

        }
      )

      .slice(
        0,
        Math.max(
          1,
          limit
        )
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

      .filter(
        function (item) {

          return item.important === true;

        }
      )

      .slice(
        -Math.max(
          1,
          limit
        )
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

      .map(
        function (item) {

          const label =
            item.role
              ? item.role.toUpperCase()
              : "MEMORY";


          /*
            Structured facts are displayed
            clearly for Gemini.
          */

          if (
            item.memoryKey &&
            item.memoryValue
          ) {

            return (
              "MEMORY FACT: " +
              item.memoryKey +
              " = " +
              item.memoryValue
            );

          }


          return (
            label +
            ": " +
            item.message
          );

        }
      )

      .join("\n");

  }


  /* =========================================
     BUILD NORMAL CONTEXT
  ========================================= */

  function buildContext(
    limit =
      MEMORY_CONFIG.recentLimit
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

    /*
      Exact structured memory first.
    */

    const directAnswer =
      getMemoryAnswer(query);


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


    /*
      Exact answer gets highest priority.
    */

    if (
      directAnswer &&
      directAnswer.item
    ) {

      addUnique(
        directAnswer.item
      );

    }


    relevant.forEach(
      addUnique
    );


    important.forEach(
      addUnique
    );


    recent.forEach(
      addUnique
    );


    const result =
      formatMemory(
        combined
      );


    console.log(
      "🧠 AV MEMORY → Smart Context built"
    );


    if (result) {

      console.log(
        result
      );

    }


    return result;

  }


  /* =========================================
     MIGRATE LEGACY MEMORY
  ========================================= */

  function migrateLegacyMemory() {

    const memory =
      loadMemory();


    let changed = false;


    const migrated =
      memory.map(
        function (item) {

          /*
            Old memories from v1/v2 may not
            contain structured fields.
          */

          if (
            item.role === "user" &&
            !item.memoryKey
          ) {

            const structured =
              detectStructuredMemory(
                item.message
              );


            if (structured) {

              item.memoryType =
                structured.memoryType;

              item.memoryKey =
                structured.memoryKey;

              item.memoryValue =
                structured.memoryValue;

              item.important =
                true;

              changed = true;


              console.log(
                "🧠 AV MEMORY → Migrated:",
                structured.memoryKey,
                "=",
                structured.memoryValue
              );

            }

          }


          return item;

        }
      );


    if (changed) {

      saveMemory(
        migrated
      );

    }


    return changed;

  }


  /* =========================================
     CLEAR MEMORY
  ========================================= */

  function clearMemory() {

    localStorage.removeItem(
      MEMORY_CONFIG.storageKey
    );


    console.log(
      "🧠 AV MEMORY → Cleared"
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


    const structured =
      memory.filter(
        function (item) {

          return !!item.memoryKey;

        }
      );


    return {

      active:
        true,

      version:
        MEMORY_CONFIG.version,

      messages:
        memory.length,

      important:
        important.length,

      structured:
        structured.length,

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

    getStructuredMemory:
      getStructuredMemory,

    getAllStructuredMemory:
      getAllStructuredMemory,

    getMemoryAnswer:
      getMemoryAnswer,

    buildContext:
      buildContext,

    buildSmartContext:
      buildSmartContext,

    detectStructuredMemory:
      detectStructuredMemory,

    detectMemoryQuery:
      detectMemoryQuery,

    clearMemory:
      clearMemory,

    getStatus:
      getStatus

  };


  /* =========================================
     STARTUP / MIGRATION
  ========================================= */

  migrateLegacyMemory();


  console.log(
    "🧠 AV MEMORY AGENT v3.0: ONLINE"
  );


  console.log(
    "🧠 Existing memories:",
    loadMemory().length
  );


  console.log(
    "🧠 Structured memories:",
    getAllStructuredMemory().length
  );


})();
