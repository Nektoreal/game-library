const API = 'http://127.0.0.1:8080';
const token = localStorage.getItem('token');

if (!token) window.location.href = 'index.html';

async function fetchWithAuth(url, options = {}) {
    return fetch(url, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            ...options.headers
        }
    });
}

function logout() {
    localStorage.removeItem('token');
    window.location.href = 'index.html';
}

function startProgress(){
    const bar = document.getElementById('progress-bar');
    bar.style.width = '70%';
}

function finishProgress(){
    const bar = document.getElementById('progress-bar');
    bar.style.width = '100%';
    setTimeout(() => { bar.style.width = '0%';}, 300);
}