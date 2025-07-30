const lyrics = [
  { time: 0, text: "Throw it up, throw it up" },
  { time: 4, text: "Watch it all fall out" },
  { time: 8, text: "Pour it up, pour it up" },
  { time: 12, text: "That's how we ball out" },
  { time: 16, text: "Strip clubs and dollar bills" },
  { time: 20, text: "Still got more money" },
  { time: 24, text: "Patron shots can I get a refill?" },
  { time: 28, text: "Still got more money" },
  { time: 32, text: "Strippers going up and down that pole" },
  { time: 36, text: "And I still got more money" },
  { time: 40, text: "4 o'clock and we ain't going home" },
  { time: 44, text: "Still got more money" }
];

const audio = document.getElementById('audio');
const lyricsContainer = document.getElementById('lyrics-container');
const progress = document.getElementById('progress');
const countdownEl = document.getElementById('countdown');
const songInput = document.getElementById('songCode');
const songTitle = document.getElementById('song-title');

document.querySelectorAll('.num').forEach(button => {
  button.onclick = () => songInput.value += button.textContent;
});

document.getElementById('playBtn').onclick = () => {
  const code = songInput.value;
  if (code === '18252') {
    songTitle.textContent = 'POUR IT UP by Rihanna';
    startCountdown(() => {
      playSong();
    });
  }
};

document.getElementById('stopBtn').onclick = () => {
  audio.pause();
  audio.currentTime = 0;
  clearLyrics();
  songTitle.textContent = 'Waiting for song...';
};

function startCountdown(callback) {
  let count = 3;
  countdownEl.style.display = 'block';
  countdownEl.textContent = count;
  const interval = setInterval(() => {
    count--;
    countdownEl.textContent = count;
    if (count <= 0) {
      clearInterval(interval);
      countdownEl.style.display = 'none';
      callback();
    }
  }, 1000);
}

function playSong() {
  audio.play();
  renderLyrics();
  const interval = setInterval(() => {
    updateLyrics(audio.currentTime);
    updateProgress();
    if (audio.ended) clearInterval(interval);
  }, 300);
}

function renderLyrics() {
  lyricsContainer.innerHTML = '';
  lyrics.forEach((line, i) => {
    const div = document.createElement('div');
    div.className = 'line';
    div.id = 'line-' + i;
    div.textContent = line.text;
    lyricsContainer.appendChild(div);
  });
}

function updateLyrics(currentTime) {
  lyrics.forEach((line, i) => {
    const lineEl = document.getElementById('line-' + i);
    if (currentTime >= line.time && (!lyrics[i + 1] || currentTime < lyrics[i + 1].time)) {
      document.querySelectorAll('.line').forEach(el => el.classList.remove('active'));
      lineEl.classList.add('active');
      lyricsContainer.scrollTop = lineEl.offsetTop - lyricsContainer.offsetTop - 100;
    }
  });
}

function updateProgress() {
  const percent = (audio.currentTime / audio.duration) * 100;
  progress.style.width = percent + '%';
}

function clearLyrics() {
  lyricsContainer.innerHTML = '';
  progress.style.width = '0%';
}
