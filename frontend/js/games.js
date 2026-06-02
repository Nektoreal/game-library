let selectedRating = 0;
let currentEntries = null;
let currentUsername = null;
let allEntries = null;
let selectedGameId = null;
let selectedEntryId = null;
let selectedCoverUrl = '';

//Close sidebar with "ESC" - key
document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
        closeSidebar();
    }
});

function formatPlaytime(seconds) {
    if (!seconds || seconds === 0) return null
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    if (hours > 0) return `${hours}h ${minutes}m`
    return `${minutes}m`
}

function escapeHtml(str) {
    return (str || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function renderCard(entry) {
    const entryJson = JSON.stringify(entry).replace(/"/g, '&quot;');
    return `<div class="game-card" onclick="openSidebar(${entryJson})">
                ${entry.game.coverUrl ? `
                <div class="game-cover">
                    <img src="${entry.game.coverUrl}" alt="${entry.game.title}">
                </div>` : `
                <div class="game-cover">
                    <div class="game-cover-placeholder">
                        <span class="no-cover-label">NO COVER</span>
                    </div>
                </div>`}
                <div class="game-info">
                    <div class="game-title">${entry.game.title}</div>
                    <div class="game-meta">
                        <span>${entry.game.genre} · ${entry.game.platform} · ${entry.game.releaseYear}</span>
                        ${formatPlaytime(entry.playtime) ? `<span class="game-playtime">⏱ ${formatPlaytime(entry.playtime)}</span>` : ''}
                    </div>
                    <div class="game-footer">
                        <span class="status-badge ${entry.status}">${entry.status}</span>
                        <div class="game-score-row">
                            ${entry.avgRating ? `<span class="score-val">${parseFloat(entry.avgRating)}/10</span>` : ''}
                            <button onclick="event.stopPropagation(); deleteGame('${entry.id}')" class="btn-delete">Delete</button>
                        </div>
                    </div>
                </div>
            </div>`;
}

//Load Games from database
async function loadGames() {
    startProgress();

    //show skeleton
    const grid = document.getElementById('gamesGrid');
    grid.innerHTML = Array(6).fill(`
                <div class="skeleton">
                    <div class="skeleton-img"></div>
                    <div class="skeleton-body">
                        <div class="skeleton-line skeleton-line-70"></div>
                        <div class="skeleton-line skeleton-line-50"></div>
                        <div class="skeleton-line skeleton-line-30"></div>
                    </div>
                </div>
                `).join('');

    const res = await fetchWithAuth(`${API}/api/entries`);
    const entries = await res.json();

    if (entries.length === 0) {
        grid.innerHTML = '<div class="empty">No games yet. Add your first game!</div>';
        return;
    }

    // Loading reviews for each game
    const entriesWithRatings = await Promise.all(entries.map(async entry => {
        const revRes = await fetchWithAuth(`${API}/api/reviews/game/${entry.game.id}`);
        const reviews = await revRes.json();
        const avg = reviews.length > 0
            ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
            : null;
        return { ...entry, avgRating: avg };
    }));
    allEntries = entriesWithRatings;
    currentEntries = entriesWithRatings;

    document.getElementById('filter-ALL').textContent = `All (${entriesWithRatings.length})`;
    document.getElementById('filter-PLAYING').textContent = `Playing (${entriesWithRatings.filter(e => e.status === 'PLAYING').length})`;
    document.getElementById('filter-PLANNED').textContent = `Planned (${entriesWithRatings.filter(e => e.status === 'PLANNED').length})`;
    document.getElementById('filter-DROPPED').textContent = `Dropped (${entriesWithRatings.filter(e => e.status === 'DROPPED').length})`;
    document.getElementById('filter-COMPLETED').textContent = `Completed (${entriesWithRatings.filter(e => e.status === 'COMPLETED').length})`;
    //game card
    grid.innerHTML = entriesWithRatings.map(entry => renderCard(entry)).join('');
    finishProgress();
}

function filterGames(status) {
    const filtered = status === 'ALL' ? allEntries : allEntries.filter(entry => entry.status === status);
    currentEntries = filtered;

    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(btn => btn.classList.remove('active'));
    document.getElementById(`filter-${status}`).classList.add('active');

    const grid = document.getElementById('gamesGrid');

    if (filtered.length === 0) {
        grid.innerHTML = `<div class="empty">No ${status.toLowerCase()} games yet</div>`;
        return;
    }

    grid.innerHTML = filtered.map(entry => renderCard(entry)).join('');
}

async function addGame() {
    const title = document.getElementById('gameTitle').value;
    const genre = document.getElementById('gameGenre').value;
    const platform = document.getElementById('gamePlatform').value;
    const releaseYear = document.getElementById('gameYear').value;
    const manualForm = document.getElementById('manual-form');
    const isManual = manualForm.style.display !== 'none';
    const status = isManual
        ? document.getElementById('gameStatusManual').value
        : document.getElementById('gameStatus').value;

    if (!title) return showToast('Please enter a game title', 'error');

    // 1. First create a game
    const gameRes = await fetchWithAuth(`${API}/api/games`, {
        method: 'POST',
        body: JSON.stringify({ title, genre, platform, releaseYear: parseInt(releaseYear), coverUrl: selectedCoverUrl })
    });

    if (!gameRes.ok) {
        const error = await gameRes.json();
        showToast("Error: " + Object.values(error).join(", "), 'error');
        return;
    }

    const game = await gameRes.json();

    // 2. Getting users
    const usersRes = await fetchWithAuth(`${API}/api/users/me`);
    const user = await usersRes.json();

    // 3. Creating a record in a collection
    const entryRes = await fetchWithAuth(`${API}/api/entries`, {
        method: 'POST',
        body: JSON.stringify({ game: { id: game.id }, user: { id: user.id }, status })
    });

    if (!entryRes.ok) {
        const error = await entryRes.json();
        showToast("Error: " + error.message, 'error');
        return;
    }

    // Clearing the fields
    document.getElementById('gameTitle').value = '';
    document.getElementById('gameGenre').value = '';
    document.getElementById('gamePlatform').value = '';
    document.getElementById('gameYear').value = '';

    showToast('Game added!', 'success');
    loadGames();
}

async function deleteGame(id) {

    const dialog = document.getElementById('confirm-dialog');
    dialog.style.display = 'flex';
    requestAnimationFrame(() => dialog.classList.add('visible'));

    document.getElementById('confirm-yes').onclick = async () => {
        dialog.classList.remove('visible');
        setTimeout(async () => {
        dialog.style.display = 'none';
        await fetchWithAuth(`${API}/api/entries/${id}`, { method: 'DELETE' });
        showToast('Game deleted!', 'success');
        loadGames();
    }, 200);
    };

    document.getElementById('confirm-no').onclick = () => {
        dialog.classList.remove('visible');
        setTimeout(() => dialog.style.display = 'none', 200);
    };
}

function openSidebar(entry) {
    const banner = document.getElementById('sidebar-banner');
    if (entry.game.coverUrl) {
        banner.style.backgroundImage = `url('${entry.game.coverUrl}')`;
    } else {
        banner.style.backgroundImage = 'none';
    }
    selectedGameId = entry.game.id;
    selectedEntryId = entry.id;

    document.getElementById('sidebar-title').textContent = entry.game.title;
    const completedText = entry.completedAt
        ? ` • Completed ${new Date(entry.completedAt + 'Z').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`
        : '';

    document.getElementById('sidebar-meta').textContent =
        `${entry.game.genre} • ${entry.game.platform} • ${entry.game.releaseYear}${completedText}`;
    document.getElementById('sidebar-status').innerHTML =
        `<span class="status-badge ${entry.status}">${entry.status}</span>`;
    loadReviews(entry.game.id);
    document.getElementById('sidebar').style.transform = 'translateX(0)';
    document.getElementById('overlay').style.display = 'block';
    document.getElementById('status-select').value = entry.status;

    document.body.style.overflow = 'hidden';
}

function closeSidebar() {
    document.getElementById('sidebar').style.transform = 'translateX(100%)';
    document.getElementById('overlay').style.display = 'none';
    selectedGameId = null;

    document.body.style.overflow = '';
}



async function submitReview() {
    const rating = selectedRating;
    const text = document.getElementById('review-text').value;

    if (!rating || !text) {
        showToast('Fill in rating and review text!', 'error');
        return;
    }

    const userRes = await fetchWithAuth(`${API}/api/users/me`);
    const user = await userRes.json();

    const res = await fetchWithAuth(`${API}/api/reviews`, {
        method: 'POST',
        body: JSON.stringify({
            user: { id: user.id },
            game: { id: selectedGameId },
            rating: parseInt(rating),
            text: text
        })
    });

    if (res.ok) {

        document.getElementById('review-text').value = '';
        loadReviews(selectedGameId);
        loadGames();
    } else {
        const error = await res.json();
        showToast('Error: ' + Object.values(error).join(', '), 'error');
    }
}

async function updateStatus(newStatus) {
    const entryId = selectedEntryId;
    await fetchWithAuth(`${API}/api/entries/${entryId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus })
    });
    showToast(`Status updated to "${newStatus.toLowerCase()}"`, 'success');
    loadGames();
}

function setRating(rating) {
    selectedRating = rating;
    document.querySelectorAll('.review-star').forEach(star => {
        star.classList.toggle('active', parseInt(star.dataset.value) <= rating);
    });
}

async function searchGames(query) {
    const results = document.getElementById('search-result');
    if (query.length < 2) {
        results.style.display = 'none';
        return;
    }

    const res = await fetchWithAuth(`${API}/api/igdb/search?query=${encodeURIComponent(query)}`);
    const data = await res.json();

    results.style.display = 'block';
    results.innerHTML = data.map(game => `
            <div class="search-item" onclick="selectGame(${JSON.stringify(game).replace(/"/g, '&quot;')})">
                ${escapeHtml(game.name)}
            </div>
        `).join('');
}

function selectGame(game) {
    const rawUrl = game.cover?.url || '';
    selectedCoverUrl = rawUrl
        ? 'https:' + rawUrl.replace('t_thumb', 't_screenshot_big')
        : '';

    document.getElementById('gameTitle').value = game.name;

    // Genre
    const genreMap = {
        'Role-playing (RPG)': 'RPG',
        'Shooter': 'Shooter',
        'Strategy': 'Strategy',
        'Simulator': 'Simulator',
        'Sport': 'Sports',
        'Puzzle': 'Puzzle',
        'Action': 'Action',
        'Adventure': 'Action',
    };
    const igdbGenre = game.genres?.[0]?.name || '';
    document.getElementById('gameGenre').value = genreMap[igdbGenre] || 'Other';

    // Platform
    const platformMap = {
        'PC (Microsoft Windows)': 'PC',
        'PlayStation 5': 'PlayStation 5',
        'PlayStation 4': 'PlayStation 4',
        'Xbox Series X|S': 'Xbox Series X|S',
        'Nintendo Switch': 'Nintendo Switch',
        'iOS': 'Mobile',
        'Android': 'Mobile',
    };
    const priority = ['PC (Microsoft Windows)', 'PlayStation 5', 'PlayStation 4', 'Xbox Series X|S', 'Nintendo Switch'];
    const platforms = game.platforms?.map(p => p.name) || [];
    const bestPlatform = priority.find(p => platforms.includes(p)) || platforms[0] || '';
    document.getElementById('gamePlatform').value = platformMap[bestPlatform] || 'Other';

    // Year
    document.getElementById('gameYear').value = game.first_release_date
        ? new Date(game.first_release_date * 1000).getFullYear()
        : '';

    document.getElementById('search-result').style.display = 'none';
    document.getElementById('manual-form').style.display = 'block';
}

function showManualForm() {
    const form = document.getElementById('manual-form');
    form.style.display = form.style.display === 'none' ? 'block' : 'none';
}
fetchWithAuth(`${API}/api/users/me`)
    .then(r => r.json())
    .then(user => {
        currentUsername = user.username;
        loadGames();
    });


document.addEventListener('click', function (e) {
    const searchResult = document.getElementById('search-result');
    const gameTitle = document.getElementById('gameTitle');

    if (!gameTitle.contains(e.target) && !searchResult.contains(e.target)) {
        searchResult.style.display = 'none';
    }
});

window.addEventListener('scroll', function () {
    const btn = document.getElementById('back-to-top');
    btn.style.display = window.scrollY > 300 ? 'block' : 'none';
});

function searchLibrary(query) {
    const filtered = query.length < 1
        ? allEntries
        : allEntries.filter(e => e.game.title.toLowerCase().includes(query.toLowerCase()));

    const grid = document.getElementById('gamesGrid');

    if (filtered.length === 0) {
        grid.innerHTML = '<div class="empty">No games found</div>';
        return;
    }

    grid.innerHTML = filtered.map(entry => renderCard(entry)).join('');
}

function sortGames(by) {
    const sorted = [...currentEntries].sort((a, b) => {
        if (by === 'title') return a.game.title.localeCompare(b.game.title);
        if (by === 'rating') return (b.avgRating || 0) - (a.avgRating || 0);
        if (by === 'status') return a.status.localeCompare(b.status);
    });

    const grid = document.getElementById('gamesGrid');
    grid.innerHTML = sorted.map(entry => renderCard(entry)).join('');
}

async function loadReviews(gameId) {
    const res = await fetchWithAuth(`${API}/api/reviews/game/${gameId}`);
    const reviews = await res.json();
    const container = document.getElementById('sidebar-reviews');

    const myReview = reviews.find(r => r.user.username === currentUsername);
    const otherReviews = reviews.filter(r => r.user.username !== currentUsername);

    let html = '';

    //User Review
    if (myReview) {
        html += `<div class="my-review-block">
    <div class="review-existing">
        <div class="review-existing-header">
            <span class="review-score-display">${myReview.rating}<span class="review-score-max">/10</span></span>
            <div class="review-actions">
                <button id="btn-edit-review" class="btn-review-action">Edit</button>
                <button onclick="deleteReview('${myReview.id}')" class="btn-review-delete">Delete</button>
            </div>
        </div>
        <p class="review-text-display">${escapeHtml(myReview.text)}</p>
        <span class="review-date">${new Date(myReview.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
    </div>
    </div>`;
    } else {
        html += `
    <div class="review-form">
        <div class="review-stars">
            ${[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => `<span class="review-star" data-value="${n}" onclick="setRating(${n})">${n}</span>`).join('')}
        </div>
        <textarea id="review-text" class="review-textarea" placeholder="Write your review…"></textarea>
        <button onclick="submitReview()" class="btn-save-review">Save Review</button>
    </div>`;
    }

    if (otherReviews.length > 0) {
        html += `<div class="sidebar-section-title other-reviews-title">Other Reviews</div>`;
        html += otherReviews.map(review => `
            <div class="review-other">
                <div class="review-other-header">
                    <span class="review-other-user">${review.user.username}</span>
                    <span class="review-score-display review-score-other">${review.rating}<span class="review-score-max">/10</span></span>
                </div>
                <p class="review-text-display">${escapeHtml(review.text)}</p>
            </div>`).join('');
    }

    container.innerHTML = html;

    const editBtn = container.querySelector('#btn-edit-review');
    if (editBtn) {
        editBtn.addEventListener('click', () => editReview(myReview.id, myReview.rating, myReview.text));
    }
}

function editReview(id, rating, text) {
    const container = document.getElementById('sidebar-reviews');
    const myReviewBlock = container.querySelector('.my-review-block');

    myReviewBlock.innerHTML = `
        <div class="review-form">
            <div class="review-stars">
                ${[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => `<span class="review-star" data-value="${n}" onclick="setRating(${n})">${n}</span>`).join('')}
            </div>
            <textarea id="review-text" class="review-textarea review-textarea-edit">${escapeHtml(text)}</textarea>
            <div class="review-actions">
                <button onclick="saveEditReview('${id}')" class="btn-save-review review-btn-flex">Save</button>
                <button onclick="loadReviews('${selectedGameId}')" class="btn-review-action review-btn-flex">Cancel</button>
            </div>
        </div>`;

    setRating(rating);
}

async function saveEditReview(id) {
    const newRating = selectedRating;
    const newText = document.getElementById('review-text').value;

    await fetchWithAuth(`${API}/api/reviews/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ rating: parseInt(newRating), text: newText })
    });

    showToast('Review updated!', 'success');
    loadReviews(selectedGameId);
    loadGames();
}
async function deleteReview(id) {
    await fetchWithAuth(`${API}/api/reviews/${id}`, { method: 'DELETE' });
    showToast('Review deleted', 'success');
    loadReviews(selectedGameId);
    loadGames();
}