async function loadProfile() {
    startProgress();
    try {

        const userRes = await fetchWithAuth(`${API}/api/users/me`);
        const user = await userRes.json();

        document.getElementById('profile-username').textContent = user.username;
        document.getElementById('profile-display-name').textContent = user.username;
        document.getElementById('profile-email').textContent = user.email;
        document.getElementById('profile-avatar').textContent = user.username[0].toUpperCase();

        const entriesRes = await fetchWithAuth(`${API}/api/entries`);
        const entries = await entriesRes.json();

        const statsRes = await fetchWithAuth(`${API}/api/users/me/stats`);
        const stats = await statsRes.json();

        document.getElementById('count-total').textContent = stats.totalGames;
        document.getElementById('count-playing').textContent = stats.playing;
        document.getElementById('count-dropped').textContent = stats.dropped;
        document.getElementById('count-planned').textContent = stats.planned;
        document.getElementById('count-completed').textContent = stats.completed;

        const reviewsRes = await fetchWithAuth(`${API}/api/reviews/me`);
        const reviews = await reviewsRes.json();

        //Current playing
        const playing = entries.find(e => e.status === 'PLAYING');
        if (playing) {
            document.getElementById('cp-title').textContent = playing.game.title;
            document.getElementById('cp-sub').textContent = 
                `${playing.game.genre} · ${playing.game.platform} · ${playing.game.releaseYear}`;
                document.getElementById('currently-playing').style.display = 'flex';
        }

        //Avg rating
        const avgRating = reviews.length > 0
            ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
            : null;
        document.getElementById('avg-rating').textContent = avgRating || '—';

        //Member since
        document.getElementById('member-since').textContent =
            new Date(user.createdAt).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });

        //Top genres
        const genreCount = {};
        entries.forEach(e => {
            const genre = e.game?.genre;
            if (genre) genreCount[genre] = (genreCount[genre] || 0) + 1;
        });
        const topGenres = Object.entries(genreCount)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 4);
        const maxCount = topGenres[0]?.[1] || 1;

        document.getElementById('top-genres').innerHTML = topGenres.length > 0
            ? topGenres.map(([genre, count]) => `
        <div class="genre-row">
          <div class="genre-name">${genre}</div>
          <div class="genre-bar-bg">
            <div class="genre-bar-fill" style="width: ${Math.round((count / maxCount) * 100)}%"></div>
          </div>
          <div class="genre-count">${count} game${count !== 1 ? 's' : ''}</div>
        </div>
      `).join('')
            : '<div style="font-size:12px; color:var(--text-muted);">No data yet</div>';

        //Recent reviews
        const lastReviews = reviews.slice(-4).reverse();
        document.getElementById('last-reviews').innerHTML = lastReviews.length > 0
            ? lastReviews.map(r => `
                <div class="review-item">
                    <div>
                        <div class="review-title">${r.game?.title || 'Unknown'}</div>
                        <div class="review-text">${r.text || ''}</div>
                    </div>
                    <div class="review-score">${r.rating}/10</div>
                </div>
            `).join('') : '<div class="no-reviews">No reviews yet</div>';
        finishProgress();
    } catch (e) {
        console.error('Profile load error:', e);
        finishProgress();
        document.querySelector('.container').innerHTML = 
        '<div class="empty">Failed to load profile. Try again later.</div>';
    }
}
loadProfile();