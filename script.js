let audio = new Audio();
let lyrics = [];
let currentLine = 0;
let timer;
let songList = [];

document.addEventListener('DOMContentLoaded', () => {
  loadSongs();
  document.getElementById('startBtn').addEventListener('click', startKaraoke);
});

function loadSongs() {
  fetch('songs.json')
    .then(res => res.json())
    .then(data => {
      songList = data;
      const list = document.getElementById('songbook');
      data.forEach((song, i) => {
        const div = document.createElement('div');
        div.className = 'song-item';
        div.innerText = `${song.title} - ${song.artist}`;
        div.onclick = () => loadSong(i);
        list.appendChild(div);
      });
    });
}

function loadSong(index) {
  const song = songList[index];
  audio.src = `${song.filename}.m4a`;
  fetch(`${song.filename}.lrc`)
    .then(res => res.text())
    .then(parseLRC);

  document.getElementById('lyrics').innerHTML = `<img src="mic.png" width="100">`;
  document.getElementById('selectedSong').innerText = `Selected: ${song.title} - ${song.artist}`;
  currentLine = 0;
}

function parseLRC(text) {
  lyrics = [];
  const lines = text.split('\n');
  for (let line of lines) {
    const match = line.match(/\[(\d+):(\d+\.\d+)\](.*)/);
    if (match) {
      const time = parseInt(match[1]) * 60 + parseFloat(match[2]);
      const text = match[3].trim();
      lyrics.push({ time, text });
    }
  }
  lyrics.sort((a, b) => a.time - b.time);
}

function startKaraoke() {
  if (!audio.src) {
    alert("Please select a song from the songbook first.");
    return;
  }

  document.getElementById('lyrics').innerText = "Get ready...";
  setTimeout(() => {
    audio.play();
    displayLyrics();
  }, 3000);
}

function displayLyrics() {
  timer = setInterval(() => {
    if (currentLine >= lyrics.length) {
      clearInterval(timer);
      return;
    }

    const currentTime = audio.currentTime;
    const next = lyrics[currentLine];

    if (currentTime >= next.time) {
      document.getElementById('lyrics').innerHTML = `<span style="color: orange; font-size: 32px;">${next.text}</span>`;
      currentLine++;
    }
  }, 100);
}
