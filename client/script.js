import bot from './assets/bot.svg'
import user from './assets/user.svg'

const form = document.querySelector('form')
const chatContainer = document.querySelector('#chat_container')

const searchFormInput = form.querySelector("textarea"); 

let loadInterval

function loader(element) {
    element.textContent = ''

    loadInterval = setInterval(() => {
        // Update the text content of the loading indicator
        element.textContent += '.';

        // If the loading indicator has reached three dots, reset it
        if (element.textContent === '....') {
            element.textContent = '';
        }
    }, 300);
}

function typeText(element, text) {
    let index = 0

    let interval = setInterval(() => {
        if (index < text.length) {
            element.innerHTML += text.charAt(index)
            index++
        } else {
            clearInterval(interval)
        }
    }, 20)
}

// generate unique ID for each message div of bot
// necessary for typing text effect for that specific reply
// without unique ID, typing text will work on every element
function generateUniqueId() {
    const timestamp = Date.now();
    const randomNumber = Math.random();
    const hexadecimalString = randomNumber.toString(16);

    return `id-${timestamp}-${hexadecimalString}`;
}

function chatStripe(isAi, value, uniqueId) {
    return (
        `
        <div class="wrapper ${isAi && 'ai'}">
            <div class="chat">
                <div class="profile">
                    <img 
                      src=${isAi ? bot : user} 
                      alt="${isAi ? 'bot' : 'user'}" 
                    />
                </div>
                <div class="message" id=${uniqueId}>${value}</div>
            </div>
        </div>
    `
    )
}

const handleSubmit = async (e) => {

    e.preventDefault()

    const data = new FormData(form)

    // user's chatstripe
    chatContainer.innerHTML += chatStripe(false, data.get('prompt'))

    // to clear the textarea input 
    form.reset()

    // bot's chatstripe
    const uniqueId = generateUniqueId()
    chatContainer.innerHTML += chatStripe(true, " ", uniqueId)

    // to focus scroll to the bottom 
    chatContainer.scrollTop = chatContainer.scrollHeight;

    // specific message div 
    const messageDiv = document.getElementById(uniqueId)

    // messageDiv.innerHTML = "..."
    loader(messageDiv)

    const response = await fetch('http://localhost:5000', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            prompt: data.get('prompt')
        })
    })

    clearInterval(loadInterval)
    messageDiv.innerHTML = " "

    if (response.ok) {
        const data = await response.json();
        const parsedData = data.bot.trim() // trims any trailing spaces/'\n' 

        typeText(messageDiv, parsedData)
    } else {
        const err = await response.text()

        messageDiv.innerHTML = "Something went wrong"
        alert(err)
    }
    
}

form.addEventListener('submit', handleSubmit)
form.addEventListener('keyup', (e) => {
    if (e.keyCode === 13) {
        handleSubmit(e)
    }
})





// The speech recognition interface lives on the browser’s window object
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition; // if none exists -> undefined

if(SpeechRecognition) {
  console.log("Your Browser supports speech Recognition");
  
  const recognition = new SpeechRecognition();
  recognition.continuous = true;
  recognition.lang = "en-US";
  //recognition.interimResults = true;

  // let p = document.createElement('p');
  // searchFormInput.appendChild(p);
  let transcript = "";
  
  form.insertAdjacentHTML("beforeend", '<button id="mic_button" type="button"><i class="fas fa-microphone"></i></button>');
//  formInput.style.paddingRight = "50px";

  const micBtn = form.querySelector('#mic_button');
  const micIcon = micBtn.firstElementChild;

  micBtn.addEventListener("click", micBtnClick);
  function micBtnClick() {
    if(micIcon.classList.contains("fa-microphone")) { // Start Voice Recognition
      recognition.start(); // First time you have to allow access to mic!
    }
    else {
      recognition.stop();
    }
  }
  
  recognition.addEventListener("start", startSpeechRecognition); // <=> recognition.onstart = function() {...}
  function startSpeechRecognition() {
    micIcon.classList.remove("fa-microphone");
    micIcon.classList.add("fa-microphone-slash");
    searchFormInput.focus();
    console.log("Voice activated, SPEAK");
  }

  recognition.addEventListener("end", endSpeechRecognition); // <=> recognition.onend = function() {...}
  function endSpeechRecognition() {
    //recognition.start();

    micIcon.classList.remove("fa-microphone-slash");
    micIcon.classList.add("fa-microphone");
    searchFormInput.focus();
    console.log("Speech recognition service disconnected");
  }
    
  
  recognition.addEventListener("result", resultOfSpeechRecognition); // <=> recognition.onresult = function(event) {...} - Fires when you stop talking
  function resultOfSpeechRecognition(event) {    
    
    
    const current = event.resultIndex;

    const transcript = event.results[event.resultIndex][0].transcript;
    
    // Loop through the results from the speech recognition object.
    // for (let i = event.resultIndex; i < event.results.length; ++i) {
    //   // If the result item is Final, add it to Final Transcript, Else add it to Interim transcript
    //   if (event.results[i].isFinal) {
    //     transcript += event.results[i][0].transcript;
    //   }
    //   else
    //   {
    //     transcript = event.results[i][0].transcript;
    //   }
    // }
    //const transcript = event.results[event.resultIndex][0].transcript;
    //const transcript = event.results[0][0].transcript;
    //const transcript = Array.from(event.results)
    //.map(result => result[event.resultIndex][0].transcript)
    // .map(result => result[0])
    // .map(result => result.transcript)
    // .join('')

    searchFormInput.value += transcript;
    // if(e.results[0].isFinal) {
    //   searchFormInput.value = transcript;
    // }
    
    console.log(transcript)
 }
  //info.textContent = 'Voice Commands: "stop recording", "reset input", "go"';
  
}
else {
  console.log("Your Browser does not support speech Recognition");
}
  
  


// let voices = [];

// const getVoices = () => {
//   voices = synth.getVoices();
// }

// getVoices();

// if(synth.onvoiceschanged !== undefined) {
//   synth.onvoiceschanged = getVoices();
// }

// const speak = () => {
//   if(synth.speaking) {
//     console.error('Already speaking...');
//     return;
//   }
//   if(searchFormInput.value !== '')
//   {
//     //const speakText = new SpeechSynthesisUtterance(searchFormInput.value);
//     const speakText = new SpeechSynthesisUtterance("hello. how are you");

//     // speakText.volume = 1;
//     // speakText.rate = 1;
//     // speakText.pitch = 1;
//     // speakText.text = "how are you?";
//     // speakText.lang = "en-US"
//     //const voice = speaks[5];
    

//     speakText.onend = e => {
//       console.log('done');
//     }

//     speakText.onerror = e => {
//       console.error('speak error');
//     }

//     console.log(searchFormInput.value);
//     //const selected
//   }
// }

const ttsBtn = form.querySelector('#tts_button');
const ttsIcon = ttsBtn.firstElementChild;

ttsBtn.addEventListener("click", ttsBtnClick);

const synth = window.speechSynthesis;

function ttsBtnClick() {
  
  
  const speakText = new SpeechSynthesisUtterance(searchFormInput.value);

  speakText.lang = 'en-US';

  synth.speak(speakText);


}