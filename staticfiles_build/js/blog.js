// =============================
    // 1) THEME TOGGLE LOGIC
    // =============================
    const themeToggleBtn = document.getElementById('themeToggle');
    const bodyEl = document.body;

    // On load: check saved preference
    const savedTheme = localStorage.getItem('pysics-blog-theme');
    if (savedTheme === 'dark') {
      bodyEl.classList.add('dark-theme');
      themeToggleBtn.textContent = '🌞';
    }

    themeToggleBtn.addEventListener('click', () => {
      bodyEl.classList.toggle('dark-theme');

      if (bodyEl.classList.contains('dark-theme')) {
        themeToggleBtn.textContent = '🌞';
        localStorage.setItem('pysics-blog-theme', 'dark');
      } else {
        themeToggleBtn.textContent = '🌙';
        localStorage.setItem('pysics-blog-theme', 'light');
      }
    });

    // =============================
    // 2) FETCH & RENDER LATEST 4 SHORTS
    // =============================
    (async () => {
      try {
        const API_KEY = 'AIzaSyC7bZy8WWuSOOuVw903zJ0FpNvhl5I3U60';
        const CHANNEL_ID = 'UCFoIYk0NwGIMb34cx23LizQ';
        // Changed order to "date" to fetch the most recent uploads instead of oldest or highest view count
        const res = await fetch(
          `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${CHANNEL_ID}&order=date&maxResults=4&type=video&videoDuration=short&key=${API_KEY}`
        );
        const { items } = await res.json();
        const grid = document.getElementById('shortsGrid');
        items.forEach(item => {
          grid.innerHTML += `
            <div class="short-card">
              <img
                src="https://img.youtube.com/vi/${item.id.videoId}/hqdefault.jpg"
                alt="${item.snippet.title}"
              />
              <div class="short-content">
                <h4>${item.snippet.title}</h4>
                <p>${item.snippet.description}</p>
                <a href="https://youtu.be/${item.id.videoId}" target="_blank">Watch →</a>
              </div>
            </div>
          `;
        });
      } catch (e) {
        console.error(e);
      }
    })();