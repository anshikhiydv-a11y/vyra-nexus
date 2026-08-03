const input = document.querySelector("input");
const sendButton = document.querySelector(".send");
const chat = document.querySelector(".chat");


async function sendMessage() {

  const userMessage = input.value.trim();

  // खाली message को send मत करो
  if (userMessage === "") {
    return;
  }


  // User का message बनाओ

  const userBubble =
    document.createElement("div");

  userBubble.className =
    "message user-message";

  userBubble.textContent =
    userMessage;

  chat.appendChild(userBubble);


  // Input box खाली करो

  input.value = "";

  input.focus();


  // VYRA से जवाब लो

  try {

    const vyraReply =
      await VYRA.processMessage(
        userMessage
      );


    // VYRA का message बनाओ

    const vyraBubble =
      document.createElement("div");

    vyraBubble.className =
      "message";

    vyraBubble.textContent =
      vyraReply;

    chat.appendChild(vyraBubble);


  } catch (error) {

    console.error(error);


    // अगर system में error आए

    const errorBubble =
      document.createElement("div");

    errorBubble.className =
      "message";

    errorBubble.textContent =
      "VYRA Core से connection में समस्या आई है। कृपया page refresh करके फिर कोशिश करें।";

    chat.appendChild(errorBubble);

  }


  // Chat को नीचे scroll करो

  chat.scrollTo({

    top: chat.scrollHeight,

    behavior: "smooth"

  });

}


// Send button दबाने पर

sendButton.addEventListener(

  "click",

  sendMessage

);


// Enter दबाने पर

input.addEventListener(

  "keydown",

  function (event) {

    if (event.key === "Enter") {

      sendMessage();

    }

  }

);
