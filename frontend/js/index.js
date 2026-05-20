const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function updateClock(){
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    const ss = String(now.getSeconds()).padStart(2, '0');

    document.getElementById('clock').textContent = `${hh}:${mm}:${ss}`;
    document.getElementById('date').textContent = `${days[now.getDay()]} · ${months[now.getMonth()]} ${now.getDate()}, ${now.getFullYear()}`;
}

updateClock();
setInterval(updateClock, 1000);

//tabs
function switchTo(name) {
    ['login', 'register'].forEach(n => {
        document.getElementById(`tab-${n}`).classList.toggle('active', n ===name);
        document.getElementById(`form-${n}`).classList.toggle('visible', n === name);
    });
}

document.getElementById('tab-login').addEventListener('click', () => switchTo('login'));
document.getElementById('tab-register').addEventListener('click', () => switchTo('register'));
document.getElementById('go-register').addEventListener('click', () => switchTo('register'));
document.getElementById('go-login').addEventListener('click', () => switchTo('login'));

//password strength
document.getElementById('reg-password').addEventListener('input', function() {
    const v = this.value;
    let score = 0;
    if (v.length >= 8) score++;
    if (/[A-Z]/.test(v) || /[0-9]/.test(v)) score++;
    if (/[^A-Za-z0-9]/.test(v) && v.length >= 10) score++;
    const cls = ['','weak','medium','strong'];
    const lbl = ['', 'Weak', 'Medium', 'Strong'];
    const clr = ['', 'var(--error)', '#d4a853', 'var(--accent)'];
    ['seg1', 'seg2', 'seg3'].forEach((id, i) => {
        const el = document.getElementById(id);
        el.className = 'strength-seg';
        if (v.length > 0 && i < score) el.classList.add(cls[score]);
    });
    const label = document.getElementById('strength-label');
    label.textContent = v.length > 0 ? lbl[score] : '';
    label.style.color = clr[score] || 'var(--text-muted)';
});

//Login -- original Logic preserved
let isLogin = true;

async function handleSubmit() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const msg = document.getElementById('message');

    if(!username || !password) {
        msg.textContent = 'Please fill in all fields';
        msg.className = 'message error';
        return;
    }

    try {
        const response = await fetch('http://127.0.0.1:8080/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json'},
            body: JSON.stringify({username, password})
        });
        const data = await response.json();
        if(response.ok){
            localStorage.setItem('token', data.token);
            msg.textContent = 'Login successful! Redirecting...';
            msg.className = 'message success';
            setTimeout(() => window.location.href = 'http://127.0.0.1:5500/frontend/games.html', 1000);
        } else {
            msg.textContent = data.message || 'Something went wrong.';
            msg.className = 'message error';
        }
    } catch (e) {
        msg.textContent = 'Cannot connect to server.'
        msg.className = 'message error';
    }
}

async function handleRegister() {
    const username = document.getElementById('reg-username').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('reg-password').value;
    const msg = document.getElementById('message-reg');

    if(!username || !email || !password) {
        msg.textContent = 'Please fill in all fields';
        msg.className = 'message error';
        return;
    }
    
    try {
        const response = await fetch('http://127.0.0.1:8080/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json'},
            body: JSON.stringify({username, email, password})
        });
        const data = await response.json();
        if(response.ok) {
            msg.textContent = 'Registered! You can now log in.';
            msg.className = 'message success';
            setTimeout(() => switchTo('login'), 1500);
        }else {
            msg.textContent = data.message || Object.values(data).join(', ') || 'Something went wrong.';
            msg.className = 'message error';
        }
    } catch (e) {
        msg.textContent = 'Cannot connect to server.';
        msg.className = 'message error';
    }
}

document.addEventListener('keydown', e => {if (e.key === 'Enter') {
    const loginVisible = document.getElementById('form-login').classList.contains('visible');
    if (loginVisible) handleSubmit(); else handleRegister();
}});