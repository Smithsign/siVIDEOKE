const songDatabase = {
  "18252": {
    title: "Pour It Up",
    artist: "Rihanna",
    file: "pouritup.m4a",
    lyrics: `
[00:00.00] Throw it up, throw it up
[00:02.00] Watch it all fall out
[00:04.00] Throw it up, throw it up
[00:06.00] That's how we ball out

[00:08.00] Strip clubs and dollar bills
[00:10.00] I still got mo' money
[00:12.00] Patron shots can I get a refill?
[00:14.00] I still got mo' money

[00:16.00] Strippers goin' up and down that pole
[00:18.00] And I still got mo' money
[00:20.00] 4 o'clock and we ain't going home
[00:22.00] 'Cause I still got mo' money

[00:24.00] Money make the world go round
[00:26.00] I still got mo' money
[00:28.00] Bands make your girl go down
[00:30.00] I still got mo' money

[00:32.00] Lot more where that came from
[00:34.00] I still got mo' money
[00:36.00] Look in your eyes I know you want some
[00:38.00] I still got mo' money
`
  }
};

let currentAudio = null;
let lyricsLines = [];
let currentLine = 0;
let isPlaying = false;

// DOM
const screen = document.getElementById("screen");
const titleEl = document.getElementById("song-title");
const artistEl = document.getElementById("song-artist");
const lyricsEl = document.getElementById("lyrics");
const playerInput = document.getElementById("code-input");
const cdCover = document.getElementById("cd");
const indicator = document.getElementById("progress");
const countdown = document.getElementById("countdown");

// Virtual keypad input
function press(num) {
  if (playerInput.value.length < 5) {
    playerInput.value += num;
  }
}

// Load song info
function loadSong() {
  const code = playerInput.value;
  const song = songDatabase[code];
  if (!song) {
    alert("Invalid code!");
    return;
  }

  titleEl.textContent = song.title;
  artistEl.textContent = song.artist;

  if (currentAudio) {
    currentAudio.pause();
  }

  currentAudio = new Audio(song.file);
  currentAudio.addEventListener("timeupdate", syncLyrics);
  currentAudio.addEventListener("ended", () => {
    isPlaying = false;
    cdCover.classList.remove("spinning");
  });

  loadLyrics(song.lyrics);
  indicator.max = 100;
}

// Parse lyrics
function loadLyrics(raw) {
  lyricsLines = raw.trim().split("\n").map(line => {
    const match = line.match(/\[(\d+):(\d+\.\d+)\](.+)/);
    if (match) {
      const time = parseInt(match[1]) * 60 + parseFloat(match[2]);
      return { time, text: match[3] };
    }
    return null;
  }).filter(Boolean);
  currentLine = 0;
  renderLyrics();
}

// Render all lyrics initially
function renderLyrics() {
  lyricsEl.innerHTML = lyricsLines.map((line, idx) => {
    return `<div class="lyric-line" id="line-${idx}">${line.text}</div>`;
  }).join("");
}

// Highlight current lyric line
function syncLyrics() {
  const currentTime = currentAudio.currentTime;

  for (let i = 0; i < lyricsLines.length; i++) {
    if (currentTime >= lyricsLines[i].time) {
      currentLine = i;
    }
  }

  lyricsLines.forEach((line, i) => {
    const el = document.getElementById(`line-${i}`);
    if (i === currentLine) {
      el.classList.add("active");
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    } else {
      el.classList.remove("active");
    }
  });

  // Update progress bar
  if (currentAudio.duration) {
    const progressPercent = (currentAudio.currentTime / currentAudio.duration) * 100;
    indicator.value = progressPercent;
  }
}

// Play song with countdown
function playSong() {
  const code = playerInput.value;
  const song = songDatabase[code];
  if (!song) return alert("Enter a valid code first!");

  countdown.style.display = "block";
  countdown.textContent = "3";
  cdCover.classList.add("spinning");

  let i = 2;
  const interval = setInterval(() => {
    countdown.textContent = i;
    i--;
    if (i < 0) {
      clearInterval(interval);
      countdown.style.display = "none";
      isPlaying = true;
      currentAudio.play();
    }
  }, 1000);
}

// Stop song
function stopSong() {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    isPlaying = false;
    cdCover.classList.remove("spinning");
  }
}
