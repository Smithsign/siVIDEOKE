const audio = document.getElementById("karaokeAudio");
const lyricsContainer = document.getElementById("lyrics");
const countdown = document.getElementById("countdown");
const songInfo = document.getElementById("song-info");
const volumeSlider = document.getElementById("volume");

let lyrics = [];
let currentLine = 0;
let interval;
let isPlaying = false;

// Load volume
volumeSlider.addEventListener("input", () => {
  audio.volume = volumeSlider.value;
});

// Song data
const songs = {
  "18252": {
    title: "Pour It Up",
    artist: "Rihanna",
    audio: "pouritup.m4a",
    lrc: "pouritup.lrc"
  }
};

// Enter code with keypad
function inputCode(num) {
  const input = document.getElementById("songCode");
  if (input.value.length < 5) input.value += num;
}
function clearCode() {
  document.getElementById("songCode").value = "";
}

function loadSong() {
  const code = document.getElementById("songCode").value;
  if (songs[code]) {
    const { title, artist, audio: audioFile, lrc } = songs[code];
    songInfo.innerHTML = `<strong>${title}</strong> by ${artist}`;
    audio.src = audioFile;
    fetch(lrc)
      .then(res => res.text())
      .then(parseLRC);
  } else {
    songInfo.innerText = "Invalid code.";
  }
}

function parseLRC(data) {
  lyrics = [];
  lyricsContainer.innerHTML = "";
  const lines = data.split("\n");
  for (let line of lines) {
    const match = line.match(/\[(\d+):(\d+\.\d+)\](.*)/);
    if (match) {
      const min = parseInt(match[1]);
      const sec = parseFloat(match[2]);
      const time = min * 60 + sec;
      const text = match[3].trim();
      lyrics.push({ time, text });
    }
  }
  lyrics.forEach(({ text }) => {
    const span = document.createElement("span");
    span.textContent = text;
    lyricsContainer.appendChild(span);
  });
}

function startKaraoke() {
  if (!audio.src) return;
  countdown.innerText = "3";
  let count = 3;
  const cdInterval = setInterval(() => {
    count--;
    countdown.innerText = count > 0 ? count : "";
    if (count === 0) {
      clearInterval(cdInterval);
      audio.play();
      isPlaying = true;
      syncLyrics();
    }
  }, 1000);
}

function stopKaraoke() {
  audio.pause();
  audio.currentTime = 0;
  clearInterval(interval);
  resetLyrics();
}

function resetLyrics() {
  const spans = lyricsContainer.querySelectorAll("span");
  spans.forEach(s => s.classList.remove("active"));
  currentLine = 0;
}

function syncLyrics() {
  interval = setInterval(() => {
    if (!isPlaying) return;
    const currentTime = audio.currentTime;
    for (let i = 0; i < lyrics.length; i++) {
      if (
        currentTime >= lyrics[i].time &&
        (i === lyrics.length - 1 || currentTime < lyrics[i + 1].time)
      ) {
        if (currentLine !== i) {
          const spans = lyricsContainer.querySelectorAll("span");
          spans.forEach(s => s.classList.remove("active"));
          spans[i].classList.add("active");
          currentLine = i;
        }
        break;
      }
    }
  }, 100);
}

// Mic visualizer
navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
  const audioCtx = new AudioContext();
  const analyser = audioCtx.createAnalyser();
  const mic = audioCtx.createMediaStreamSource(stream);
  mic.connect(analyser);
  analyser.fftSize = 256;

  const bufferLength = analyser.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);
  const canvas = document.getElementById("mic-visualizer");
  const ctx = canvas.getContext("2d");

  function draw() {
    requestAnimationFrame(draw);
    analyser.getByteFrequencyData(dataArray);
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    const barWidth = (canvas.width / bufferLength) * 2.5;
    let x = 0;
    for (let i = 0; i < bufferLength; i++) {
      const barHeight = dataArray[i] / 2;
      ctx.fillStyle = `rgb(${barHeight + 100}, 100, 0)`;
      ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
      x += barWidth + 1;
    }
  }

  draw();
});
