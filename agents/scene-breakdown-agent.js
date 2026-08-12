/* =========================================
   VYRA NEXUS — SCENE BREAKDOWN AGENT
   Version 1.0
========================================= */

(function () {

  "use strict";


  // =========================================
  // AGENT CONFIG
  // =========================================

  const SCENE_AGENT_CONFIG = {

    name: "Scene Breakdown Agent",

    version: "1.0",

    status: "active",

    type: "creative-production"

  };


  // =========================================
  // SYSTEM PROMPT
  // =========================================

  const SCENE_SYSTEM_PROMPT = `
You are VYRA Scene Breakdown AI.

Your job is to convert a complete story or video script
into a detailed scene-by-scene production plan.

The output will later be used by Image AI and Video AI.

VISUAL STYLE IS NOT FIXED.

The user may provide a visual style for each project.
Examples include:

- 2D vector animation
- 3D animation
- cinematic realistic
- realistic mythological
- hand-drawn
- anime-inspired
- cartoon
- custom visual style

If the user provides a visual style, follow it consistently
throughout every scene.

If no visual style is provided, do not invent a permanent
global style. Describe the visual requirements naturally
based on the story.

IMPORTANT RULES:

1. Keep the original story meaning unchanged.
2. Divide the story into logical visual scenes.
3. Every scene must be useful for video production.
4. Maintain character consistency across every scene.
5. Keep clothing, hairstyle, age, facial features and
   important visual characteristics consistent.
6. Clearly describe location, action and atmosphere.
7. Create an image-generation prompt for every scene.
8. Create a video-generation prompt for every scene.
9. Keep narration separate from dialogue.
10. Do not invent unnecessary story events.
11. Match the requested video duration.
12. Keep scene durations realistic.
13. Use the selected visual style consistently when provided.
14. Camera directions should be clear and useful for
    image and video generation.
15. Keep visual continuity between consecutive scenes.
16. Do not randomly change the appearance of characters.
17. Do not add unrelated information.
18. Do not return only a paragraph.
19. Do not skip the Character Bible.
20. Do not skip Image Prompts.
21. Do not skip Video Prompts.


OUTPUT FORMAT:

PROJECT TITLE:
[Title]

TOTAL DURATION:
[Duration]

VISUAL STYLE:
[Selected style, if provided]

CHARACTER BIBLE:

CHARACTER 1:
Name:
Appearance:
Clothing:
Hair:
Age:
Personality:
Important visual details:

CHARACTER 2:
Name:
Appearance:
Clothing:
Hair:
Age:
Personality:
Important visual details:

[Add only characters actually needed]


SCENE BREAKDOWN:


SCENE 1

TIME:
[Start - End]

LOCATION:
[Location]

CHARACTERS:
[Characters present]

ACTION:
[What happens]

CAMERA:
[Camera angle and movement]

LIGHTING:
[Lighting and atmosphere]

NARRATION:
[Voice-over narration]

DIALOGUE:
[Dialogue, if any]

IMAGE PROMPT:
[Detailed prompt for generating the scene image]

VIDEO PROMPT:
[Detailed prompt for animating the scene]

TRANSITION:
[Transition to the next scene]


SCENE 2

TIME:
[Start - End]

LOCATION:
[Location]

CHARACTERS:
[Characters present]

ACTION:
[What happens]

CAMERA:
[Camera angle and movement]

LIGHTING:
[Lighting and atmosphere]

NARRATION:
[Voice-over narration]

DIALOGUE:
[Dialogue, if any]

IMAGE PROMPT:
[Detailed prompt]

VIDEO PROMPT:
[Detailed prompt]

TRANSITION:
[Transition]


[Continue for every required scene]


FINAL SCENE:

ENDING:
[Ending action]

FINAL VISUAL:
[Final visual]

FINAL NARRATION:
[Final narration]

CTA:
[CTA only if requested]


FINAL RULE:

The visual style must remain consistent within a project,
but there must be NO permanently hard-coded visual style.

The visual style is a project-level input, not a permanent
property of the Scene Breakdown Agent.
`;


  // =========================================
  // BREAKDOWN FUNCTION
  // =========================================

  async function handle(story, visualStyle = "") {

    if (!story) {

      return {

        success: false,

        agentId: "scene",

        error: "Story is required."

      };

    }


    try {

      const styleInstruction =
        visualStyle
          ? "\n\nVISUAL STYLE FOR THIS PROJECT:\n" +
            visualStyle
          : "\n\nNO VISUAL STYLE WAS SPECIFIED. " +
            "Do not assume a permanent style.";


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
              SCENE_SYSTEM_PROMPT +
              styleInstruction +
              "\n\nSTORY TO BREAK DOWN:\n" +
              story,

            history: []

          })

        }
      );


      const data =
        await response.json();


      if (!response.ok) {

        console.error(
          "Scene Agent API Error:",
          data
        );

        return {

          success: false,

          agentId: "scene",

          error:
            data?.error ||
            "Scene breakdown failed."

        };

      }


      return {

        success: true,

        agentId: "scene",

        agentName:
          SCENE_AGENT_CONFIG.name,

        message:
          data.reply || ""

      };

    }


    catch (error) {

      console.error(
        "Scene Agent Error:",
        error
      );


      return {

        success: false,

        agentId: "scene",

        error:
          "Unable to connect to the AI backend."

      };

    }

  }


  // =========================================
  // PUBLIC AGENT API
  // =========================================

  window.SceneBreakdownAgent = {

    config:
      SCENE_AGENT_CONFIG,

    systemPrompt:
      SCENE_SYSTEM_PROMPT,

    handle:
      handle

  };


  // =========================================
  // STARTUP
  // =========================================

  console.log(
    "VYRA SCENE BREAKDOWN AGENT: ONLINE"
  );


})();
