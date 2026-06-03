async function loadProfile() {
    startProgress();
    try {
        const userRes = await fetchWithAuth(`${API}/api/users/me`);
        const user = await userRes.json();

        document.getElementById('profile-username').textContent = user.username;
        document.getElementById('profile-display-name').textContent = user.displayName || user.username;
        //document.getElementById('profile-email').textContent = user.email;
        document.getElementById('profile-avatar').textContent = user.username[0].toUpperCase();

        const entriesRes = await fetchWithAuth(`${API}/api/entries`);
        const entries = (await entriesRes.json()).content;

        const totalSeconds = entries.reduce((sum, e) => sum + (e.playtime || 0), 0)
        const totalHours = Math.floor(totalSeconds / 3600)
        const totalMinutes = Math.floor((totalSeconds % 3600) / 60)
        document.getElementById('total-hours').textContent = totalHours
        document.getElementById('total-minutes').textContent = totalMinutes

        const statsRes = await fetchWithAuth(`${API}/api/users/me/stats`);
        const stats = await statsRes.json();

        document.getElementById('count-total').textContent = stats.totalGames;
        document.getElementById('count-playing').textContent = stats.playing;
        document.getElementById('count-dropped').textContent = stats.dropped;
        document.getElementById('count-planned').textContent = stats.planned;
        document.getElementById('count-completed').textContent = stats.completed;

        //Completed datetime data
        const completedMap = {};
        entries.forEach(e => {
            if (e.completedAt) {
                completedMap[e.game.id] = new Date(e.completedAt)
                    .toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
            }
        });

        // Currently playing
        const playing = entries.find(e => e.status === 'PLAYING');
        if (playing) {
            document.getElementById('cp-title').textContent = playing.game.title;
            document.getElementById('cp-sub').textContent =
                `${playing.game.genre} · ${playing.game.platform} · ${playing.game.releaseYear}`;
            document.getElementById('currently-playing').style.display = 'flex';
        }

        const reviewsRes = await fetchWithAuth(`${API}/api/reviews/me`);
        const reviews = await reviewsRes.json();

        // Avg rating
        const avgRating = reviews.length > 0
            ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
            : null;
        document.getElementById('avg-rating').textContent = avgRating || '—';
        if (avgRating) {
            document.getElementById('avg-rating-sub').textContent =
                avgRating >= 8 ? 'High standards.' : avgRating >= 6 ? 'Balanced taste.' : 'Tough critic.';
        }

        // Top genre
        const genreCount = {};
        entries.forEach(e => {
            const genre = e.game?.genre;
            if (genre) genreCount[genre] = (genreCount[genre] || 0) + 1;
        });
        const topGenres = Object.entries(genreCount)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3);
        const maxCount = topGenres[0]?.[1] || 1;

        document.getElementById('top-genre').textContent = topGenres[0]?.[0] || '—';
        document.getElementById('top-genres').innerHTML = topGenres.length > 0
            ? topGenres.map(([genre, count]) => `
                <div class="genre-row">
                    <div class="genre-name">${genre}</div>
                    <div class="genre-bar-bg">
                        <div class="genre-bar-fill" style="width: ${Math.round((count / maxCount) * 100)}%"></div>
                    </div>
                    <div class="genre-count">${Math.round((count / entries.length) * 100)}%</div>
                </div>
            `).join('')
            : '<div class="empty">No data yet</div>';

        // Completion rate
        const rate = stats.totalGames > 0
            ? Math.round((stats.completed / stats.totalGames) * 100)
            : 0;
        document.getElementById('completion-rate').textContent = rate;
        document.getElementById('completion-sub').textContent =
            `${stats.completed} finished out of ${stats.totalGames} tracked. ${stats.planned} in backlog, staring back.`;

        // Recent reviews
        const lastReviews = reviews.slice(-4).reverse();
        document.getElementById('last-reviews').innerHTML = lastReviews.length > 0
            ? lastReviews.map((r, i) => {
                const text = escapeHtml(r.text || '');
                const isLong = text.length > 180;
                return `
                    <div class="recent-item">
                        <div class="recent-num">0${i + 1}</div>
                        <div class="recent-body">
                            <div class="recent-title">${r.game?.title || 'Unknown'}</div>
                            <div class="recent-meta">${r.game?.genre || ''} · ${r.game?.platform || ''} · ${r.game?.releaseYear || ''}</div>
                            ${text ? `
                            <div class="recent-review-text${isLong ? ' recent-review-collapsed' : ''}" id="rtext-${i}">${text}</div>
                            ${isLong ? `<button class="recent-expand-btn" onclick="toggleReview(this,'rtext-${i}')">Show more</button>` : ''}
                            ` : ''}
                        </div>
                        <div class="recent-right">
                            <div class="recent-score">${r.rating}/10</div>
                            <div class="recent-completed">${completedMap[r.game?.id] ? 'Completed ' + completedMap[r.game?.id] : '—'}</div>
                        </div>
                    </div>
                    `}).join('')
            : '<div class="no-reviews">No reviews yet</div>';

        finishProgress();
    } catch (e) {
        console.error('Profile load error:', e);
        finishProgress();
        document.querySelector('.container').innerHTML =
            '<div class="empty">Failed to load profile. Try again later.</div>';
    }
}

