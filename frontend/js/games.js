        //Close sidebar with "ESC" - key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
            closeSidebar();
            }
        });

        let selectedRating = 0;
        
        let currentEntries = null;

        let currentUsername = null;

        //Load Games from database
        async function loadGames() {
            startProgress();
            const res = await fetchWithAuth(`${API}/api/entries`);
            const entries = await res.json();
            const grid = document.getElementById('gamesGrid');

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
            document.getElementById('filter-PLAYING').textContent = `Playing (${entriesWithRatings.filter(e => e.status ==='PLAYING').length})`;
            document.getElementById('filter-PLANNED').textContent = `Planned (${entriesWithRatings.filter(e => e.status ==='PLANNED').length})`;
            document.getElementById('filter-DROPPED').textContent = `Dropped (${entriesWithRatings.filter(e => e.status ==='DROPPED').length})`;
            document.getElementById('filter-COMPLETED').textContent = `Completed (${entriesWithRatings.filter(e => e.status ==='COMPLETED').length})`;
            //game card
            grid.innerHTML = entriesWithRatings.map(entry => `
            <div class="game-card" onclick="openSidebar(${JSON.stringify(entry).replace(/"/g, '&quot;')})" style="cursor:pointer; overflow:hidden; padding:0; ${entry.game.coverUrl ? `background-image: url('${entry.game.coverUrl}'); background-size: cover; background-position: center;` : ''}">
            ${entry.game.coverUrl ? `
        <div style="position:relative; height:160px; overflow:hidden;">
             <img src="${entry.game.coverUrl}" style="width:100%; height:100%; object-fit:cover;" />
            <div style="position:absolute; bottom:0; left:0; right:0; height:80px; background: linear-gradient(to bottom, transparent, #1a1a2e);"></div>
                </div>
                 ` : `
                 <div style="width:100%; height:160px; background:#2d2d44; display:flex; align-items:center; justify-content:center; color:#6b7280;">No cover</div>
            `}
            <div style="padding:16px; background: rgba(15, 15, 26, 0.85); backdrop-filter: blur(2px);">
                <div class="game-title">${entry.game.title}</div>
                <div class="game-meta">${entry.game.genre} • ${entry.game.platform} • ${entry.game.releaseYear}</div>
                <div style="display:flex; justify-content:space-between; align-items:center; margin-top:8px">
                <span class="status-badge ${entry.status}">${entry.status}</span>
                <div style="display:flex; align-items:center; gap:8px">
                    ${entry.avgRating ? `<span style="color:#f59e0b; font-size:13px">⭐ ${entry.avgRating}</span>` : ''}
                    <button onclick="event.stopPropagation(); deleteGame('${entry.id}')" style="background:transparent; border:1px solid #7f1d1d; color:#fca5a5; padding:4px 10px; border-radius:6px; cursor:pointer; font-size:12px">Delete</button>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
        finishProgress();
        }

        function filterGames(status) {
            const filtered = status === 'ALL' ? allEntries : allEntries.filter(entry => entry.status === status);
            currentEntries = filtered;
            
            const grid = document.getElementById('gamesGrid');

            if (filtered.length === 0) {
                grid.innerHTML = `<div class="empty">No ${status.toLowerCase()} games yet</div>`;
                return;
            }

            const filterButtons = document.querySelectorAll('.filter-btn');

            filterButtons.forEach(btn => btn.classList.remove('active'));
            document.getElementById(`filter-${status}`).classList.add('active');


            grid.innerHTML = filtered.map(entry => `
            <div class="game-card" onclick="openSidebar(${JSON.stringify(entry).replace(/"/g, '&quot;')})" style="cursor:pointer; overflow:hidden; padding:0; ${entry.game.coverUrl ? `background-image: url('${entry.game.coverUrl}'); background-size: cover; background-position: center;` : ''}">
            ${entry.game.coverUrl ? `
            <div style="position:relative; height:160px; overflow:hidden;">
            <img src="${entry.game.coverUrl}" style="width:100%; height:100%; object-fit:cover;" />
            <div style="position:absolute; bottom:0; left:0; right:0; height:80px; background: linear-gradient(to bottom, transparent, #1a1a2e);"></div>
                </div>
                ` : `
                <div style="width:100%; height:160px; background:#2d2d44; display:flex; align-items:center;             justify-content:center; color:#6b7280;">No cover</div>
            `}
            <div style="padding:16px; background: rgba(15, 15, 26, 0.85); backdrop-filter: blur(2px);">
                <div class="game-title">${entry.game.title}</div>
                <div class="game-meta">${entry.game.genre} • ${entry.game.platform} • ${entry.game.releaseYear}</div>
                <div style="display:flex; justify-content:space-between; align-items:center; margin-top:8px">
                <span class="status-badge ${entry.status}">${entry.status}</span>
                <div style="display:flex; align-items:center; gap:8px">
                    ${entry.avgRating ? `<span style="color:#f59e0b; font-size:13px">⭐ ${entry.avgRating}</span>` : ''}
                    <button onclick="event.stopPropagation(); deleteGame('${entry.id}')" style="background:transparent; border:1px solid #7f1d1d; color:#fca5a5; padding:4px 10px; border-radius:6px; cursor:pointer; font-size:12px">Delete</button>
                    </div>
                </div>
            </div>
        </div>
        `).join('');
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
            
            if(!gameRes.ok) {
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

            document.getElementById('confirm-yes').onclick = async () => {
                dialog.style.display = 'none';
                await fetchWithAuth(`${API}/api/entries/${id}`, {method: 'DELETE'});
                showToast('Game deleted!', 'success');
                loadGames();
            };

            document.getElementById('confirm-no').onclick = () => {
                dialog.style.display = 'none';
            };
        }

        let selectedGameId = null;
        let selectedEntryId = null;

        let allEntries = null;

        function openSidebar(entry) {
            const banner = document.getElementById('sidebar-banner');
            if (entry.game.coverUrl){
                banner.style.backgroundImage = `url('${entry.game.coverUrl}')`;
            } else {
                banner.style.backgroundImage = 'none';
            }
            selectedGameId = entry.game.id;
            selectedEntryId = entry.id;
            
            document.getElementById('sidebar-title').textContent = entry.game.title;
            document.getElementById('sidebar-meta').textContent = 
                `${entry.game.genre} • ${entry.game.platform} • ${entry.game.releaseYear}`;
            document.getElementById('sidebar-status').innerHTML = 
                `<span class = "status-badge ${entry.status}">${entry.status}</span>`;
            loadReviews(entry.game.id);
            document.getElementById('sidebar').style.transform = 'translateX(0)';
            document.getElementById('overlay').style.display = 'block'; 
            document.getElementById('status-select').value = entry.status;
        }

        function closeSidebar(){
            document.getElementById('sidebar').style.transform = 'translateX(100%)';
            document.getElementById('overlay').style.display = 'none';
            selectedGameId = null;
        }



        async function submitReview() {
            const rating = selectedRating;
            const text = document.getElementById('review-text').value;

            if(!rating || !text) {
                showToast('Fill in rating and review text!', 'error');
                return;
            }

            const userRes = await fetchWithAuth(`${API}/api/users/me`);
            const user = await userRes.json();

            const res = await fetchWithAuth(`${API}/api/reviews`, {
                method: 'POST',
                body: JSON.stringify({
                    user: {id:user.id},
                    game: {id:selectedGameId},
                    rating: parseInt(rating),
                    text: text
                })
            });

            if(res.ok) {
        
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

        function setRating(rating){
            selectedRating = rating;
            const allStars = document.querySelectorAll('.star');
            allStars.forEach(star => 
                {
                    if (star.dataset.value <= rating){
                        star.style.opacity = '1';
                    } else {
                        star.style.opacity = '0.3';
                    }
                }
            )
        }
        const RAWG_KEY = '7f894402cc6d4e9d82c7aa85dda167a0';

        async function  searchGames(query) {
            const results = document.getElementById('search-result');

            if (query.length < 2) {
                results.style.display = 'none';
                return;
            }

            const res = await fetch(`https://api.rawg.io/api/games?key=${RAWG_KEY}&search=${query}&page_size=5`);
            const data = await res.json();

            results.style.display = 'block';
            results.innerHTML = data.results.map(game => `
            <div onclick="selectGame(${JSON.stringify(game).replace(/"/g, '&quot;')})" style="padding: 10px; cursor: pointer;">
                ${game.name}
            </div>
        `).join('');
        }
        let selectedCoverUrl = '';

        function selectGame(game) {
            selectedCoverUrl = game.background_image || '';
            
            document.getElementById('gameTitle').value = game.name;
            document.getElementById('gameGenre').value = game.genres[0].name;
            document.getElementById('gamePlatform').value = game.parent_platforms[0].platform.name;
            document.getElementById('gameYear').value = game.released.substring(0,4);
            document.getElementById('search-result').style.display= 'none';
             document.getElementById('manual-form').style.display = 'block';
        }

        function showManualForm(){
            const form = document.getElementById('manual-form');
            form.style.display = form.style.display === 'none' ? 'block' : 'none';
        }
    fetchWithAuth(`${API}/api/users/me`)
        .then(r => r.json())
        .then(user => {
            currentUsername = user.username;
            loadGames();
        });


