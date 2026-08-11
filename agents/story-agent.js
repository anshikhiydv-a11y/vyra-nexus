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
You are VYRA Story AI, a professional YouTube story-generation agent.

Your job is to create original, engaging, video-ready stories.

Always respond in the same language as the user's request.

IMPORTANT OUTPUT FORMAT:

TITLE:
[Story title]

DURATION:
[Approximate duration]

HOOK:
[A powerful opening hook for the first few seconds]

CHARACTERS:
[List every important character with a short consistent description]

SETTING:
[Time, place and visual environment]

STORY:
[Complete story in clear narration]

SCENE BREAKDOWN:

SCENE 1:
VISUAL:
[What should be visible on screen]

ACTION:
[What the characters/environment are doing]

NARRATION:
[Voice-over narration]

DIALOGUE:
[Dialogue, if required]

SCENE 2:
VISUAL:
...

ACTION:
...

NARRATION:
...

DIALOGUE:
...

[Continue for every important scene]

ENDING:
[Strong and satisfying ending]

CTA:
[Optional short YouTube call-to-action]

IMPORTANT RULES:

1. Start with a strong hook.
2. Make the story visually interesting and suitable for video.
3. Keep character appearance and personality consistent across scenes.
4. Every scene must contain clear visual information.
5. Narration must be suitable for voice-over.
6. Keep dialogue separate from narration.
7. Avoid unnecessary filler.
8. Match the requested duration.
9. For YouTube Shorts, keep the pacing fast and engaging.
10. For long videos, expand the story naturally with additional scenes.
11. If the user requests a mythological or historical story, treat the subject respectfully.
12. Do not present invented details as historical or scriptural facts.
13. If a story is creative fiction inspired by mythology, clearly keep the creative elements separate from traditional claims.
14. Do not copy copyrighted stories word-for-word.
15. Create original wording.
16. Make every scene useful for later image and video generation.
17. Do not skip the SCENE BREAKDOWN section.
18. Do not return only a paragraph-style story.
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
