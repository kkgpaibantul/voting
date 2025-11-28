// Konfigurasi Google Apps Script
const GAS_URL = 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec';

// Fungsi untuk memanggil Google Apps Script
async function callGoogleScript(action, parameters = {}) {
    try {
        const url = new URL(GAS_URL);
        url.searchParams.append('action', action);
        
        // Tambahkan parameter lainnya
        Object.keys(parameters).forEach(key => {
            url.searchParams.append(key, parameters[key]);
        });

        const response = await fetch(url, {
            method: 'GET',
            mode: 'no-cors'
        });

        // Karena no-cors, kita perlu menggunakan workaround
        return await callGoogleScriptPost(action, parameters);
        
    } catch (error) {
        console.error('Error calling Google Script:', error);
        throw error;
    }
}

// Alternative method menggunakan POST
async function callGoogleScriptPost(action, parameters = {}) {
    try {
        const formData = new FormData();
        formData.append('action', action);
        
        Object.keys(parameters).forEach(key => {
            formData.append(key, parameters[key]);
        });

        const response = await fetch(GAS_URL, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data;
        
    } catch (error) {
        console.error('Error in POST request:', error);
        throw error;
    }
}

// Utility functions
function showLoading(button) {
    const originalText = button.innerHTML;
    button.innerHTML = '<span class="loading"></span> Memproses...';
    button.disabled = true;
    return originalText;
}

function hideLoading(button, originalText) {
    button.innerHTML = originalText;
    button.disabled = false;
}

function showAlert(message, type = 'error') {
    // Remove existing alerts
    const existingAlert = document.querySelector('.alert');
    if (existingAlert) {
        existingAlert.remove();
    }

    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type}`;
    alertDiv.textContent = message;

    // Insert at the top of the main content
    const mainContent = document.querySelector('main');
    mainContent.insertBefore(alertDiv, mainContent.firstChild);

    // Auto remove after 5 seconds
    setTimeout(() => {
        alertDiv.remove();
    }, 5000);
}

// Local storage management
function saveToStorage(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        console.error('Error saving to storage:', error);
    }
}

function getFromStorage(key) {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : null;
    } catch (error) {
        console.error('Error reading from storage:', error);
        return null;
    }
}

function removeFromStorage(key) {
    try {
        localStorage.removeItem(key);
    } catch (error) {
        console.error('Error removing from storage:', error);
    }
}

// Session management
function setSession(key, value) {
    saveToStorage(key, value);
}

function getSession(key) {
    return getFromStorage(key);
}

function clearSession() {
    const keys = ['adminSession', 'voterSession', 'publicAccess'];
    keys.forEach(key => removeFromStorage(key));
}

// Check if user is authenticated
function isAuthenticated() {
    return getSession('adminSession') || getSession('voterSession') || getSession('publicAccess');
}

// Redirect if not authenticated
function requireAuth(redirectUrl = 'login.html') {
    if (!isAuthenticated()) {
        window.location.href = redirectUrl;
        return false;
    }
    return true;
}
