// ---- 1) THEME TOGGLE LOGIC ----
const themeToggleBtn = document.getElementById('themeToggle');
const bodyEl = document.body;

// Apply saved theme on load
const savedTheme = localStorage.getItem('pysics-theme');
if (savedTheme === 'dark') {
  bodyEl.classList.add('dark-theme');
  themeToggleBtn.textContent = '🌞';
}

// Toggle on button click
themeToggleBtn.addEventListener('click', () => {
  bodyEl.classList.toggle('dark-theme');
  if (bodyEl.classList.contains('dark-theme')) {
    themeToggleBtn.textContent = '🌞';
    localStorage.setItem('pysics-theme', 'dark');
  } else {
    themeToggleBtn.textContent = '🌙';
    localStorage.setItem('pysics-theme', 'light');
  }
});

// ---- 2) LOGIN CHECK FOR SIMULATIONS LINK ----
const simLink = document.getElementById('simulationsLink');
simLink.addEventListener('click', (e) => {
  if (!window.isLoggedIn) {
    e.preventDefault();
    alert('Please log in to access simulations.');
  }
});

// ---- 3) TOGGLE “About” / “Community” SECTIONS ----
function toggleSection(showId) {
  ['about', 'community'].forEach((id) => {
    const el = document.getElementById(id);
    el.style.display = id === showId ? 'block' : 'none';
    if (id === showId) el.scrollIntoView({ behavior: 'smooth' });
  });
}
document.getElementById('aboutLink').addEventListener('click', () =>
  toggleSection('about')
);
document.getElementById('communityLink').addEventListener('click', () =>
  toggleSection('community')
);

// ---- 4) FETCH TOP 4 VIEWED SHORTS ----
const API_KEY = 'AIzaSyC7bZy8WWuSOOuVw903zJ0FpNvhl5I3U60';
const CHANNEL_ID = 'UCFoIYk0NwGIMb34cx23LizQ';
(async () => {
  try {
    const res = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${CHANNEL_ID}&order=viewCount&maxResults=4&key=${API_KEY}`
    );
    const { items } = await res.json();
    const grid = document.getElementById('videosGrid');
    items.forEach((item) => {
      const html = `
        <a class="video-card" href="https://youtu.be/${item.id.videoId}" target="_blank">
          <img src="https://img.youtube.com/vi/${item.id.videoId}/maxresdefault.jpg" alt="${item.snippet.title}">
          <p>${item.snippet.title}</p>
        </a>
      `;
      grid.insertAdjacentHTML('beforeend', html);
    });
  } catch (e) {
    console.error('YouTube fetch error:', e);
  }
})();