function toggleReview(btn, id) {
    const el = document.getElementById(id);
    const collapsed = el.classList.toggle('recent-review-collapsed');
    btn.textContent = collapsed ? 'Show more' : 'Show less';
}

function escapeHtml(str) {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function editDisplayName() {
    const nameEl = document.getElementById('profile-display-name');
    const btn = document.getElementById('btn-edit-displayname');
    const current = nameEl.textContent;

    nameEl.innerHTML = `
        <input type="text" id="displayname-input" value="${escapeHtml(current)}" 
            style="font-family: var(--font-mono); font-size: 22px; font-weight: 400;
                   background: var(--surface2); border: 1px solid rgba(200,240,96,0.25);
                   color: var(--text); padding: 4px 8px; outline: none; width: 100%;"
            maxlength="30">
    `;
    btn.textContent = 'Save';
    btn.onclick = saveDisplayName;
}

async function saveDisplayName() {
    const input = document.getElementById('displayname-input');
    const newName = input.value.trim();
    const btn = document.getElementById('btn-edit-displayname');

    if (!newName) {
        showToast('Display name cannot be empty', 'error');
        return;
    }

    const res = await fetchWithAuth(`${API}/api/users/me/displayname`, {
        method: 'PUT',
        body: JSON.stringify({ displayName: newName })
    });

    if (res.ok) {
        const user = await res.json();
        document.getElementById('profile-display-name').textContent = user.displayName || user.username;
        btn.textContent = 'Edit';
        btn.onclick = editDisplayName;
        showToast('Display name updated!', 'success');
    } else {
        showToast('Error updating display name', 'error');
    }
}

async function loadPublicProfile(username) {
    startProgress();
    try {
        const userRes = await fetch(`${API}/api/public/${username}`);
        if(!userRes.ok) {
            document.querySelector('.container').innerHTML =
                '<div class="empty">User not found.</div>';
            return;
        }
        const user = await userRes.json();

        //user site-headers
        document.getElementById('profile-username').textContent = user.username;
        document.getElementById('profile-display-name').textContent = user.displayName || user.username;
        document.getElementById('profile-avatar').textContent = user.username[0].toUpperCase();

        //hide private btn
        document.querySelector('.nav-right').innerHTML = `
            <button onclick="window.location.href='games.html?user=${username}'">Library</button>
            <button onclick="window.location.href='profile.html'">← Back</button>
        `;

        const editBtn = document.getElementById('btn-edit-displayname');
        if (editBtn) editBtn.style.display = 'none';
        
        //load entries and reviews
        const entriesRes = await fetch(`${API}/api/public/${username}/entries`);
        const entries = (await entriesRes.json()).content;

        const reviewsRes = await fetch(`${API}/api/public/${username}/reviews`);
        const reviews = await reviewsRes.json();

        //calculated statistic 
        document.getElementById('count-total').textContent = entries.length;
        document.getElementById('count-completed').textContent = entries.filter(e => e.status === 'COMPLETED').length;
        document.getElementById('count-playing').textContent = entries.filter(e => e.status === 'PLAYING').length;
        document.getElementById('count-planned').textContent = entries.filter(e => e.status === 'PLANNED').length;
        document.getElementById('count-dropped').textContent = entries.filter(e => e.status === 'DROPPED').length;

        //Playtime 
        const totalSeconds = entries.reduce((sum, e) => sum + (e.playtime || 0), 0);
        document.getElementById('total-hours').textContent = Math.floor(totalSeconds / 3600);
        document.getElementById('total-minutes').textContent = Math.floor((totalSeconds % 3600) / 60);

        //Avg rating
        const avgRating = reviews.length > 0
            ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
            : null;
        document.getElementById('avg-rating').textContent = avgRating || '—';

        //Top genre
        const genreCount = {};
        entries.forEach(e => {
            const genre = e.game?.genre;
            if (genre) genreCount[genre] = (genreCount[genre] || 0) + 1;
        });
        const topGenres = Object.entries(genreCount).sort((a, b) => b[1] - a[1]).slice(0, 3);
        const maxCount = topGenres[0]?.[1] || 1;
        document.getElementById('top-genre').textContent = topGenres[0]?.[0] || '—';
        document.getElementById('top-genres').innerHTML = topGenres.length > 0 ? topGenres.map(([genre, count]) => `
            <div class="genre-row">
                <div class="genre-name">${genre}</div>
                <div class="genre-bar-bg">
                    <div class="genre-bar-fill" style="width: ${Math.round((count / maxCount) * 100)}%"></div>
                </div>
                <div class="genre-count">${Math.round((count / entries.length) * 100)}%</div>
            </div>
        `).join('') : '<div class="empty">No data yet</div>';

        //Completion rate
        const rate = entries.length > 0
            ? Math.round((entries.filter(e => e.status === 'COMPLETED').length / entries.length) * 100)
            : 0;
        document.getElementById('completion-rate').textContent = rate;
        document.getElementById('completion-sub').textContent =
            `${entries.filter(e => e.status === 'COMPLETED').length} finished out of ${entries.length} tracked.`;

        //last reviews
        const lastReviews = reviews.slice(-4).reverse();
        document.getElementById('last-reviews').innerHTML = lastReviews.length > 0
            ? lastReviews.map((r, i) => {
                const text = escapeHtml(r.text || '');
                return `
                    <div class="recent-item">
                        <div class="recent-num">0${i + 1}</div>
                        <div class="recent-body">
                            <div class="recent-title">${r.game?.title || 'Unknown'}</div>
                            <div class="recent-meta">${r.game?.genre || ''} · ${r.game?.platform || ''}</div>
                            ${text ? `<div class="recent-review-text">${text}</div>` : ''}
                        </div>
                        <div class="recent-right">
                            <div class="recent-score">${r.rating}/10</div>
                        </div>
                    </div>`;
            }).join('')
            : '<div class="no-reviews">No reviews yet</div>';
        finishProgress();
    } catch (e) {
        console.error(e);
        finishProgress();
    }
}

async function searchUsers(query) {
    const results = document.getElementById('user-search-results');
    if (query.length < 2) {
        results.style.display = 'none';
        return;
    }

    const res = await fetch(`${API}/api/public/search?q=${encodeURIComponent(query)}`);
    const users = await res.json();

    if(users.length === 0) {
        results.style.display = 'none';
        return;
    }

    results.style.display = 'block';
    results.innerHTML = users.map(u => `
        <div style="padding: 10px 16px; cursor: pointer; 
                    font-family: var(--font-mono); font-size: 12px;
                    color: var(--text);"
             onmouseover="this.style.background='var(--surface2)'"
             onmouseout="this.style.background=''"
             onclick="window.location.href='profile.html?user=${u.username}'">
            ${u.username}
        </div>
    `).join('');
}

document.addEventListener('click', function(e) {
    const results = document.getElementById('user-search-results');
    const input = document.getElementById('user-search');
    const toggle = document.getElementById('search-toggle');
    const wrap = document.getElementById('user-search-wrap');

    if (results && input && toggle && wrap &&
        !input.contains(e.target) && 
        !results.contains(e.target) && 
        !toggle.contains(e.target)) {
        results.style.display = 'none';
        wrap.classList.remove('visible');
        input.value = '';
    }
});

const viewingUsername = new URLSearchParams(window.location.search).get('user');

if (viewingUsername) {
    loadPublicProfile(viewingUsername);
} else {
    loadProfile();
}

function toggleSearch() {
    const wrap = document.getElementById('user-search-wrap');
    const input = document.getElementById('user-search');
    const isVisible = wrap.classList.contains('visible');

    if (isVisible) {
        wrap.classList.remove('visible');
        document.getElementById('user-search-results').style.display = 'none';
        input.value = '';
    } else {
        wrap.classList.add('visible');
        setTimeout(() => input.focus(), 200);
    }
}