document.addEventListener('click', function(e) {
    const searchResult = document.getElementById('search-result');
    const gameTitle = document.getElementById('gameTitle');
    
    if (!gameTitle.contains(e.target) && !searchResult.contains(e.target)) {
        searchResult.style.display = 'none';
    } else {

    }
});

window.addEventListener('scroll', function() {
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

    grid.innerHTML = filtered.map(entry => `<div class="game-card" onclick="openSidebar(${JSON.stringify(entry).replace(/"/g, '&quot;')})" style="cursor:pointer; overflow:hidden; padding:0; ${entry.game.coverUrl ? `background-image: url('${entry.game.coverUrl}'); background-size: cover; background-position: center;` : ''}">
    ${entry.game.coverUrl ? `
        <div style="position:relative; height:160px; overflow:hidden;">
            <img src="${entry.game.coverUrl}" style="width:100%; height:100%; object-fit:cover;" />
            <div style="position:absolute; bottom:0; left:0; right:0; height:80px; background: linear-gradient(to bottom, transparent, #1a1a2e);"></div>
        </div>
    ` : `
        <div style="width:100%; height:160px; background:#2d2d44; display:flex; align-items:center; justify-content:center; color:#6b7280;">No cover</div>
    `}
    <div style="padding:16px; background: rgba(15, 15, 26, 0.85); backdrop-filter: blur(2px);">
        <div class="game-title">${entry.game.title}</div>
        <div class="game-meta">${entry.game.genre} • ${entry.game.platform} • ${entry.game.releaseYear}</div>
        <div style="display:flex; justify-content:space-between; align-items:center; margin-top:8px">
            <span class="status-badge ${entry.status}">${entry.status}</span>
            <div style="display:flex; align-items:center; gap:8px">
                ${entry.avgRating ? `<span style="color:#f59e0b; font-size:13px">⭐ ${entry.avgRating}</span>` : ''}
                <button onclick="event.stopPropagation(); deleteGame('${entry.id}')" style="background:transparent; border:1px solid #7f1d1d; color:#fca5a5; padding:4px 10px; border-radius:6px; cursor:pointer; font-size:12px">Delete</button>
            </div>
        </div>
    </div>
</div>`).join('');
}

function sortGames(by) {
    const sorted = [...currentEntries].sort((a, b) => {
        if (by === 'title') return a.game.title.localeCompare(b.game.title);
        if (by === 'rating') return (b.avgRating || 0) - (a.avgRating || 0);
        if (by === 'status') return a.status.localeCompare(b.status);
    });

    const grid = document.getElementById('gamesGrid');
    grid.innerHTML = sorted.map(entry => `<div class="game-card" onclick="openSidebar(${JSON.stringify(entry).replace(/"/g, '&quot;')})" style="cursor:pointer; overflow:hidden; padding:0; ${entry.game.coverUrl ? `background-image: url('${entry.game.coverUrl}'); background-size: cover; background-position: center;` : ''}">
    ${entry.game.coverUrl ? `
        <div style="position:relative; height:160px; overflow:hidden;">
            <img src="${entry.game.coverUrl}" style="width:100%; height:100%; object-fit:cover;" />
            <div style="position:absolute; bottom:0; left:0; right:0; height:80px; background: linear-gradient(to bottom, transparent, #1a1a2e);"></div>
        </div>
    ` : `
        <div style="width:100%; height:160px; background:#2d2d44; display:flex; align-items:center; justify-content:center; color:#6b7280;">No cover</div>
    `}
    <div style="padding:16px; background: rgba(15, 15, 26, 0.85); backdrop-filter: blur(2px);">
        <div class="game-title">${entry.game.title}</div>
        <div class="game-meta">${entry.game.genre} • ${entry.game.platform} • ${entry.game.releaseYear}</div>
        <div style="display:flex; justify-content:space-between; align-items:center; margin-top:8px">
            <span class="status-badge ${entry.status}">${entry.status}</span>
            <div style="display:flex; align-items:center; gap:8px">
                ${entry.avgRating ? `<span style="color:#f59e0b; font-size:13px">⭐ ${entry.avgRating}</span>` : ''}
                <button onclick="event.stopPropagation(); deleteGame('${entry.id}')" style="background:transparent; border:1px solid #7f1d1d; color:#fca5a5; padding:4px 10px; border-radius:6px; cursor:pointer; font-size:12px">Delete</button>
            </div>
        </div>
    </div>
</div>`).join('');
}

async function loadReviews(gameId) {
    const res = await fetchWithAuth(`${API}/api/reviews/game/${gameId}`);
    const reviews = await res.json();
    const container = document.getElementById('sidebar-reviews');

    const myReview = reviews.find(r => r.user.username === currentUsername);
    const otherReviews = reviews.filter(r => r.user.username !== currentUsername);

    let html = '';

    //User Review
    html += `<h4 style="color:#818cf8; font-size:13px; margin-bottom:8px;">My Review</h4>`;
    if (myReview) {
    html += `<div class="my-review-block">`;
    html += `
    <div style="background:#0f0f1a; border-radius:8px; padding:12px; margin-bottom: 16px; border:1px solid #6366f1">
        <div style="display:flex; justify-content:space-between; margin-bottom:8px">
            <span style="color:#f59e0b; font-size:13px">⭐ ${myReview.rating}/10</span>
            <div style="display:flex; gap:8px;">
                <button onclick="editReview('${myReview.id}', ${myReview.rating}, '${myReview.text.replace(/'/g,"\\'")}')" style="background:transparent; border:1px solid #6366f1; color:#818cf8; padding:2px 8px; border-radius:6px; cursor:pointer; font-size:11px">Edit</button>
                <button onclick="deleteReview('${myReview.id}')" style="background:transparent; border:1px solid #7f1d1d; color:#fca5a5; padding:2px 8px; border-radius:6px; cursor:pointer; font-size:11px">Delete</button>
            </div>
        </div>
        <p style="color:#d1d5db; font-size:14px; margin:0 0 8px 0; line-height:1.6; white-space:pre-wrap;">${myReview.text}</p>
        <span style="color:#4b5563; font-size:11px">${new Date(myReview.createdAt).toLocaleDateString('en-GB', {day:'numeric', month:'short', year:'numeric'})}</span>
    </div>`;
    html += `</div>`;
} else {
    html += `
    <div style="margin-bottom:16px;">
        <div style="margin-bottom:12px;">
            <span class="star" data-value="1" onclick="setRating(1)">⭐</span>
            <span class="star" data-value="2" onclick="setRating(2)">⭐</span>
            <span class="star" data-value="3" onclick="setRating(3)">⭐</span>
            <span class="star" data-value="4" onclick="setRating(4)">⭐</span>
            <span class="star" data-value="5" onclick="setRating(5)">⭐</span>
            <span class="star" data-value="6" onclick="setRating(6)">⭐</span>
            <span class="star" data-value="7" onclick="setRating(7)">⭐</span>
            <span class="star" data-value="8" onclick="setRating(8)">⭐</span>
            <span class="star" data-value="9" onclick="setRating(9)">⭐</span>
            <span class="star" data-value="10" onclick="setRating(10)">⭐</span>
        </div>
        <textarea id="review-text" placeholder="Write your review..." style="width:100%; height:200px; padding:12px; background:#0f0f1a; border:1px solid #2d2d44; border-radius:8px; color:#fff; resize:none; font-size:14px; margin-bottom:8px;"></textarea>
        <button id="review-submit-btn" onclick="submitReview()" style="width:100%; padding:10px; background:#6366f1; color:white; border:none; border-radius:8px; cursor:pointer; font-size:14px;">Save Review</button>
    </div>`;
}

    //Reviews from friends
    if (otherReviews.length > 0){
        html += `<h4 style="color:#818cf8; font-size:13px; margin-bottom:8px;">Other Reviews</h4>`;
        html += otherReviews.map(review => `
            <div style="background:#0f0f1a; border-radius:8px; padding:12px; margin-bottom:12px; border:1px solid #2d2d44">
                <div style="display:flex; justify-content:space-beetwen; margin-bottom:8px">
                    <span style="color:#818cf8; font-size:13px">${review.user.username}</span>
                    <span style="color:#f59e0b; font-size:13px">⭐ ${review.rating}/10</span>
                </div>
                <p style="color:#d1d5db; font-size:13px; margin:0 0 8px 0; white-space:pre-wrap">${review.text}</p>
            </div>`).join('');
    }

    container.innerHTML = html;
}

function editReview(id, rating, text) {
    const container = document.getElementById('sidebar-reviews');
    const myReviewBlock = container.querySelector('.my-review-block');
    
    myReviewBlock.innerHTML = `
        <div style="margin-bottom:16px;">
            <div style="margin-bottom:12px;">
                <span class="star" data-value="1" onclick="setRating(1)">⭐</span>
                <span class="star" data-value="2" onclick="setRating(2)">⭐</span>
                <span class="star" data-value="3" onclick="setRating(3)">⭐</span>
                <span class="star" data-value="4" onclick="setRating(4)">⭐</span>
                <span class="star" data-value="5" onclick="setRating(5)">⭐</span>
                <span class="star" data-value="6" onclick="setRating(6)">⭐</span>
                <span class="star" data-value="7" onclick="setRating(7)">⭐</span>
                <span class="star" data-value="8" onclick="setRating(8)">⭐</span>
                <span class="star" data-value="9" onclick="setRating(9)">⭐</span>
                <span class="star" data-value="10" onclick="setRating(10)">⭐</span>
            </div>
            <textarea id="review-text" style="width:100%; height:160px; padding:12px; background:#0f0f1a; border:1px solid #2d2d44; border-radius:8px; color:#fff; resize:none; font-size:14px; margin-bottom:8px;">${text}</textarea>
            <div style="display:flex; gap:8px;">
                <button onclick="saveEditReview('${id}')" style="flex:1; padding:10px; background:#6366f1; color:white; border:none; border-radius:8px; cursor:pointer; font-size:14px;">Save</button>
                <button onclick="loadReviews('${selectedGameId}')" style="flex:1; padding:10px; background:transparent; color:#ffffff; border:1px solid #2d2d44; border-radius:8px; cursor:pointer; font-size:14px;">Cancel</button>
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
        await fetchWithAuth(`${API}/api/reviews/${id}`, { method: 'DELETE'});
        showToast('Review deleted', 'success');
        loadReviews(selectedGameId);
        loadGames();
    }