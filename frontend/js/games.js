        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
            closeSidebar();
            }
        });

        let selectedRating = 0;


        async function loadGames() {
            const res = await fetchWithAuth(`${API}/api/entries`);
            const entries = await res.json();
            const grid = document.getElementById('gamesGrid');

            if (entries.length === 0) {
                grid.innerHTML = '<div class="empty">No games yet. Add your first game!</div>';
                return;
            }

    // Загружаем рецензии для каждой игры
            const entriesWithRatings = await Promise.all(entries.map(async entry => {
                const revRes = await fetchWithAuth(`${API}/api/reviews/game/${entry.game.id}`);
                const reviews = await revRes.json();
                const avg = reviews.length > 0 
                    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
                    : null;
                return { ...entry, avgRating: avg };
            }));
            allEntries = entriesWithRatings;

            document.getElementById('filter-ALL').textContent = `All (${entriesWithRatings.length})`;
            document.getElementById('filter-PLAYING').textContent = `Playing (${entriesWithRatings.filter(e => e.status ==='PLAYING').length})`;
            document.getElementById('filter-PLANNED').textContent = `Planned (${entriesWithRatings.filter(e => e.status ==='PLANNED').length})`;
            document.getElementById('filter-DROPPED').textContent = `Dropped (${entriesWithRatings.filter(e => e.status ==='DROPPED').length})`;
            document.getElementById('filter-COMPLETED').textContent = `Completed (${entriesWithRatings.filter(e => e.status ==='COMPLETED').length})`;

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
        }

        function filterGames(status) {
            const filtered = status === 'ALL' ? allEntries : allEntries.filter(entry => entry.status === status);
            
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

            if (!title) return alert('Please enter a game title');

            // 1. Сначала создаём игру
            const gameRes = await fetchWithAuth(`${API}/api/games`, {
                method: 'POST',
                body: JSON.stringify({ title, genre, platform, releaseYear: parseInt(releaseYear), coverUrl: selectedCoverUrl })
            });
            
            if(!gameRes.ok) {
                const error = await gameRes.json();
                alert("Error: " + Object.values(error).join(", "));
                return;
            }

            const game = await gameRes.json();

            // 2. Получаем пользователей
            const usersRes = await fetchWithAuth(`${API}/api/users/me`);
            const user = await usersRes.json();

            // 3. Создаём запись в коллекции
            await fetchWithAuth(`${API}/api/entries`, {
                method: 'POST',
                body: JSON.stringify({ game: { id: game.id }, user: { id: user.id }, status })
            });

            // Очищаем поля
            document.getElementById('gameTitle').value = '';
            document.getElementById('gameGenre').value = '';
            document.getElementById('gamePlatform').value = '';
            document.getElementById('gameYear').value = '';

            loadGames();
        }

        async function deleteGame(id) {
            if(!confirm('Are you sure you want to delete this game?')) return;
            await fetchWithAuth(`${API}/api/entries/${id}`, {
                method: 'DELETE'
            });
            loadGames();
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

        async function loadReviews(gameId) {
            const res = await fetchWithAuth(`${API}/api/reviews/game/${gameId}`);
            const reviews = await res.json();
            const container = document.getElementById('sidebar-reviews');

            if (reviews.length === 0) {
                container.innerHTML = '<p style="color: #6b7280; font-size:14px">No reviews yet</p>';
                return;
            }

            container.innerHTML = reviews.map(review => `
            <div style="background:#0f0f1a; border-radius:8px; padding:12px; margin-bottom: 12px; border:1px solid #2d2d44">
                <div style="display:flex; justify-content:space-between; margin-bottom:8px">
                    <span style="color:#818cf8; font-size:13px">${review.user.username}</span>
                    <span style="color:#f59e0b; font-size:13px">⭐ ${review.rating}/10</span>
                </div>
                <p style="color:#d1d5db; font-size:13px; margin:0 0 8px 0">${review.text}</p>
                <span style="color:#4b5563; font-size:11px">${new Date(review.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
            </div>
            `).join('');
        }

        async function submitReview() {
            const rating = selectedRating;
            const text = document.getElementById('review-text').value;

            if(!rating || !text) {
                alert('Fill in rating and review text!');
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
                alert('Error: ' + Object.values(error).join(', '));
            }
        }

        async function updateStatus(newStatus) {
            const entryId = selectedEntryId;
            await fetchWithAuth(`${API}/api/entries/${entryId}/status`, {
                method: 'PUT',
                body: JSON.stringify({ status: newStatus })
            });
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
loadGames();

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