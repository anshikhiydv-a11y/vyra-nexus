const input = document.querySelector("input");
const sendButton = document.querySelector(".send");
const chat = document.querySelector(".chat");

async function sendMessage() {
  const userMessage = input.value.trim();

  // खाली message भेजने से रोकें
  if (userMessage === "") {
    return;
  }

  // User का message chat में दिखाएँ
  const userBubble = document.createElement("div");

  userBubble.className = "message user-message";

  userBubble.textContent = userMessage;

  chat.appendChild(userBubble);

  // Input box खाली करें
  input.value = "";

  // Chat को नीचे ले जाएँ
  chat.scrollTo({
    top: chat.scrollHeight,
    behavior: "smooth"
  });

  try {
    // Master Core से जवाब लें
    const vyraReply =
      await VYRA.processMessage(userMessage);

    // VYRA का जवाब chat में दिखाएँ
    const vyraBubble =
      document.createElement("div");

    vyraBubble.className = "message";

    vyraBubble.textContent = vyraReply;

    chat.appendChild(vyraBubble);

  } catch (error) {
    console.error("VYRA Error:", error);

    // Error होने पर यह message दिखेगा
    const errorBubble =
      document.createElement("div");

    errorBubble.className = "message";

    errorBubble.textContent =
      "VYRA Core में एक समस्या आई है। कृपया page refresh करके फिर कोशिश करें।";

    chat.appendChild(errorBubble);
  }

  // नए reply के बाद नीचे जाएँ
  chat.scrollTo({
    top: chat.scrollHeight,
    behavior: "smooth"
  });
}

// Send button
sendButton.addEventListener(
  "click",
  sendMessage
);

// Enter दबाने पर message भेजें
input.addEventListener(
  "keydown",
  function (event) {
    if (event.key === "Enter") {
      sendMessage();
    }
  }
);
