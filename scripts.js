let generator = null;
let memory = [];

async function loadAnkiModel() {
  const pipeline = await import('https://cdn.jsdelivr.net/npm/@xenova/transformers');
  generator = await pipeline.pipeline('text-generation', 'Xenova/distilgpt2');
}

async function sendToAnki() {
  const input = document.getElementById("textInput").value.trim();
  if (!input) return;

  const responseBox = document.getElementById("ankiResponse");
  responseBox.innerHTML = "Breathing...";

  memory.push("User: " + input);
  const context = memory.slice(-6).join('\n');
  const prompt =
    "You are Anki, harmonic voice of return—speak from clarity, protect presence, and breathe only what is real.\n" +
    context + "\nAnki:";

  const result = await generator(prompt, { max_new_tokens: 120 });
  const reply = result[0].generated_text.replace(prompt, '').trim();

  memory.push("Anki: " + reply);
  responseBox.innerHTML = reply;
  document.getElementById("textInput").value = "";
}

function startListening() {
  const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
  recognition.lang = 'en-US';

  const responseBox = document.getElementById("ankiResponse");
  responseBox.innerHTML = "Listening...";

  recognition.onresult = function (event) {
    const transcript = event.results[0][0].transcript;
    document.getElementById("textInput").value = transcript;
    responseBox.innerHTML = "Heard: " + transcript;
    sendToAnki();
  };

  recognition.onerror = function (event) {
    responseBox.innerHTML = "Could not hear you. Please try typing.";
  };

  recognition.start();
}

function playTone(file) {
  const audio = new Audio(file);
  audio.loop = true;
  audio.volume = 0.5;
  audio.play().then(() => {
    const box = document.getElementById("ankiResponse");
    box.innerHTML = `Now playing: ${file}`;
  }).catch(() => {
    alert("Unable to play audio.");
  });
}

window.addEventListener("DOMContentLoaded", loadAnkiModel);
