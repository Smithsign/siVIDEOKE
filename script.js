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
    const numberDisplay = document.createElement('div'); // For number display on screen
    
    // Add number display to screen
    numberDisplay.id = 'number-display';
    numberDisplay.style.display = 'none';
    document.querySelector('.screen').prepend(numberDisplay);

    // Number sound effects in Filipino
    const numberSounds = {
        '1': 'https://assets.mixkit.co/sfx/preview/mixkit-arcade-game-jump-coin-216.mp3',
        '2': 'https://assets.mixkit.co/sfx/preview/mixkit-arcade-game-jump-coin-216.mp3',
        '3': 'https://assets.mixkit.co/sfx/preview/mixkit-arcade-game-jump-coin-216.mp3',
        '4': 'https://assets.mixkit.co/sfx/preview/mixkit-arcade-game-jump-coin-216.mp3',
        '5': 'https://assets.mixkit.co/sfx/preview/mixkit-arcade-game-jump-coin-216.mp3',
        '6': 'https://assets.mixkit.co/sfx/preview/mixkit-arcade-game-jump-coin-216.mp3',
        '7': 'https://assets.mixkit.co/sfx/preview/mixkit-arcade-game-jump-coin-216.mp3',
        '8': 'https://assets.mixkit.co/sfx/preview/mixkit-arcade-game-jump-coin-216.mp3',
        '9': 'https://assets.mixkit.co/sfx/preview/mixkit-arcade-game-jump-coin-216.mp3',
        '0': 'https://assets.mixkit.co/sfx/preview/mixkit-arcade-game-jump-coin-216.mp3'
    };

    // State variables
    let currentCode = '';
    let currentSong = null;
    let lyricsData = [];
    let countdownInterval;
    let fallingElements = [];
    let activeLyricIndex = -1;
    let nextLyricIndex = 0;

    // Create falling orange elements
    function createFallingElements() {
        fallingElements.forEach(el => {
            if (el.parentNode === fallingEffects) {
                fallingEffects.removeChild(el);
            }
        });
        fallingElements = [];
        
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

    // Play number sound effect
    function playNumberSound(number) {
        const sound = new Audio(numberSounds[number]);
        sound.volume = 0.7;
        sound.play().catch(e => console.log("Audio play failed:", e));
        
        // Display the number on screen briefly
        numberDisplay.textContent = number;
        numberDisplay.style.display = 'block';
        numberDisplay.style.animation = 'none';
        void numberDisplay.offsetWidth; // Trigger reflow
        numberDisplay.style.animation = 'numberPop 0.5s forwards';
        
        setTimeout(() => {
            numberDisplay.style.display = 'none';
        }, 500);
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
                    
                    // Visual feedback
                    codeDisplay.style.animation = 'none';
                    void codeDisplay.offsetWidth;
                    codeDisplay.style.animation = 'pulse 0.5s';
                });
                songTableBody.appendChild(row);
            });
            
            createFallingElements();
            
            // Number button event listeners
            numButtons.forEach(button => {
                button.addEventListener('click', function() {
                    const number = this.getAttribute('data-number');
                    currentCode += number;
                    codeDisplay.textContent = currentCode;
                    
                    // Play number sound
                    playNumberSound(number);
                    
                    // Check if code matches any song
                    const matchedSong = songs.find(song => song.code === currentCode);
                    if (matchedSong) {
                        currentSong = matchedSong;
                        songInfoDisplay.textContent = `${matchedSong.title} - ${matchedSong.artist}`;
                        
                        // Visual feedback
                        codeDisplay.style.animation = 'none';
                        void codeDisplay.offsetWidth;
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
                activeLyricIndex = -1;
                nextLyricIndex = 0;
                
                // Start countdown
                let count = 3;
                countdownDisplay.textContent = count;
                countdownDisplay.style.display = 'block';
                
                // Countdown sound effect
                const countdownSound = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-arcade-game-jump-coin-216.mp3');
                
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
                activeLyricIndex = -1;
                nextLyricIndex = 0;
                
                // Stop sound effect
                const stopSound = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-arcade-retro-game-over-213.mp3');
                stopSound.play();
            });
            
            // Song book button event listeners
            songbookButton.addEventListener('click', function() {
                songbookModal.style.display = 'block';
                const openSound = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-unlock-game-notification-253.mp3');
                openSound.play();
            });
            
            closeModal.addEventListener('click', function() {
                songbookModal.style.display = 'none';
                const closeSound = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-select-click-1109.mp3');
                closeSound.play();
            });
            
            window.addEventListener('click', function(event) {
                if (event.target === songbookModal) {
                    songbookModal.style.display = 'none';
                    const closeSound = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-select-click-1109.mp3');
                    closeSound.play();
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
        
        lyricsData.forEach((line, index) => {
            const p = document.createElement('p');
            p.textContent = line.text;
            p.dataset.time = line.time;
            p.dataset.index = index;
            lyricsDisplay.appendChild(p);
        });
        
        // Center the lyrics container
        centerLyrics();
    }
    
    // Function to center lyrics
    function centerLyrics() {
        const containerHeight = lyricsContainer.clientHeight;
        const lyricsHeight = lyricsDisplay.clientHeight;
        lyricsDisplay.style.top = `${(containerHeight - lyricsHeight) / 2}px`;
    }
    
   // Replace the syncLyrics and related functions with these improved versions

// Function to sync lyrics with audio
function syncLyrics() {
    const currentTime = audioPlayer.currentTime;
    
    // Find the current active lyric
    let newActiveIndex = -1;
    for (let i = 0; i < lyricsData.length; i++) {
        if (lyricsData[i].time <= currentTime) {
            newActiveIndex = i;
        } else {
            break;
        }
    }

    // Only update if the active lyric changed
    if (newActiveIndex !== activeLyricIndex) {
        activeLyricIndex = newActiveIndex;
        updateLyricsDisplay();
        
        // Smooth scroll to the active line
        if (activeLyricIndex >= 0) {
            const activeLine = lyricsDisplay.querySelector(`p[data-index="${activeLyricIndex}"]`);
            if (activeLine) {
                const containerHeight = lyricsContainer.clientHeight;
                const lineTop = activeLine.offsetTop;
                const lineHeight = activeLine.clientHeight;
                const targetScroll = lineTop + lineHeight/2 - containerHeight/2;
                
                lyricsDisplay.style.transition = 'transform 0.5s ease-out';
                lyricsDisplay.style.transform = `translateY(${-targetScroll}px)`;
            }
        }
    }
}

// Function to update lyrics display with karaoke highlighting
function updateLyricsDisplay() {
    const lines = lyricsDisplay.querySelectorAll('p');
    const currentTime = audioPlayer.currentTime;
    
    lines.forEach((line, index) => {
        // Clear previous states
        line.classList.remove('active', 'passed', 'upcoming');
        line.innerHTML = line.textContent; // Reset any character spans
        
        if (index < activeLyricIndex) {
            line.classList.add('passed');
        } 
        else if (index === activeLyricIndex) {
            line.classList.add('active');
            
            // Get the current lyric's timing information
            const lyricStartTime = lyricsData[index].time;
            let lyricEndTime = currentTime + 1; // Default end time
            
            // If there's a next lyric, use its start time as end time
            if (index < lyricsData.length - 1) {
                lyricEndTime = lyricsData[index + 1].time;
            }
            
            // Calculate progress through current lyric (0 to 1)
            const lyricProgress = (currentTime - lyricStartTime) / (lyricEndTime - lyricStartTime);
            
            // Apply karaoke-style character highlighting
            if (lyricProgress > 0) {
                const text = line.textContent;
                line.innerHTML = '';
                
                for (let i = 0; i < text.length; i++) {
                    const charSpan = document.createElement('span');
                    charSpan.textContent = text[i];
                    
                    // Calculate when this character should be highlighted
                    const charProgress = i / text.length;
                    
                    if (charProgress < lyricProgress) {
                        charSpan.classList.add('sung');
                    }
                    
                    line.appendChild(charSpan);
                }
            }
        }
        else {
            line.classList.add('upcoming');
        }
    });
}
    
    // Keyboard support
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
