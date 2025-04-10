// audio.js
const audio = new Audio('ambient.mp3');
audio.loop = true;
audio.volume = 0.35;

let isMuted = false;

const toggleAudio = () => {
  if (isMuted) {
    audio.play();
    document.getElementById('mute-toggle').innerText = '🔊';
  } else {
    audio.pause();
    document.getElementById('mute-toggle').innerText = '🔇';
  }
  isMuted = !isMuted;
};

window.onload = () => {
  const toggleBtn = document.createElement('button');
  toggleBtn.id = 'mute-toggle';
  toggleBtn.innerText = '🔊';
  toggleBtn.style.position = 'fixed';
  toggleBtn.style.bottom = '20px';
  toggleBtn.style.right = '20px';
  toggleBtn.style.padding = '0.5rem 1rem';
  toggleBtn.style.fontSize = '1.2rem';
  toggleBtn.style.border = 'none';
  toggleBtn.style.background = '#eee';
  toggleBtn.style.borderRadius = '6px';
  toggleBtn.style.cursor = 'pointer';
  toggleBtn.onclick = toggleAudio;
  document.body.appendChild(toggleBtn);

  audio.play().catch(() => {
    // Autoplay blocked, allow manual toggle
    toggleBtn.innerText = '🔇';
    isMuted = true;
  });
};
