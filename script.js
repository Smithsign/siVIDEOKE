const songListElement = document.getElementById('song-list');
const player = document.getElementById('player');
const lyricsDiv = document.getElementById('lyrics');
const searchInput = document.getElementById('search');

let songs = [];

fetch('songs.json')
  .then(response => response.json())
  .then(data => {
    songs = data;
    displaySongs(data);
  });

function displaySongs(songArray) {
  songListElement.innerHTML = '';
  songArray.forEach(song => {
    const card = document.createElement('div');
    card.className = 'song-card';
    card.innerHTML = `<strong>${song.title}</strong><br/><em>${song.artist}</em>`;
    card.onclick = () => playSong(song);
    songListElement.appendChild(card);
  });
}

function playSong(song) {
  player.src = `https://www.youtube.com/embed/${song.youtubeId}?autoplay=1`;
  lyricsDiv.textContent = song.lyrics;
}

searchInput.addEventListener('input', () => {
  const keyword = searchInput.value.toLowerCase();
  const filtered = songs.filter(song =>
    song.title.toLowerCase().includes(keyword) ||
    song.artist.toLowerCase().includes(keyword)
  );
  displaySongs(filtered);
});
