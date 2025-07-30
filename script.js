const audio = document.getElementById('karaokeAudio');
const lyricsDiv = document.getElementById('lyrics');
const countdownDiv = document.getElementById('countdown');
const volumeSlider = document.getElementById('volumeSlider');
let lyrics = [];
let interval;

volumeSlider.addEventListener('input', () => {
  audio.volume = volumeSlider.value;
});

function appendNumber(num) {
  const input = document.getElementById('songCode');
  if (input.value.length < 5) input.value += num;
}

function clearCode() {
  document.getElementById('songCode').value = '';
}

function playSong() {
  const code = document.getElementById('songCode').value;
  if (code === "18252") {
    fetch('pouritup.lrc')
      .then(res => res.text())
      .then(text => {
        lyrics = parseLRC(text);
        startCountdown();
      });
  } else {
    alert("Song code not found.");
  }
}

function startCountdown() {
  let count = 3;
  countdownDiv.textContent = count;
  const countdown = setInterval(() => {
    count--;
    countdownDiv.textContent = count > 0 ? count : '';
    if (count === 0) {
      clearInterval(countdown);
      startKaraoke();
    }
  }, 1000);
}

function startKaraoke() {
  audio.currentTime = 0;
  audio.play();
  let currentLine = 0;

  interval = setInterval(() => {
    if (currentLine < lyrics.length && audio.currentTime >= lyrics[currentLine].time) {
      lyricsDiv.textContent = lyrics[currentLine].text;
      currentLine++;
    }
  }, 200);
}

function parseLRC(lrcText) {
  return lrcText.split('\n').map(line => {
    const match = line.match(/\[(\d+):(\d+)\.(\d+)](.*)/);
    if (!match) return null;
    const [, min, sec, centisec, text] = match;
    const time = parseInt(min) * 60 + parseInt(sec) + parseInt(centisec) / 100;
    return { time, text };
  }).filter(Boolean);
}

// 🎤 Mic visualizer
navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  const source = audioCtx.createMediaStreamSource(stream);
  const analyser = audioCtx.createAnalyser();
  source.connect(analyser);
  const canvas = document.getElementById('micVisualizer');
  const ctx = canvas.getContext('2d');
  analyser.fftSize = 64;
  const bufferLength = analyser.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);

  function draw() {
    requestAnimationFrame(draw);
    analyser.getByteFrequencyData(dataArray);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const barWidth = canvas.width / bufferLength;
    for (let i = 0; i < bufferLength; i++) {
      const barHeight = dataArray[i];
      ctx.fillStyle = 'lime';
      ctx.fillRect(i * barWidth, canvas.height - barHeight, barWidth - 2, barHeight);
    }
  }

  draw();
});
