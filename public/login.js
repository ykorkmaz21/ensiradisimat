// Login Page JavaScript

// Initialize login page
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM Content Loaded');
    initializeLogin();
    setupEventListeners();
});

// Initialize login page
function initializeLogin() {
    console.log('Login page initialized');
    
    // Check if user is already logged in
    const token = localStorage.getItem('adminToken');
    if (token) {
        console.log('Token found, verifying...');
        // Verify token with server
        verifyToken(token);
    } else {
        console.log('No token found, showing login form');
    }
}

// Setup event listeners
function setupEventListeners() {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        console.log('Login form found, adding event listener');
        loginForm.addEventListener('submit', handleLogin);
    } else {
        console.error('Login form not found!');
    }
}

// Handle login form submission
async function handleLogin(e) {
    e.preventDefault();
    console.log('Login form submitted');
    
    const formData = new FormData(e.target);
    const username = formData.get('username');
    const password = formData.get('password');
    const rememberMe = formData.get('rememberMe');
    
    console.log('Login attempt:', { username, password: '***', rememberMe });
    
    // Show loading state
    showLoading(true);
    
    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            // Store token
            localStorage.setItem('adminToken', data.token);
            
            if (rememberMe) {
                localStorage.setItem('rememberMe', 'true');
            }
            
            // Check if user needs to change password
            if (data.user && data.user.needsPasswordChange) {
                showMessage('İlk girişiniz! Lütfen şifrenizi değiştirin.', 'info');
                showPasswordChangeModal(data.user);
            } else {
                // Show success message
                showMessage('Giriş başarılı! Yönlendiriliyorsunuz...', 'success');
                
                // Redirect based on user role
                setTimeout(() => {
                    if (data.user && data.user.role === 'admin') {
                        window.location.href = '/admin.html';
                    } else {
                        window.location.href = '/videos.html';
                    }
                }, 1500);
            }
            
        } else {
            showMessage(data.message || 'Giriş başarısız!', 'error');
            showLoading(false);
        }
        
    } catch (error) {
        console.error('Login error:', error);
        showMessage('Bağlantı hatası! Lütfen tekrar deneyin.', 'error');
        showLoading(false);
    }
}

// Verify existing token
async function verifyToken(token) {
    try {
        const response = await fetch('/api/auth/verify', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.ok) {
            const userData = await response.json();
            // Token is valid, redirect based on user role
            if (userData.user && userData.user.role === 'admin') {
                window.location.href = '/admin.html';
            } else {
                window.location.href = '/videos.html';
            }
        } else {
            // Token is invalid, remove it
            localStorage.removeItem('adminToken');
        }
    } catch (error) {
        console.error('Token verification error:', error);
        localStorage.removeItem('adminToken');
    }
}

// Toggle password visibility
function togglePassword() {
    const passwordInput = document.getElementById('password');
    const toggleIcon = document.getElementById('passwordToggleIcon');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleIcon.classList.remove('fa-eye');
        toggleIcon.classList.add('fa-eye-slash');
    } else {
        passwordInput.type = 'password';
        toggleIcon.classList.remove('fa-eye-slash');
        toggleIcon.classList.add('fa-eye');
    }
}

// Show/hide loading state
function showLoading(show) {
    const loadingOverlay = document.getElementById('loadingOverlay');
    const loginBtn = document.getElementById('loginBtn');
    
    if (show) {
        loadingOverlay.classList.add('active');
        loginBtn.disabled = true;
    } else {
        loadingOverlay.classList.remove('active');
        loginBtn.disabled = false;
    }
}

// Show message
function showMessage(message, type) {
    // Remove existing messages
    const existingMessages = document.querySelectorAll('.message');
    existingMessages.forEach(msg => msg.remove());
    
    // Create new message
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = message;
    
    // Insert at the top of login form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.insertBefore(messageDiv, loginForm.firstChild);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            messageDiv.remove();
        }, 5000);
    }
}

// Logout function (can be called from other pages)
function logout() {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('rememberMe');
    window.location.href = '/login.html';
}

// Check authentication for admin pages
function checkAuth() {
    const token = localStorage.getItem('adminToken');
    if (!token) {
        window.location.href = '/login.html';
        return false;
    }
    return true;
}


