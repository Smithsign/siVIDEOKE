const audio = document.getElementById('audio');
const lyricsContainer = document.getElementById('lyrics');
const playBtn = document.getElementById('playBtn');
const stopBtn = document.getElementById('stopBtn');
const volumeSlider = document.getElementById('volume');
const songCodeInput = document.getElementById('songCode');
const loadSongBtn = document.getElementById('loadSongBtn');
const songInfo = document.getElementById('songInfo');
const countdownEl = document.getElementById('countdown');
const micCanvas = document.getElementById('micVisualizer');
const micCtx = micCanvas.getContext('2d');

let lyrics = [];
let currentLine = 0;

volumeSlider.addEventListener('input', () => {
  audio.volume = volumeSlider.value;
});

loadSongBtn.addEventListener('click', async () => {
  const code = songCodeInput.value.trim();
  const response = await fetch('songs.json');
  const songs = await response.json();
  const song = songs.find(s => s.code === code);

  if (!song) {
    alert("Song not found!");
    return;
  }

  audio.src = song.audio;
  songInfo.textContent = `${song.title} by ${song.artist}`;
  lyricsContainer.innerHTML = '';

  const lrcText = await fetch(song.lrc).then(r => r.text());
  lyrics = parseLRC(lrcText);
  lyrics.forEach(line => {
    const li = document.createElement('li');
    li.textContent = line.text;
    lyricsContainer.appendChild(li);
  });

  startCountdown(3);
});

playBtn.addEventListener('click', () => {
  audio.play();
});

stopBtn.addEventListener('click', () => {
  audio.pause();
  audio.currentTime = 0;
  resetLyrics();
});

audio.addEventListener('timeupdate', () => {
  const currentTime = audio.currentTime;
  lyrics.forEach((line, index) => {
    if (currentTime >= line.time) {
      currentLine = index;
    }
  });
  updateLyricsHighlight();
});

function parseLRC(lrc) {
  return lrc.split('\n').map(line => {
    const match = line.match(/\[(\d+):(\d+\.\d+)\](.*)/);
    if (match) {
      const min = parseInt(match[1], 10);
      const sec = parseFloat(match[2]);
      const time = min * 60 + sec;
      return { time, text: match[3] };
    }
    return null;
  }).filter(Boolean);
}

function updateLyricsHighlight() {
  const lines = lyricsContainer.querySelectorAll('li');
  lines.forEach((li, index) => {
    li.classList.toggle('active', index === currentLine);
  });
}

function resetLyrics() {
  currentLine = 0;
  updateLyricsHighlight();
}

function startCountdown(seconds) {
  countdownEl.textContent = seconds;
  const interval = setInterval(() => {
    seconds--;
    countdownEl.textContent = seconds;
    if (seconds <= 0) {
      clearInterval(interval);
      countdownEl.textContent = '';
      audio.play();
    }
  }, 1000);
}

// 🎙 Mic Visualizer
navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
  const ctx = new AudioContext();
  const micSource = ctx.createMediaStreamSource(stream);
  const analyser = ctx.createAnalyser();
  micSource.connect(analyser);
  analyser.fftSize = 256;

  const bufferLength = analyser.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);

  function draw() {
    requestAnimationFrame(draw);
    analyser.getByteFrequencyData(dataArray);

    micCtx.fillStyle = '#111';
    micCtx.fillRect(0, 0, micCanvas.width, micCanvas.height);

    const barWidth = (micCanvas.width / bufferLength) * 2.5;
    let x = 0;

    for (let i = 0; i < bufferLength; i++) {
      const barHeight = dataArray[i];
      micCtx.fillStyle = 'orange';
      micCtx.fillRect(x, micCanvas.height - barHeight, barWidth, barHeight);
      x += barWidth + 1;
    }
  }

  draw();
});
