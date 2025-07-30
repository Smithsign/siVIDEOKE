const songCodeInput = document.getElementById("songCode");
const lookupBtn = document.getElementById("lookupBtn");
const playBtn = document.getElementById("playBtn");
const stopBtn = document.getElementById("stopBtn");
const lyricsContainer = document.getElementById("lyricsContainer");
const audio = document.getElementById("audio");
const volumeControl = document.getElementById("volume");
const songTitle = document.getElementById("songTitle");
const songArtist = document.getElementById("songArtist");
const songDetails = document.getElementById("songDetails");
const songList = document.getElementById("songList");

let lyrics = [];
let animationId;

fetch('songs.json')
  .then(res => res.json())
  .then(data => {
    for (let code in data) {
      const li = document.createElement("li");
      li.textContent = `${code} – ${data[code].title} – ${data[code].artist}`;
      songList.appendChild(li);
    }

    lookupBtn.addEventListener("click", () => {
      const code = songCodeInput.value.trim();
      const song = data[code];
      if (song) {
        songTitle.textContent = song.title;
        songArtist.textContent = song.artist;
        audio.src = song.file;
        fetch(song.lyrics)
          .then(res => res.text())
          .then(text => {
            lyrics = parseLRC(text);
            songDetails.classList.remove("hidden");
          });
      } else {
        alert("Song not found!");
      }
    });
  });

playBtn.addEventListener("click", () => {
  lyricsContainer.innerHTML = '';
  let i = 0;

  const interval = setInterval(() => {
    if (i < lyrics.length) {
      lyricsContainer.innerHTML = lyrics[i].text;
      i++;
    } else {
      clearInterval(interval);
    }
  }, 2000);

  audio.play();
});

stopBtn.addEventListener("click", () => {
  audio.pause();
  audio.currentTime = 0;
  lyricsContainer.innerHTML = '';
});

volumeControl.addEventListener("input", () => {
  audio.volume = volumeControl.value;
});

function parseLRC(lrc) {
  return lrc.split('\n').map(line => {
    const match = line.match(/\[(\d+):(\d+\.\d+)\](.*)/);
    if (match) {
      const minutes = parseInt(match[1]);
      const seconds = parseFloat(match[2]);
      const time = minutes * 60 + seconds;
      return { time, text: match[3] };
    }
  }).filter(Boolean);
}

// Microphone Visualizer
navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
  const audioCtx = new AudioContext();
  const source = audioCtx.createMediaStreamSource(stream);
  const analyser = audioCtx.createAnalyser();
  source.connect(analyser);
  analyser.fftSize = 256;

  const canvas = document.getElementById("micVisualizer");
  const ctx = canvas.getContext("2d");
  const bufferLength = analyser.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);

  function draw() {
    animationId = requestAnimationFrame(draw);
    analyser.getByteFrequencyData(dataArray);
    ctx.fillStyle = "#111";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const barWidth = (canvas.width / bufferLength) * 2.5;
    let x = 0;

    for (let i = 0; i < bufferLength; i++) {
      const barHeight = dataArray[i] / 2;
      ctx.fillStyle = `rgb(${255 - barHeight}, ${barHeight + 100}, 0)`;
      ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
      x += barWidth + 1;
    }
  }

  draw();
}).catch(err => {
  console.error("Mic access denied", err);
});
