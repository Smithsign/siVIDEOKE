const audio = document.getElementById('audio');
const lyricsContainer = document.getElementById('lyrics');
const playBtn = document.getElementById('play-btn');
const volumeSlider = document.getElementById('volume-slider');
const micCanvas = document.getElementById('mic-visualizer');
const backgroundVideo = document.getElementById('background-video');
const songTitle = document.getElementById('song-title');

let currentLyrics = [];
let currentLineIndex = -1;
let animationFrame;
let isPlaying = false;

// 1. Load LRC Lyrics File
async function loadLRC(songName) {
    const res = await fetch(`${songName}.lrc`);
    const text = await res.text();
    return parseLRC(text);
}

// 2. Parse .lrc
function parseLRC(lrc) {
    const lines = lrc.split('\n');
    const lyrics = [];

    for (let line of lines) {
        const match = line.match(/\[(\d+):(\d+\.\d+)\](.*)/);
        if (match) {
            const min = parseInt(match[1]);
            const sec = parseFloat(match[2]);
            const time = min * 60 + sec;
            lyrics.push({ time, text: match[3] });
        }
    }

    return lyrics;
}

// 3. Display Lyrics
function displayLyrics(lyrics) {
    lyricsContainer.innerHTML = '';
    lyrics.forEach((line, index) => {
        const div = document.createElement('div');
        div.classList.add('lyric-line');
        div.dataset.index = index;
        div.innerText = line.text;
        lyricsContainer.appendChild(div);
    });
}

// 4. Sync Lyrics
function syncLyrics() {
    const currentTime = audio.currentTime;

    for (let i = 0; i < currentLyrics.length; i++) {
        if (
            currentTime >= currentLyrics[i].time &&
            (i === currentLyrics.length - 1 || currentTime < currentLyrics[i + 1].time)
        ) {
            if (i !== currentLineIndex) {
                const oldLine = document.querySelector('.lyric-line.active');
                if (oldLine) oldLine.classList.remove('active');

                const newLine = document.querySelector(`.lyric-line[data-index="${i}"]`);
                if (newLine) {
                    newLine.classList.add('active');
                    newLine.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }

                currentLineIndex = i;
            }
            break;
        }
    }

    animationFrame = requestAnimationFrame(syncLyrics);
}

// 5. Play Song
async function playSong(songName) {
    isPlaying = true;
    songTitle.innerText = songName.replace(/_/g, ' ').toUpperCase();

    audio.src = `${songName}.m4a`;
    backgroundVideo.play();

    currentLyrics = await loadLRC(songName);
    displayLyrics(currentLyrics);

    audio.play();
    animationFrame = requestAnimationFrame(syncLyrics);
}

// 6. Volume Control
volumeSlider.addEventListener('input', () => {
    audio.volume = volumeSlider.value;
});

// 7. Mic Visualizer
navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const source = audioCtx.createMediaStreamSource(stream);
    const analyser = audioCtx.createAnalyser();
    analyser.fftSize = 256;
    source.connect(analyser);

    const canvas = micCanvas;
    const ctx = canvas.getContext('2d');
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    function draw() {
        requestAnimationFrame(draw);
        analyser.getByteFrequencyData(dataArray);

        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const barWidth = (canvas.width / bufferLength) * 2.5;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
            const barHeight = dataArray[i];
            const r = 255;
            const g = 100 + (barHeight / 2);
            const b = 50;

            ctx.fillStyle = `rgb(${r},${g},${b})`;
            ctx.fillRect(x, canvas.height - barHeight / 2, barWidth, barHeight / 2);

            x += barWidth + 1;
        }
    }

    draw();
});

// 8. Bind Number Buttons to Song Codes
const songMap = {
    '1': 'pouritup'
};

document.querySelectorAll('.number-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const code = btn.innerText;
        if (songMap[code]) {
            if (isPlaying) {
                audio.pause();
                cancelAnimationFrame(animationFrame);
            }
            playSong(songMap[code]);
        }
    });
});

// 9. Play Button
playBtn.addEventListener('click', () => {
    const selectedCode = prompt('Enter Song Code (e.g., 1):');
    if (songMap[selectedCode]) {
        playSong(songMap[selectedCode]);
    } else {
        alert('Song not found!');
    }
});
