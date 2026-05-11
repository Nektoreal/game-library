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