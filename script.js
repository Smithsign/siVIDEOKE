const audio = document.getElementById("audio");
const lyricsDisplay = document.getElementById("lyrics-display");
const codeInput = document.getElementById("codeInput");
const countdown = document.getElementById("countdown");
const volumeControl = document.getElementById("volumeControl");
const micVisualizer = document.getElementById("micVisualizer");

let currentLyrics = [];

async function loadSongs() {
  const response = await fetch("songs.json");
  const songs = await response.json();
  const songList = document.getElementById("songList");
  for (const song of songs) {
    const li = document.createElement("li");
    li.textContent = `${song.code} - ${song.title} by ${song.artist}`;
    songList.appendChild(li);
  }
  return songs;
}

function parseLRC(text) {
  const lines = text.split("\n");
  const result = [];
  for (let line of lines) {
    const match = line.match(/\[(\d+):(\d+\.?\d*)\](.+)/);
    if (match) {
      const min = parseInt(match[1]);
      const sec = parseFloat(match[2]);
      const time = min * 60 + sec;
      const text = match[3];
      result.push({ time, text });
    }
  }
  return result;
}

function showLyrics(lyrics) {
  lyricsDisplay.innerHTML = lyrics.map(line => `<div>${line.text}</div>`).join("");
}

function syncLyrics(lyrics) {
  let i = 0;
  const lines = lyricsDisplay.children;

  function update() {
    if (i >= lyrics.length) return;
    const currentTime = audio.currentTime;
    if (currentTime >= lyrics[i].time) {
      for (const line of lines) line.classList.remove("active");
      lines[i].classList.add("active");
      i++;
    }
    requestAnimationFrame(update);
  }

  update();
}

function startCountdown(cb) {
  let i = 3;
  countdown.textContent = i;
  const interval = setInterval(() => {
    i--;
    if (i <= 0) {
      clearInterval(interval);
      countdown.textContent = "";
      cb();
    } else {
      countdown.textContent = i;
    }
  }, 1000);
}

volumeControl.addEventListener("input", () => {
  audio.volume = volumeControl.value;
});

function startMicVisualizer() {
  navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
    const audioCtx = new AudioContext();
    const mic = audioCtx.createMediaStreamSource(stream);
    const analyser = audioCtx.createAnalyser();
    mic.connect(analyser);

    const data = new Uint8Array(analyser.frequencyBinCount);

    function draw() {
      analyser.getByteFrequencyData(data);
      const volume = data.reduce((a, b) => a + b, 0) / data.length;
      micVisualizer.style.background = `linear-gradient(to right, orange ${volume / 2}%, transparent 0%)`;
      requestAnimationFrame(draw);
    }

    draw();
  });
}

startMicVisualizer();

let allSongs = [];

loadSongs().then(songs => {
  allSongs = songs;
});

document.querySelectorAll(".num").forEach(btn => {
  btn.addEventListener("click", () => {
    codeInput.value += btn.textContent;
  });
});

document.getElementById("clear").addEventListener("click", () => {
  codeInput.value = "";
});

document.getElementById("play").addEventListener("click", async () => {
  const code = codeInput.value;
  const song = allSongs.find(s => s.code === code);
  if (!song) {
    alert("Invalid song code");
    return;
  }

  audio.src = song.audio;
  const lrcText = await fetch(song.lyrics).then(res => res.text());
  currentLyrics = parseLRC(lrcText);
  showLyrics(currentLyrics);

  startCountdown(() => {
    audio.play();
    syncLyrics(currentLyrics);
  });
});

document.getElementById("stop").addEventListener("click", () => {
  audio.pause();
  audio.currentTime = 0;
  lyricsDisplay.innerHTML = "";
});
