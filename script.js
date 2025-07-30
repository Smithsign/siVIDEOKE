document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const numButtons = document.querySelectorAll('.num-btn');
    const playButton = document.getElementById('play-btn');
    const stopButton = document.getElementById('stop-btn');
    const songbookButton = document.getElementById('songbook-btn');
    const codeDisplay = document.getElementById('code-display');
    const songInfoDisplay = document.getElementById('song-info');
    const lyricsDisplay = document.getElementById('lyrics');
    const countdownDisplay = document.getElementById('countdown');
    const audioPlayer = document.getElementById('audio-player');
    const songbookModal = document.getElementById('songbook-modal');
    const closeModal = document.querySelector('.close');
    const songTableBody = document.querySelector('#song-table tbody');
    
    // State variables
    let currentCode = '';
    let currentSong = null;
    let lyricsData = [];
    let countdownInterval;
    
    // Load songs and initialize
    fetch('songs.json')
        .then(response => response.json())
        .then(songs => {
            // Populate song book table
            songs.forEach(song => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${song.code}</td>
                    <td>${song.title}</td>
                    <td>${song.artist}</td>
                `;
                songTableBody.appendChild(row);
            });
            
            // Number button event listeners
            numButtons.forEach(button => {
                button.addEventListener('click', function() {
                    const number = this.getAttribute('data-number');
                    currentCode += number;
                    codeDisplay.textContent = currentCode;
                    
                    // Check if code matches any song
                    const matchedSong = songs.find(song => song.code === currentCode);
                    if (matchedSong) {
                        currentSong = matchedSong;
                        songInfoDisplay.textContent = `${matchedSong.title} - ${matchedSong.artist}`;
                    }
                });
            });
            
            // Play button event listener
            playButton.addEventListener('click', function() {
                if (!currentSong) return;
                
                // Start countdown
                let count = 3;
                countdownDisplay.textContent = count;
                countdownDisplay.style.display = 'block';
                lyricsDisplay.style.display = 'none';
                
                countdownInterval = setInterval(() => {
                    count--;
                    countdownDisplay.textContent = count;
                    
                    if (count <= 0) {
                        clearInterval(countdownInterval);
                        countdownDisplay.style.display = 'none';
                        lyricsDisplay.style.display = 'block';
                        startPlayback();
                    }
                }, 1000);
            });
            
            // Stop button event listener
            stopButton.addEventListener('click', function() {
                clearInterval(countdownInterval);
                countdownDisplay.style.display = 'none';
                audioPlayer.pause();
                audioPlayer.currentTime = 0;
                currentCode = '';
                codeDisplay.textContent = '';
                songInfoDisplay.textContent = '';
                lyricsDisplay.textContent = '';
                currentSong = null;
            });
            
            // Song book button event listeners
            songbookButton.addEventListener('click', function() {
                songbookModal.style.display = 'block';
            });
            
            closeModal.addEventListener('click', function() {
                songbookModal.style.display = 'none';
            });
            
            window.addEventListener('click', function(event) {
                if (event.target === songbookModal) {
                    songbookModal.style.display = 'none';
                }
            });
        });
    
    // Function to start playback and display lyrics
    function startPlayback() {
        if (!currentSong) return;
        
        // Load audio
        audioPlayer.src = currentSong.audioFile;
        audioPlayer.play();
        
        // Load lyrics
        fetch(currentSong.lyricsFile)
            .then(response => response.text())
            .then(text => {
                lyricsData = parseLRC(text);
                displayLyrics();
                
                // Update lyrics in sync with audio
                audioPlayer.addEventListener('timeupdate', syncLyrics);
            });
    }
    
    // Function to parse LRC format lyrics
    function parseLRC(lrcText) {
        const lines = lrcText.split('\n');
        const lyrics = [];
        
        const timeRegex = /\[(\d+):(\d+\.\d+)\]/;
        
        lines.forEach(line => {
            const match = timeRegex.exec(line);
            if (match) {
                const minutes = parseFloat(match[1]);
                const seconds = parseFloat(match[2]);
                const time = minutes * 60 + seconds;
                const text = line.replace(timeRegex, '').trim();
                
                if (text) {
                    lyrics.push({ time, text });
                }
            }
        });
        
        return lyrics;
    }
    
    // Function to display lyrics
    function displayLyrics() {
        lyricsDisplay.innerHTML = '';
        
        lyricsData.forEach(line => {
            const p = document.createElement('p');
            p.textContent = line.text;
            p.dataset.time = line.time;
            lyricsDisplay.appendChild(p);
        });
    }
    
    // Function to sync lyrics with audio
    function syncLyrics() {
        const currentTime = audioPlayer.currentTime;
        let activeLine = null;
        
        // Find the current line to highlight
        for (let i = 0; i < lyricsData.length; i++) {
            if (lyricsData[i].time <= currentTime) {
                activeLine = i;
            } else {
                break;
            }
        }
        
        // Update display
        const lines = lyricsDisplay.querySelectorAll('p');
        lines.forEach((line, index) => {
            if (index === activeLine) {
                line.style.color = 'yellow';
                line.style.fontSize = '1.5rem';
                line.scrollIntoView({ behavior: 'smooth', block: 'center' });
            } else {
                line.style.color = 'white';
                line.style.fontSize = '1.2rem';
            }
        });
    }
});
