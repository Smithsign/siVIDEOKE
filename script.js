let lyrics = [];
let currentLine = 0;
let interval;
let songCode = "";
const audio = document.getElementById('audio');
const lyricsContainer = document.getElementById('lyrics');
const progress = document.getElementById('progress');
const currentTime = document.getElementById('current-time');
const durationTime = document.getElementById('duration');

function addNumber(num) {
  songCode += num;
  document.getElementById('songCodeDisplay').textContent = songCode;
}

function clearInput() {
  songCode = "";
  document.getElementById('songCodeDisplay').textContent = "";
}

function searchSong() {
  if (songCode === "18252") {
    alert("POUR IT UP by Rihanna selected");
  } else {
    alert("Song not found");
  }
}

function startKaraoke() {
  if (songCode !== "18252") return alert("Enter valid song code first");
  lyricsContainer.innerHTML = '';
  fetch('pour_it_up.lrc')
    .then(response => response.text())
    .then(data => {
      lyrics = parseLRC(data);
      lyrics.forEach(line => {
        const p = document.createElement('p');
        p.textContent = line.text;
        lyricsContainer.appendChild(p);
      });
      setTimeout(() => {
        audio.play();
        syncLyrics();
      }, 3000); // 3s countdown
    });
}

function stopKaraoke() {
  audio.pause();
  audio.currentTime = 0;
  clearInterval(interval);
  lyricsContainer.innerHTML = '';
  songCode = "";
  document.getElementById('songCodeDisplay').textContent = "";
}

function parseLRC(lrcText) {
  const lines = lrcText.split('\n');
  const result = [];

  for (const line of lines) {
    const match = line.match(/\[(\d{2}):(\d{2}\.\d{2})\](.*)/);
    if (match) {
      const min = parseInt(match[1]);
      const sec = parseFloat(match[2]);
      const time = min * 60 + sec;
      result.push({ time, text: match[3] });
    }
  }
  return result;
}

function syncLyrics() {
  interval = setInterval(() => {
    const time = audio.currentTime;
    for (let i = 0; i < lyrics.length; i++) {
      if (time >= lyrics[i].time && (!lyrics[i + 1] || time < lyrics[i + 1].time)) {
        if (currentLine !== i) {
          const lines = lyricsContainer.querySelectorAll('p');
          lines.forEach(p => p.classList.remove('active'));
          lines[i].classList.add('active');
          currentLine = i;
        }
      }
    }

    updateProgress();
  }, 100);
}

function updateProgress() {
  if (!isNaN(audio.duration)) {
    const percent = (audio.currentTime / audio.duration) * 100;
    progress.style.width = percent + "%";
    currentTime.textContent = formatTime(audio.currentTime);
    durationTime.textContent = formatTime(audio.duration);
  }
}

function formatTime(sec) {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}
