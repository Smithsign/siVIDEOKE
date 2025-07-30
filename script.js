const songListElement = document.getElementById('songList');
const audio = document.getElementById('audio');
const lyricsDisplay = document.getElementById('lyricsDisplay');

const songs = [
  {
    title: "Perfect (Karaoke)",
    audio: "songs/perfect.mp3",
    lyrics: "songs/perfect.lrc"
  },
  {
    title: "Let It Go (Karaoke)",
    audio: "songs/letitgo.mp3",
    lyrics: "songs/letitgo.lrc"
  }
];

let currentLyrics = [];

function loadSong(song) {
  audio.src = song.audio;
  fetch(song.lyrics)
    .then(res => res.text())
    .then(parseLRC);
}

function parseLRC(text) {
  currentLyrics = [];
  const lines = text.split("\n");
  for (let line of lines) {
    const match = line.match(/\[(\d+):(\d+\.\d+)\](.*)/);
    if (match) {
      const minutes = parseInt(match[1]);
      const seconds = parseFloat(match[2]);
      const time = minutes * 60 + seconds;
      const text = match[3];
      currentLyrics.push({ time, text });
    }
  }
  displayLyrics();
}

function displayLyrics() {
  lyricsDisplay.innerHTML = currentLyrics
    .map((line, index) => `<div id="line-${index}">${line.text}</div>`)
    .join("");
}

audio.addEventListener("timeupdate", () => {
  const currentTime = audio.currentTime;
  for (let i = 0; i < currentLyrics.length; i++) {
    if (currentTime >= currentLyrics[i].time &&
        (i + 1 >= currentLyrics.length || currentTime < currentLyrics[i + 1].time)) {
      highlightLine(i);
      break;
    }
  }
});

function highlightLine(index) {
  currentLyrics.forEach((_, i) => {
    const lineEl = document.getElementById(`line-${i}`);
    lineEl.classList.remove("highlight");
  });
  const activeLine = document.getElementById(`line-${index}`);
  if (activeLine) activeLine.classList.add("highlight");
}

songs.forEach(song => {
  const li = document.createElement('li');
  li.textContent = song.title;
  li.onclick = () => loadSong(song);
  songListElement.appendChild(li);
});
