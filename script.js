let lrcLines = [];
let currentLine = 0;

const audio = document.getElementById("audio");
const startButton = document.getElementById("startButton");
const lyricsEl = document.getElementById("lyrics");

startButton.addEventListener("click", () => {
  startButton.disabled = true;
  lyricsEl.textContent = "Starting in 3...";
  
  setTimeout(() => {
    lyricsEl.textContent = "Starting in 2...";
    setTimeout(() => {
      lyricsEl.textContent = "Starting in 1...";
      setTimeout(() => {
        audio.play();
        showLyrics();
      }, 1000);
    }, 1000);
  }, 1000);
});

// Load LRC file
fetch("songs/pouritup.lrc")
  .then((response) => response.text())
  .then(parseLRC);

function parseLRC(data) {
  const lines = data.split("\n");
  lines.forEach((line) => {
    const match = line.match(/\[(\d+):(\d+\.\d+)\](.+)/);
    if (match) {
      const minutes = parseInt(match[1]);
      const seconds = parseFloat(match[2]);
      const text = match[3].trim();
      const time = minutes * 60 + seconds;
      lrcLines.push({ time, text });
    }
  });
}

function showLyrics() {
  const interval = setInterval(() => {
    if (currentLine >= lrcLines.length) {
      clearInterval(interval);
      return;
    }

    const currentTime = audio.currentTime;
    if (currentTime >= lrcLines[currentLine].time) {
      lyricsEl.textContent = lrcLines[currentLine].text;
      lyricsEl.classList.add("active");
      currentLine++;
    }
  }, 100);
}
