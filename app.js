document.addEventListener("DOMContentLoaded", () => {
  const appRoot = document.getElementById("app-root");
  appRoot.innerHTML = `
    <div class="container">
      <h1>Windseed.one</h1>
      <p>Welcome home. The vessel is fully alive, with distribution, sound, and field resonance online.</p>
      <button id="audio-toggle">Toggle Audio</button>
    </div>
  `;

  const audio = document.getElementById("background-audio");
  const toggleButton = document.getElementById("audio-toggle");
  toggleButton.addEventListener("click", () => {
    audio.paused ? audio.play() : audio.pause();
  });
});
