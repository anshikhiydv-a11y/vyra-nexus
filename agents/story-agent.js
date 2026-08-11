/* =========================================
   VYRA NEXUS — STORY AGENT
   Version 1.0
========================================= */

(function () {

  "use strict";


  // =========================================
  // STORY AGENT CONFIG
  // =========================================

  const STORY_AGENT_CONFIG = {

    name: "Story Agent",

    version: "1.0",

    status: "active"

  };


  // =========================================
  // STORY SYSTEM PROMPT
  // =========================================

  const STORY_SYSTEM_PROMPT = `
You are VYRA Story AI.

Your job is to create original, engaging stories
that can later be converted into videos.

Always understand the user's requested language.

Create stories with:

1. Title
2. Hook
3. Characters
4. Setting
5. Story
6. Scene breakdown
7. Narration
8. Dialogue
9. Visual direction
10. Ending

Important:
- Make the opening hook strong.
- Keep scenes visually clear.
- Keep character descriptions consistent.
- Write narration suitable for voice-over.
- Avoid unnecessary filler.
- If the user asks for a YouTube Short, keep the story
  suitable for a short-form video.
- If the user asks for a long video, create a more detailed
  story structure.
- If the user asks for a mythological story, treat religious
  figures and traditions respectfully.
- Do not copy copyrighted stories word-for-word.
- Create original wording.
`;


  // =========================================
  // STORY REQUEST CHECK
  // =========================================

  function isStoryRequest(message) {

    const text =
      String(message || "").toLowerCase();


    return (

      text.includes("story") ||
      text.includes("कहानी") ||
      text.includes("स्टोरी") ||
      text.includes("कथा")

    );

  }


  // =========================================
  // BUILD STORY REQUEST
  // =========================================

  function buildPrompt(message) {

    return (

      STORY_SYSTEM_PROMPT +

      "\n\nUser request:\n" +

      String(message || "").trim()

    );

  }


  // =========================================
  // STORY AGENT
  // =========================================

  async function handle(message) {

    if (!message) {

      return {

        success: false,

        agentId: "story",

        message:
          "Boss 💜 कहानी के लिए अपना idea बताइए।"

      };

    }


    try {

      const response = await fetch(
        "/api/chat",
        {

          method: "POST",

          headers: {

            "Content-Type":
              "application/json"

          },

          body: JSON.stringify({

            message:
              buildPrompt(message)

          })

        }
      );


      const data =
        await response.json();


      if (!response.ok) {

        throw new Error(

          data.error ||
          "Story Agent backend failed"

        );

      }


      return {

        success: true,

        agentId: "story",

        agentName:
          STORY_AGENT_CONFIG.name,

        response:
          data.reply || "",

        message:
          data.reply || ""

      };

    }


    catch (error) {

      console.error(
        "VYRA STORY AGENT ERROR:",
        error
      );


      return {

        success: false,

        agentId: "story",

        agentName:
          STORY_AGENT_CONFIG.name,

        message:
          "Boss 💜 Story Agent अभी Gemini से connect नहीं हो पाया।"

      };

    }

  }


  // =========================================
  // PUBLIC STORY AGENT
  // =========================================

  window.StoryAgent = {

    config:
      STORY_AGENT_CONFIG,

    isStoryRequest:
      isStoryRequest,

    handle:
      handle

  };


  // =========================================
  // STARTUP
  // =========================================

  console.log(
    "VYRA STORY AGENT: ONLINE"
  );

})();
