// ==============================
// VYRA NEXUS - APP CONTROLLER
// ==============================

const commandInput = document.querySelector(
  '.command input'
);

const sendButton = document.querySelector(
  '.command button'
);

const greeting = document.querySelector(
  '.greeting p'
);


// VYRA का जवाब दिखाने वाला function

function showVyraReply(reply) {

  greeting.innerHTML = reply;

}


// User का message process करना

function processCommand() {

  const message =
    commandInput.value.trim();

  if (message === '') {

    return;

  }


  const text =
    message.toLowerCase();


  // User का message दिखाओ

  greeting.innerHTML =

    '<b>Boss:</b> ' +

    message +

    '<br><br>' +

    '<b>VYRA:</b> Thinking...';


  // थोड़ी देर बाद जवाब

  setTimeout(() => {

    let reply;


    if (

      text.includes('तुम कौन हो') ||

      text.includes('who are you')

    ) {

      reply =

        'मैं VYRA हूँ, Boss 💜<br>' +

        'मैं तुम्हारे AI ecosystem की ' +

        'Master AI हूँ।';

    }


    else if (

      text.includes('hello') ||

      text.includes('हेलो') ||

      text.includes('hi') ||

      text.includes('हाय')

    ) {

      reply =

        'Hello, Boss 👋<br>' +

        'मैं online हूँ। ' +

        'मैं आपकी कैसे मदद कर सकती हूँ?';

    }


    else if (

      text.includes('कैसे हो') ||

      text.includes('how are you')

    ) {

      reply =

        'मैं पूरी तरह online हूँ, Boss 💜<br>' +

        'VYRA Nexus के systems ' +

        'सही तरीके से काम कर रहे हैं।';

    }


    else if (

      text.includes('नाम') ||

      text.includes('name')

    ) {

      reply =

        'मेरा नाम VYRA है, Boss 💜<br>' +

        'VYRA का मतलब है: ' +

        'Your Voice. My Command.';

    }


    else {

      reply =

        'मैंने आपका command receive कर लिया है, Boss. 💜<br><br>' +

        'अभी मेरा Advanced Chat AI ' +

        'connect किया जा रहा है।';

    }


    showVyraReply(reply);


    // Input खाली करो

    commandInput.value = '';

  }, 700);

}


// Send button दबाने पर

sendButton.addEventListener(

  'click',

  processCommand

);


// Enter दबाने पर

commandInput.addEventListener(

  'keydown',

  function(event) {

    if (

      event.key === 'Enter'

    ) {

      processCommand();

    }

  }

);
