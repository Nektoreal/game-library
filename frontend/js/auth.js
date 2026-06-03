const API = 'http://127.0.0.1:8080';
const token = localStorage.getItem('token');

const urlParams = new URLSearchParams(window.location.search);
const isPublicPage = urlParams.get('user') !== null;

if (!token && !isPublicPage) window.location.href = 'index.html';

async function fetchWithAuth(url, options = {}) {
    const res = await fetch(url, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            ...options.headers
        }
    });

    if (res.status === 401) {
        localStorage.removeItem('token');
        window.location.href = 'index.html';
        return;
    }

    return res;
}

function logout() {
    localStorage.removeItem('token');
    window.location.href = 'index.html';
}

function startProgress() {
    const bar = document.getElementById('progress-bar');
    bar.style.opacity = '1';
    bar.style.width = '0%';
    bar.style.transition = 'width 2s ease';
    setTimeout(() => { bar.style.width = '85%'; }, 10);
}

function finishProgress() {
    const bar = document.getElementById('progress-bar');
    bar.style.transition = 'width 0.2s ease';
    bar.style.width = '100%';
    setTimeout(() => {
        bar.style.opacity = '0';
        bar.style.transition = 'opacity 0.3s ease';
        setTimeout(() => {
            bar.style.width = '0%';
            bar.style.opacity = '1';
        }, 300);
    }, 200);
}

function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}