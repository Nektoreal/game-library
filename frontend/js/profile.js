

        async function loadProfile() {
            startProgress();
            const userRes = await fetchWithAuth(`${API}/api/users/me`);
            const user = await userRes.json();
            
            document.getElementById('profile-username').textContent = user.username;
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

            const avgRating = reviews.length > 0
                ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
                : null;

            const genreCount = {};
            entries.forEach(e => {
                const genre = e.game.genre;
                genreCount[genre] = (genreCount[genre] || 0) + 1;
            });

            const topGenres = Object.entries(genreCount)
                .sort((a, b) => b[1] - a[1])
                .slice(0,3);


            const lastReviews = reviews.slice(-3).reverse();

            document.getElementById('avg-rating').textContent = avgRating || '—';
            document.getElementById('member-since').textContent = new Date(user.createdAt).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });

            document.getElementById('top-genres').innerHTML = topGenres.map(([genre, count]) => `
                <div style="display:flex; justify-content:space-between; padding:8px 0; border-bottom:1px solid #2d2d44;">
                    <span style="color:#ffffff;">${genre}</span>
                    <span style="color:#6b7280;">${count} games</span>
                </div>
            `).join('');

            document.getElementById('last-reviews').innerHTML = lastReviews.length > 0 ? lastReviews.map(r => `
                <div style="padding:12px 0; border-bottom:1px solid #2d2d44;">
                    <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
                        <span style="color:#ffffff; font-size:14px;">${r.game.title}</span>
                        <span style="color:#f59e0b; font-size:13px;">⭐ ${r.rating}/10</span>
                    </div>
                    <p style="color:#6b7280; font-size:13px;">${r.text}</p>
                </div>
            `).join('') : '<p style="color:#6b7280; font-size:14px;">No reviews yet</p>';
            finishProgress();
        }
        loadProfile();