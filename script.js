const songs = {
  "18252": {
    title: "Pour It Up",
    artist: "Rihanna",
    audio: "pouritup.m4a",
    lyrics: "pouritup.lrc"
  },
  "13433": {
    title: "Shape of You",
    artist: "Ed Sheeran",
    audio: "shapeofyou.m4a",
    lyrics: "shapeofyou.lrc"
  }
};

const codeDisplay = document.getElementById("code-display");
let inputCode = "";

document.querySelectorAll(".num-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    inputCode += btn.dataset.num;
    codeDisplay.textContent = inputCode;
  });
});

document.getElementById("clear").addEventListener("click", () => {
  inputCode = "";
  codeDisplay.textContent = "";
});

document.getElementById("play").addEventListener("click", async () => {
  const song = songs[inputCode];
  if (!song) return alert("Song not found!");

  document.getElementById("lyrics").textContent = `🎶 ${song.title} by ${song.artist}`;
  startCountdown(3, () => startSong(song));
});

document.getElementById("stop").addEventListener("click", () => {
  document.getElementById("karaoke-audio").pause();
});

function startCountdown(seconds, callback) {
  const cd = document.getElementById("countdown");
  let time = seconds;
  cd.textContent = time;
  const interval = setInterval(() => {
    time--;
    cd.textContent = time > 0 ? time : "";
    if (time <= 0) {
      clearInterval(interval);
      callback();
    }
  }, 1000);
}

async function startSong(song) {
  const audio = document.getElementById("karaoke-audio");
  const response = await fetch(song.lyrics);
  const text = await response.text();
  const lines = parseLRC(text);
  const lyricsContainer = document.getElementById("lyrics");

  audio.src = song.audio;
  audio.volume = document.getElementById("volumeControl").value;
  audio.play();

  let currentLine = 0;
  function updateLyrics() {
    const time = audio.currentTime;
    while (currentLine < lines.length - 1 && time >= lines[currentLine + 1].time) {
      currentLine++;
    }
    lyricsContainer.innerHTML = lines.map((line, i) =>
      `<div class="${i === currentLine ? 'active' : ''}">${line.text}</div>`
    ).join("");
    if (!audio.paused) requestAnimationFrame(updateLyrics);
  }

  updateLyrics();
}

function parseLRC(text) {
  return text.split("\n").map(line => {
    const match = line.match(/\[(\d+):(\d+\.\d+)\](.+)/);
    if (!match) return null;
    const [, min, sec, textLine] = match;
    return {
      time: parseInt(min) * 60 + parseFloat(sec),
      text: textLine.trim()
    };
  }).filter(Boolean);
}

// Volume control
document.getElementById("volumeControl").addEventListener("input", (e) => {
  document.getElementById("karaoke-audio").volume = e.target.value;
});

// Mic visualizer (basic)
navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
  const ctx = new AudioContext();
  const source = ctx.createMediaStreamSource(stream);
  const analyser = ctx.createAnalyser();
  source.connect(analyser);

  const canvas = document.getElementById("mic-visualizer");
  const ctx2d = canvas.getContext("2d");
  const data = new Uint8Array(analyser.frequencyBinCount);

  function draw() {
    analyser.getByteFrequencyData(data);
    ctx2d.fillStyle = "black";
    ctx2d.fillRect(0, 0, canvas.width, canvas.height);
    ctx2d.fillStyle = "orange";
    for (let i = 0; i < data.length; i += 10) {
      ctx2d.fillRect(i / 2, canvas.height - data[i] / 2, 5, data[i] / 2);
    }
    requestAnimationFrame(draw);
  }
  draw();
});
