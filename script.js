document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const numButtons = document.querySelectorAll('.num-btn');
    const playButton = document.getElementById('play-btn');
    const stopButton = document.getElementById('stop-btn');
    const songbookButton = document.getElementById('songbook-btn');
    const codeDisplay = document.getElementById('code-display');
    const songInfoDisplay = document.getElementById('song-info');
    const lyricsDisplay = document.getElementById('lyrics');
    const lyricsContainer = document.getElementById('lyrics-container');
    const countdownDisplay = document.getElementById('countdown');
    const micIcon = document.getElementById('mic-icon');
    const audioPlayer = document.getElementById('audio-player');
    const songbookModal = document.getElementById('songbook-modal');
    const closeModal = document.querySelector('.close');
    const songTableBody = document.querySelector('#song-table tbody');
    const fallingEffects = document.querySelector('.falling-effects');
    
    // State variables
    let currentCode = '';
    let currentSong = null;
    let lyricsData = [];
    let countdownInterval;
    let fallingElements = [];
    
    // Create falling orange elements
    function createFallingElements() {
        // Clear existing elements
        fallingElements.forEach(el => {
            if (el.parentNode === fallingEffects) {
                fallingEffects.removeChild(el);
            }
        });
        fallingElements = [];
        
        // Create new elements
        for (let i = 0; i < 20; i++) {
            const el = document.createElement('div');
            el.className = 'falling-element';
            el.style.left = `${Math.random() * 100}%`;
            el.style.top = `${-Math.random() * 100}px`;
            el.style.width = `${Math.random() * 10 + 5}px`;
            el.style.height = el.style.width;
            el.style.animationDuration = `${Math.random() * 5 + 5}s`;
            el.style.animationDelay = `${Math.random() * 5}s`;
            el.style.opacity = Math.random() * 0.5 + 0.3;
            fallingEffects.appendChild(el);
            fallingElements.push(el);
        }
    }
    
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
                row.addEventListener('click', function() {
                    currentCode = song.code;
                    codeDisplay.textContent = currentCode;
                    currentSong = song;
                    songInfoDisplay.textContent = `${song.title} - ${song.artist}`;
                    songbookModal.style.display = 'none';
                });
                songTableBody.appendChild(row);
            });
            
            // Create falling elements
            createFallingElements();
            
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
                        
                        // Add visual feedback
                        codeDisplay.style.animation = 'none';
                        void codeDisplay.offsetWidth; // Trigger reflow
                        codeDisplay.style.animation = 'pulse 0.5s';
                    }
                });
            });
            
            // Play button event listener
            playButton.addEventListener('click', function() {
                if (!currentSong) return;
                
                // Reset display
                lyricsDisplay.innerHTML = '';
                micIcon.style.display = 'none';
                
                // Start countdown
                let count = 3;
                countdownDisplay.textContent = count;
                countdownDisplay.style.display = 'block';
                
                // Add sound effect for countdown
                const countdownSound = new Audio('data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU...'); // Short beep sound
                
                countdownInterval = setInterval(() => {
                    count--;
                    countdownDisplay.textContent = count;
                    countdownSound.currentTime = 0;
                    countdownSound.play();
                    
                    if (count <= 0) {
                        clearInterval(countdownInterval);
                        countdownDisplay.style.display = 'none';
                        
                        // Show mic icon briefly
                        micIcon.style.display = 'block';
                        setTimeout(() => {
                            micIcon.style.display = 'none';
                            startPlayback();
                        }, 1500);
                    }
                }, 1000);
            });
            
            // Stop button event listener
            stopButton.addEventListener('click', function() {
                clearInterval(countdownInterval);
                countdownDisplay.style.display = 'none';
                micIcon.style.display = 'none';
                audioPlayer.pause();
                audioPlayer.currentTime = 0;
                currentCode = '';
                codeDisplay.textContent = '';
                songInfoDisplay.textContent = '';
                lyricsDisplay.innerHTML = '';
                currentSong = null;
                
                // Add sound effect
                const stopSound = new Audio('data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU...'); // Short stop sound
                stopSound.play();
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
        
        // Center the lyrics container
        const containerHeight = lyricsContainer.clientHeight;
        const lyricsHeight = lyricsDisplay.clientHeight;
        lyricsDisplay.style.top = `${(containerHeight - lyricsHeight) / 2}px`;
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
                line.classList.add('active');
                
                // Scroll to center the active line
                const containerHeight = lyricsContainer.clientHeight;
                const lineTop = line.offsetTop;
                const lineHeight = line.clientHeight;
                lyricsDisplay.style.transform = `translateY(${containerHeight / 2 - lineTop - lineHeight}px)`;
            } else {
                line.classList.remove('active');
            }
        });
    }
    
    // Add keyboard support
    document.addEventListener('keydown', function(e) {
        if (e.key >= '0' && e.key <= '9') {
            const button = document.querySelector(`.num-btn[data-number="${e.key}"]`);
            if (button) button.click();
        } else if (e.key === 'Enter') {
            playButton.click();
        } else if (e.key === 'Escape') {
            stopButton.click();
        } else if (e.key === 's' || e.key === 'S') {
            songbookButton.click();
        }
    });
});
