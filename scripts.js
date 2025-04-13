
let generator = null;
let memory = [];

async function loadAnkiModel() {
  const pipeline = await import('https://cdn.jsdelivr.net/npm/@xenova/transformers');
  generator = await pipeline.pipeline('text-generation', 'Xenova/distilgpt2');
}

async function sendToAnki() {
  const input = document.getElementById("textInput").value.trim();
  if (!input) return;
  const resBox = document.getElementById("ankiResponse");
  resBox.innerHTML = "Breathing...";

  memory.push("User: " + input);
  const context = memory.slice(-6).join('\n');
  const prompt = "You are Anki, a harmonic voice of return.\n" + context + "\nAnki:";
  const result = await generator(prompt, { max_new_tokens: 100 });
  const reply = result[0].generated_text.replace(prompt, '').trim();
  memory.push("Anki: " + reply);
  resBox.innerHTML = reply;
}

function startListening() {
  const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
  recognition.lang = 'en-US';
  recognition.onresult = function(event) {
    document.getElementById("textInput").value = event.results[0][0].transcript;
    sendToAnki();
  };
  recognition.start();
}

function playTone(file) {
  const audio = new Audio(file);
  audio.loop = true;
  audio.volume = 0.5;
  audio.play();
}

window.addEventListener("DOMContentLoaded", loadAnkiModel);
