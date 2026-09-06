const API_BASE_URL = '/api';

// --- Authentication & Token Management ---
function setAuthData(token, user) {
    localStorage.setItem('jwtToken', token);
    localStorage.setItem('user', JSON.stringify(user));
}

function getAuthToken() {
    return localStorage.getItem('jwtToken');
}

function getUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
}

function logout() {
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('user');
    window.location.href = '/login.html';
}

function isAuthenticated() {
    return !!getAuthToken();
}

// --- API Fetch Utility ---
async function apiFetch(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = getAuthToken();

    const headers = {
        'Content-Type': 'application/json',
        ...(options.headers || {})
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
        ...options,
        headers
    };

    try {
        const response = await fetch(url, config);
        
        if (response.status === 401) {
            // Unauthorized, token might be expired
            logout();
            throw new Error('Session expired. Please log in again.');
        }

        const contentType = response.headers.get('content-type');
        let data;
        if (contentType && contentType.includes('application/json')) {
            data = await response.json();
        } else {
            data = await response.text();
        }

        if (!response.ok) {
            throw new Error(data.message || data || 'An error occurred');
        }

        return data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// --- UI Utilities ---
function showAlert(message, type = 'error') {
    const alertEl = document.getElementById('alert');
    if (alertEl) {
        alertEl.textContent = message;
        alertEl.className = `alert ${type}`;
        alertEl.style.display = 'block';
        setTimeout(() => {
            alertEl.style.display = 'none';
        }, 5000);
    }
}

function showLoader() {
    const loader = document.getElementById('loader');
    if (loader) loader.classList.add('active');
}

function hideLoader() {
    const loader = document.getElementById('loader');
    if (loader) loader.classList.remove('active');
}

// --- Auth Initialization UI ---
function updateNavbar() {
    const navLinks = document.getElementById('nav-links');
    if (!navLinks) return;

    if (isAuthenticated()) {
        const user = getUser();
        navLinks.innerHTML = `
            <a href="/index.html">Events</a>
            <a href="/my-bookings.html">My Bookings</a>
            <span style="color: var(--text-secondary)">Hi, ${user.name}</span>
            <button class="btn btn-secondary" onclick="logout()" style="padding: 0.5rem 1rem;">Logout</button>
        `;
    } else {
        navLinks.innerHTML = `
            <a href="/index.html">Events</a>
            <a href="/login.html" class="btn btn-secondary" style="padding: 0.5rem 1rem;">Login</a>
            <a href="/register.html" class="btn btn-primary" style="padding: 0.5rem 1rem;">Register</a>
        `;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    updateNavbar();
});
