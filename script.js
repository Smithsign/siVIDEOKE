let audio = new Audio();
let lyrics = [];
let currentLine = 0;
let songData = null;
let startTimeout = null;

// Load songs.json and show songbook
async function loadSongs() {
  const res = await fetch('songs.json');
  const songs = await res.json();
  const book = document.getElementById('songbook');

  songs.forEach((song, index) => {
    const div = document.createElement('div');
    div.className = 'song';
    div.innerHTML = `
      <img src="mic.png" width="80" />
      <h3>${song.title}</h3>
      <p>${song.artist}</p>
      <button onclick="selectSong(${index})">Sing</button>
    `;
    book.appendChild(div);
  });
}

// When user selects a song
async function selectSong(index) {
  const res = await fetch('songs.json');
  const songs = await res.json();
  songData = songs[index];

  document.getElementById('songbook').style.display = 'none';
  document.getElementById('karaoke').style.display = 'block';
  document.getElementById('lyrics').innerHTML = '<img src="mic.png" width="200" />';

  // Load audio
  audio.src = `${songData.filename}.m4a`;
  audio.load();

  // Load LRC
  const lrcText = await fetch(`${songData.filename}.lrc`).then(res => res.text());
  lyrics = parseLRC(lrcText);

  // Delay for 3 seconds before playing
  document.getElementById('lyrics').innerHTML = "<h2>🎤 Get Ready...</h2>";
  startTimeout = setTimeout(() => {
    audio.play();
    requestAnimationFrame(syncLyrics);
  }, 3000);
}

// Parse .lrc into array of { time, text }
function parseLRC(lrc) {
  const lines = lrc.split('\n');
  const parsed = [];

  for (let line of lines) {
    const match = line.match(/\[(\d+):(\d+)(\.\d+)?\](.*)/);
    if (match) {
      const min = parseInt(match[1]);
      const sec = parseInt(match[2]);
      const ms = parseFloat(match[3] || 0);
      const time = min * 60 + sec + ms;
      const text = match[4].trim();
      parsed.push({ time, text });
    }
  }

  return parsed;
}

// Highlight lyric lines in sync
function syncLyrics() {
  if (!lyrics || lyrics.length === 0 || audio.paused) return;

  const currentTime = audio.currentTime;
  const container = document.getElementById('lyrics');

  // Find the current line
  for (let i = 0; i < lyrics.length; i++) {
    if (currentTime < lyrics[i].time) {
      currentLine = i - 1;
      break;
    }
  }

  if (currentLine < 0) currentLine = 0;

  // Display current and next lines (no scroll)
  let html = '';
  for (let i = 0; i < lyrics.length; i++) {
    let className = '';
    if (i === currentLine) {
      className = 'highlight';
    }
    html += `<p class="${className}">${lyrics[i].text}</p>`;
  }

  container.innerHTML = html;

  if (!audio.ended) {
    requestAnimationFrame(syncLyrics);
  } else {
    container.innerHTML += '<p>🎤 Song ended</p>';
  }
}
