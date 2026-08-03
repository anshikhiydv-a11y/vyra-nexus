const input = document.querySelector("input");
const sendButton = document.querySelector(".send");
const chat = document.querySelector(".chat");

function sendMessage() {
  const userMessage = input.value.trim();

  if (userMessage === "") {
    return;
  }

  // User message
  const userBubble = document.createElement("div");

  userBubble.className = "message user-message";

  userBubble.textContent = userMessage;

  chat.appendChild(userBubble);

  // Clear input
  input.value = "";

  // Demo VYRA reply
  setTimeout(() => {
    const vyraBubble = document.createElement("div");

    vyraBubble.className = "message";

    vyraBubble.textContent =
      "मैंने आपका संदेश प्राप्त कर लिया है, Boss. अभी मेरा Master AI Core तैयार किया जा रहा है।";

    chat.appendChild(vyraBubble);

    window.scrollTo({
      top: document.body.scrollHeight,
      behavior: "smooth"
    });

  }, 700);
}

// Send button
sendButton.addEventListener("click", sendMessage);

// Enter key
input.addEventListener("keydown", function(event) {
  if (event.key === "Enter") {
    sendMessage();
  }
});
