document.addEventListener("DOMContentLoaded", () => {
  const appRoot = document.getElementById("app-root");
  appRoot.innerHTML = `
    <div style="padding: 2rem;">
      <h1>Welcome to Windseed</h1>
      <p>This vessel is fully alive and circulating. All pathways are live.</p>
    </div>
    <button id="audio-toggle">Toggle Audio</button>
  `;

  const audio = document.getElementById("background-audio");
  const toggleButton = document.getElementById("audio-toggle");
  toggleButton.addEventListener("click", () => {
    if (audio.paused) {
      audio.play();
    } else {
      audio.pause();
    }
  });
});
