// Authentication functions
async function handleVoterLogin(token) {
    const button = event.target.querySelector('button[type="submit"]');
    const originalText = showLoading(button);

    try {
        const response = await callGoogleScript('authenticateVoter', { token });

        if (response.status === 'success') {
            setSession('voterSession', response.sessionToken);
            setSession('voterData', {
                token: token,
                candidates: response.candidates,
                maxChoices: response.maxChoices
            });
            
            showAlert('Login berhasil! Mengarahkan ke halaman voting...', 'success');
            setTimeout(() => {
                window.location.href = 'voting.html';
            }, 2000);
        } else {
            showAlert(response.message);
        }
    } catch (error) {
        showAlert('Terjadi kesalahan sistem. Silakan coba lagi.');
        console.error('Login error:', error);
    } finally {
        hideLoading(button, originalText);
    }
}

async function handleAdminLogin(token) {
    const button = event.target.querySelector('button[type="submit"]');
    const originalText = showLoading(button);

    try {
        const response = await callGoogleScript('loginAdmin', { token });

        if (response.status === 'success') {
            if (response.userType === 'admin') {
                setSession('adminSession', response.sessionToken);
                showAlert('Login admin berhasil!', 'success');
                setTimeout(() => {
                    window.location.href = 'admin.html';
                }, 1500);
            } else {
                setSession('publicAccess', true);
                showAlert('Akses publik diberikan!', 'success');
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1500);
            }
        } else {
            showAlert(response.message);
        }
    } catch (error) {
        showAlert('Terjadi kesalahan sistem. Silakan coba lagi.');
        console.error('Admin login error:', error);
    } finally {
        hideLoading(button, originalText);
    }
}

async function handlePublicLogin(token) {
    const button = event.target.querySelector('button[type="submit"]');
    const originalText = showLoading(button);

    try {
        const response = await callGoogleScript('loginAdmin', { token });

        if (response.status === 'success') {
            setSession('publicAccess', true);
            showAlert('Akses publik diberikan!', 'success');
            setTimeout(() => {
                window.location.href = 'results.html';
            }, 1500);
        } else {
            showAlert(response.message);
        }
    } catch (error) {
        showAlert('Terjadi kesalahan sistem. Silakan coba lagi.');
        console.error('Public login error:', error);
    } finally {
        hideLoading(button, originalText);
    }
}

// Logout function
function logout() {
    clearSession();
    showAlert('Anda telah logout.', 'success');
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1500);
}

// Check authentication status on page load
function checkAuthStatus() {
    if (window.location.pathname.includes('admin.html') && !getSession('adminSession')) {
        window.location.href = 'login.html';
    }
    
    if (window.location.pathname.includes('voting.html') && !getSession('voterSession')) {
        window.location.href = 'login.html';
    }
}

// Initialize auth check
document.addEventListener('DOMContentLoaded', checkAuthStatus);
