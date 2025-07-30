let songCode = '';
let audio = document.getElementById('audio');
let lyrics = document.getElementById('lyrics');
let countdown = document.getElementById('countdown');
let codeDisplay = document.getElementById('codeDisplay');
let lyricLines = [];
let lyricTimers = [];
let songData = {
  '18252': {
    title: 'Pour It Up',
    file: 'pouritup.m4a',
    lrc: 'pouritup.lrc'
  }
};

function press(num) {
  if (songCode.length < 5) {
    songCode += num;
    codeDisplay.innerText = songCode;
  }
}

function clearCode() {
  songCode = '';
  codeDisplay.innerText = 'ENTER SONG CODE';
}

function stopSong() {
  audio.pause();
  audio.currentTime = 0;
  clearLyrics();
  clearTimeouts();
  clearCode();
}

function playSong() {
  if (!songData[songCode]) {
    alert("Invalid song code!");
    return;
  }

  codeDisplay.innerText = `🎵 ${songData[songCode].title} 🎵`;
  countdown.innerText = '3';

  let count = 3;
  let interval = setInterval(() => {
    count--;
    countdown.innerText = count > 0 ? count : '';
    if (count <= 0) {
      clearInterval(interval);
      startPlayback(songData[songCode]);
    }
  }, 1000);
}

function startPlayback(song) {
  audio.src = song.file;
  fetch(song.lrc)
    .then(res => res.text())
    .then(text => {
      parseLRC(text);
      displayLyrics();
      audio.play();
      syncLyrics();
    });
}

function parseLRC(lrcText) {
  lyricLines = [];
  const lines = lrcText.split('\n');
  for (let line of lines) {
    const match = line.match(/\[(\d+):(\d+\.?\d*)\](.+)/);
    if (match) {
      const time = parseInt(match[1]) * 60 + parseFloat(match[2]);
      const text = match[3].trim();
      lyricLines.push({ time, text });
    }
  }
}

function displayLyrics() {
  lyrics.innerHTML = '';
  lyricLines.forEach((line, index) => {
    const li = document.createElement('li');
    li.textContent = line.text;
    li.id = 'line-' + index;
    lyrics.appendChild(li);
  });
}

function syncLyrics() {
  lyricLines.forEach((line, index) => {
    const timeout = setTimeout(() => {
      const previous = document.querySelector('.active');
      if (previous) previous.classList.remove('active');

      const current = document.getElementById('line-' + index);
      if (current) current.classList.add('active');
    }, line.time * 1000);
    lyricTimers.push(timeout);
  });
}

function clearLyrics() {
  lyrics.innerHTML = '';
}

function clearTimeouts() {
  lyricTimers.forEach(t => clearTimeout(t));
  lyricTimers = [];
}