// Show password change modal
function showPasswordChangeModal(user) {
    // Create modal HTML
    const modalHTML = `
        <div class="password-change-modal" id="passwordChangeModal">
            <div class="modal-overlay"></div>
            <div class="modal-content">
                <div class="modal-header">
                    <h3><i class="fas fa-key"></i> Şifre Değiştir</h3>
                    <p>İlk girişiniz için şifrenizi değiştirmeniz gerekiyor.</p>
                </div>
                <div class="modal-body">
                    <form id="passwordChangeForm">
                        <div class="form-group">
                            <label for="newPassword">Yeni Şifre</label>
                            <div class="password-input-container">
                                <input type="password" id="newPassword" name="newPassword" 
                                       placeholder="Yeni şifrenizi girin" required minlength="6">
                                <button type="button" class="password-toggle" onclick="toggleNewPassword()">
                                    <i class="fas fa-eye" id="newPasswordToggleIcon"></i>
                                </button>
                            </div>
                        </div>
                        <div class="form-group">
                            <label for="confirmPassword">Şifre Tekrar</label>
                            <div class="password-input-container">
                                <input type="password" id="confirmPassword" name="confirmPassword" 
                                       placeholder="Yeni şifrenizi tekrar girin" required minlength="6">
                                <button type="button" class="password-toggle" onclick="toggleConfirmPassword()">
                                    <i class="fas fa-eye" id="confirmPasswordToggleIcon"></i>
                                </button>
                            </div>
                        </div>
                        <div class="password-requirements">
                            <small>Şifre en az 6 karakter olmalıdır</small>
                        </div>
                        <div class="modal-actions">
                            <button type="submit" class="btn-primary" id="changePasswordBtn">
                                <i class="fas fa-save"></i>
                                Şifreyi Değiştir
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `;
    
    // Add modal to page
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Setup form event listener
    const form = document.getElementById('passwordChangeForm');
    form.addEventListener('submit', handlePasswordChange);
    
    // Show modal
    const modal = document.getElementById('passwordChangeModal');
    modal.style.display = 'flex';
    
    // Focus on first input
    document.getElementById('newPassword').focus();
}

// Handle password change form submission
async function handlePasswordChange(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const newPassword = formData.get('newPassword');
    const confirmPassword = formData.get('confirmPassword');
    
    // Validate passwords match
    if (newPassword !== confirmPassword) {
        showMessage('Şifreler eşleşmiyor!', 'error');
        return;
    }
    
    // Validate password length
    if (newPassword.length < 6) {
        showMessage('Şifre en az 6 karakter olmalıdır!', 'error');
        return;
    }
    
    // Show loading
    const changeBtn = document.getElementById('changePasswordBtn');
    const originalText = changeBtn.innerHTML;
    changeBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Değiştiriliyor...';
    changeBtn.disabled = true;
    
    try {
        const response = await fetch('/api/users/change-password', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
            },
            body: JSON.stringify({
                currentPassword: '', // Empty for first-time password change
                newPassword: newPassword
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showMessage('Şifre başarıyla değiştirildi! Yönlendiriliyorsunuz...', 'success');
            
            // Close modal
            closePasswordChangeModal();
            
            // Redirect based on user role
            setTimeout(() => {
                const token = localStorage.getItem('adminToken');
                const payload = JSON.parse(atob(token.split('.')[1]));
                
                if (payload.role === 'admin') {
                    window.location.href = '/admin.html';
                } else {
                    window.location.href = '/videos.html';
                }
            }, 2000);
            
        } else {
            showMessage(data.message || 'Şifre değiştirilirken hata oluştu!', 'error');
            changeBtn.innerHTML = originalText;
            changeBtn.disabled = false;
        }
        
    } catch (error) {
        console.error('Password change error:', error);
        showMessage('Bağlantı hatası! Lütfen tekrar deneyin.', 'error');
        changeBtn.innerHTML = originalText;
        changeBtn.disabled = false;
    }
}

// Close password change modal
function closePasswordChangeModal() {
    const modal = document.getElementById('passwordChangeModal');
    if (modal) {
        modal.remove();
    }
}

// Toggle new password visibility
function toggleNewPassword() {
    const passwordInput = document.getElementById('newPassword');
    const toggleIcon = document.getElementById('newPasswordToggleIcon');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleIcon.classList.remove('fa-eye');
        toggleIcon.classList.add('fa-eye-slash');
    } else {
        passwordInput.type = 'password';
        toggleIcon.classList.remove('fa-eye-slash');
        toggleIcon.classList.add('fa-eye');
    }
}

// Toggle confirm password visibility
function toggleConfirmPassword() {
    const passwordInput = document.getElementById('confirmPassword');
    const toggleIcon = document.getElementById('confirmPasswordToggleIcon');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleIcon.classList.remove('fa-eye');
        toggleIcon.classList.add('fa-eye-slash');
    } else {
        passwordInput.type = 'password';
        toggleIcon.classList.remove('fa-eye-slash');
        toggleIcon.classList.add('fa-eye');
    }
}

// Make functions globally available
window.logout = logout;
window.checkAuth = checkAuth;
window.togglePassword = togglePassword;
window.toggleNewPassword = toggleNewPassword;
window.toggleConfirmPassword = toggleConfirmPassword;
