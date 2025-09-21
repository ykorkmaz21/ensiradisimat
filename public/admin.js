// Admin Panel JavaScript

// Global variables
let allVideos = [];
let currentFilter = 'all';

// Initialize admin panel
document.addEventListener('DOMContentLoaded', function() {
    // Check authentication first
    if (!checkAuth()) {
        return;
    }
    
    initializeAdmin();
    setupEventListeners();
    loadVideos();
    loadUsers();
    setupUserEventListeners();
});

// Initialize admin panel
function initializeAdmin() {
    // Add smooth scrolling
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.5s ease';
    
    window.addEventListener('load', function() {
        document.body.style.opacity = '1';
    });
}

// Setup event listeners
function setupEventListeners() {
    // Video upload form
    const uploadForm = document.getElementById('videoUploadForm');
    if (uploadForm) {
        uploadForm.addEventListener('submit', handleVideoUpload);
    }
    
    // Video edit form
    const editForm = document.getElementById('editVideoForm');
    if (editForm) {
        editForm.addEventListener('submit', handleVideoEdit);
    }
    
    // Filter buttons
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const filter = this.getAttribute('data-filter');
            filterVideos(filter);
            
            // Update active button
            filterBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
        });
    });
}

// Load videos from server
async function loadVideos() {
    try {
        const token = localStorage.getItem('adminToken');
        const response = await fetch('/api/videos', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.ok) {
            allVideos = await response.json();
            displayVideos();
            updateVideoCount();
        } else if (response.status === 401) {
            // Token expired, redirect to login
            localStorage.removeItem('adminToken');
            window.location.href = '/login.html';
        } else {
            console.error('Failed to load videos');
            showMessage('Videolar yüklenirken hata oluştu', 'error');
        }
    } catch (error) {
        console.error('Error loading videos:', error);
        showMessage('Videolar yüklenirken hata oluştu', 'error');
    }
}

// Display videos in the list
function displayVideos() {
    const videoList = document.getElementById('videoList');
    if (!videoList) return;
    
    const filteredVideos = currentFilter === 'all' 
        ? allVideos 
        : allVideos.filter(video => video.category === currentFilter);
    
    if (filteredVideos.length === 0) {
        videoList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-video"></i>
                <p>Henüz video bulunmuyor</p>
            </div>
        `;
        return;
    }
    
    videoList.innerHTML = filteredVideos.map(video => `
        <div class="video-item" data-video-id="${video.id}">
            <div class="video-thumbnail">
                <img src="${video.thumbnail}" alt="${video.title}" loading="lazy">
            </div>
            <div class="video-info">
                <h4>${video.title}</h4>
                <div class="video-meta">
                    <span class="video-category">${getCategoryName(video.category)}</span>
                    <span><i class="fas fa-clock"></i> ${video.duration}</span>
                    <span><i class="fas fa-eye"></i> ${video.views}</span>
                </div>
                <p class="video-description">${video.description}</p>
            </div>
            <div class="video-actions">
                <button class="btn-edit" onclick="editVideo('${video.id}')">
                    <i class="fas fa-edit"></i>
                    Düzenle
                </button>
                <button class="btn-delete" onclick="deleteVideo('${video.id}')">
                    <i class="fas fa-trash"></i>
                    Sil
                </button>
            </div>
        </div>
    `).join('');
}

// Filter videos
function filterVideos(filter) {
    currentFilter = filter;
    displayVideos();
}

// Update video count
function updateVideoCount() {
    const videoCount = document.getElementById('videoCount');
    if (videoCount) {
        const count = currentFilter === 'all' ? allVideos.length : allVideos.filter(v => v.category === currentFilter).length;
        videoCount.textContent = `(${count} video)`;
    }
}

// Handle video upload
async function handleVideoUpload(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const youtubeUrl = formData.get('youtubeUrl');
    const title = formData.get('videoTitle');
    const description = formData.get('videoDescription');
    const category = formData.get('videoCategory');
    const duration = formData.get('videoDuration');
    const views = formData.get('videoViews');
    
    // Extract video ID from YouTube URL
    const videoId = extractVideoId(youtubeUrl);
    if (!videoId) {
        showMessage('Geçersiz YouTube linki. Lütfen doğru bir YouTube linki girin.', 'error');
        return;
    }
    
    const videoData = {
        title,
        description,
        category,
        duration,
        views,
        videoId,
        thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
        publishDate: new Date().toISOString().split('T')[0]
    };
    
    try {
        const token = localStorage.getItem('adminToken');
        const response = await fetch('/api/videos', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(videoData)
        });
        
        if (response.ok) {
            showMessage('Video başarıyla eklendi!', 'success');
            e.target.reset();
            loadVideos();
        } else {
            const error = await response.json();
            showMessage(error.message || 'Video eklenirken hata oluştu', 'error');
        }
    } catch (error) {
        console.error('Error adding video:', error);
        showMessage('Video eklenirken hata oluştu', 'error');
    }
}

// Handle video edit
async function handleVideoEdit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const videoId = document.getElementById('editVideoId').value;
    const title = document.getElementById('editVideoTitle').value;
    const description = document.getElementById('editVideoDescription').value;
    const category = document.getElementById('editVideoCategory').value;
    const duration = document.getElementById('editVideoDuration').value;
    const views = document.getElementById('editVideoViews').value;
    
    const videoData = {
        title,
        description,
        category,
        duration,
        views
    };
    
    try {
        const token = localStorage.getItem('adminToken');
        const response = await fetch(`/api/videos/${videoId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(videoData)
        });
        
        if (response.ok) {
            showMessage('Video başarıyla güncellendi!', 'success');
            closeEditModal();
            loadVideos();
        } else {
            const error = await response.json();
            showMessage(error.message || 'Video güncellenirken hata oluştu', 'error');
        }
    } catch (error) {
        console.error('Error updating video:', error);
        showMessage('Video güncellenirken hata oluştu', 'error');
    }
}

// Edit video
function editVideo(videoId) {
    const video = allVideos.find(v => v.id === videoId);
    if (!video) return;
    
    // Fill edit form
    document.getElementById('editVideoId').value = video.id;
    document.getElementById('editVideoTitle').value = video.title;
    document.getElementById('editVideoDescription').value = video.description;
    document.getElementById('editVideoCategory').value = video.category;
    document.getElementById('editVideoDuration').value = video.duration;
    document.getElementById('editVideoViews').value = video.views;
    
    // Show modal
    document.getElementById('editModal').classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Close edit modal
function closeEditModal() {
    document.getElementById('editModal').classList.remove('active');
    document.body.style.overflow = 'auto';
}

// Delete video
async function deleteVideo(videoId) {
    if (!confirm('Bu videoyu silmek istediğinizden emin misiniz?')) {
        return;
    }
    
    try {
        const token = localStorage.getItem('adminToken');
        const response = await fetch(`/api/videos/${videoId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.ok) {
            showMessage('Video başarıyla silindi!', 'success');
            loadVideos();
        } else {
            const error = await response.json();
            showMessage(error.message || 'Video silinirken hata oluştu', 'error');
        }
    } catch (error) {
        console.error('Error deleting video:', error);
        showMessage('Video silinirken hata oluştu', 'error');
    }
}

// Extract video ID from YouTube URL
function extractVideoId(url) {
    const patterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
        /youtube\.com\/watch\?.*v=([^&\n?#]+)/
    ];
    
    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) {
            return match[1];
        }
    }
    
    return null;
}

// Get category display name
function getCategoryName(category) {
    const categoryNames = {
        'tutorials': 'Konu Anlatımı',
        'problem-solving': 'Problem Çözme',
        'exam-prep': 'Sınav Hazırlık',
        'tips': 'İpuçları'
    };
    return categoryNames[category] || category;
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
    
    // Insert at the top of admin content
    const adminContent = document.querySelector('.admin-content .container');
    if (adminContent) {
        adminContent.insertBefore(messageDiv, adminContent.firstChild);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            messageDiv.remove();
        }, 5000);
    }
}

// Authentication functions
function checkAuth() {
    const token = localStorage.getItem('adminToken');
    if (!token) {
        window.location.href = '/login.html';
        return false;
    }
    
    // Check if user has admin role
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.role !== 'admin') {
            localStorage.removeItem('adminToken');
            localStorage.removeItem('rememberMe');
            window.location.href = '/login.html';
            return false;
        }
    } catch (error) {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('rememberMe');
        window.location.href = '/login.html';
        return false;
    }
    
    return true;
}

// Logout function
async function logout() {
    try {
        const token = localStorage.getItem('adminToken');
        await fetch('/api/auth/logout', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
    } catch (error) {
        console.error('Logout error:', error);
    } finally {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('rememberMe');
        window.location.href = '/login.html';
    }
}

// Navigation functions
function goHome() {
    window.location.href = '/';
}

// Social media functions
function openInstagram() {
    window.open('https://www.instagram.com/ensiradisimat/', '_blank');
}

function openYouTube() {
    window.open('http://youtube.com/user/kolaymatgeo', '_blank');
}

// Close modal when clicking outside
document.addEventListener('click', function(e) {
    const modal = document.getElementById('editModal');
    if (e.target === modal) {
        closeEditModal();
    }
});

// Close modal with Escape key
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeEditModal();
    }
});

// Add scroll effect to header
window.addEventListener('scroll', function() {
    const header = document.querySelector('.header');
    if (window.scrollY > 50) {
        header.style.background = 'rgba(255, 255, 255, 0.98)';
        header.style.borderBottom = '1px solid rgba(0, 0, 0, 0.1)';
    } else {
        header.style.background = 'rgba(255, 255, 255, 0.95)';
        header.style.borderBottom = '1px solid var(--border)';
    }
});

// User Management Functions
let allUsers = [];

// Load users on page load (integrated with existing DOMContentLoaded)

// Setup user management event listeners
function setupUserEventListeners() {
    // Add user form
    const addUserForm = document.getElementById('addUserForm');
    if (addUserForm) {
        addUserForm.addEventListener('submit', handleAddUser);
    }
}

// Load users from API
async function loadUsers() {
    try {
        const response = await fetch('/api/users', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
            }
        });
        
        if (response.ok) {
            allUsers = await response.json();
            displayUsers();
        } else {
            const errorData = await response.json();
            console.error('Failed to load users:', errorData);
            showMessage('Kullanıcılar yüklenirken hata oluştu: ' + errorData.message, 'error');
        }
    } catch (error) {
        console.error('Error loading users:', error);
        showMessage('Kullanıcılar yüklenirken hata oluştu', 'error');
    }
}

// Display users in the table
function displayUsers() {
    const usersList = document.getElementById('usersList');
    if (!usersList) {
        console.error('Users list element not found!');
        return;
    }
    
    usersList.innerHTML = '';
    
    allUsers.forEach(user => {
        const userItem = createUserItem(user);
        usersList.appendChild(userItem);
    });
}

// Create user item element
function createUserItem(user) {
    const userItem = document.createElement('div');
    userItem.className = 'user-item';
    userItem.setAttribute('data-user-id', user.id);
    
    userItem.innerHTML = `
        <div class="user-info">
            <div class="user-name">${user.username}</div>
            <div class="user-email">${user.email}</div>
            <span class="user-role ${user.role}">${user.role === 'admin' ? 'Admin' : 'Kullanıcı'}</span>
        </div>
        <div class="user-actions">
            <button class="btn-reset-password" onclick="resetUserPassword('${user.id}')" title="Şifre Sıfırla">
                <i class="fas fa-key"></i>
            </button>
            <button class="btn-delete-user" onclick="deleteUser('${user.id}')" title="Kullanıcıyı Sil">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `;
    
    return userItem;
}

// Generate temporary password
function generateTempPassword() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 12; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    document.getElementById('tempPassword').value = password;
    return password;
}

// Handle add user form submission
async function handleAddUser(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const userData = {
        username: formData.get('username'),
        email: formData.get('email'),
        password: formData.get('tempPassword'),
        role: formData.get('role')
    };
    
    if (!userData.password) {
        showMessage('Lütfen geçici şifre oluşturun', 'error');
        return;
    }
    
    try {
        const response = await fetch('/api/users', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
            },
            body: JSON.stringify(userData)
        });
        
        const result = await response.json();
        
        if (response.ok) {
            showMessage('Kullanıcı başarıyla eklendi!', 'success');
            showTempPassword(result.tempPassword);
            e.target.reset();
            loadUsers();
        } else {
            showMessage(result.message || 'Kullanıcı eklenirken hata oluştu', 'error');
        }
    } catch (error) {
        console.error('Error adding user:', error);
        showMessage('Kullanıcı eklenirken hata oluştu', 'error');
    }
}

// Show temporary password to admin
function showTempPassword(tempPassword) {
    const existingDisplay = document.querySelector('.temp-password-display');
    if (existingDisplay) {
        existingDisplay.remove();
    }
    
    const display = document.createElement('div');
    display.className = 'temp-password-display';
    display.innerHTML = `
        <h4>Kullanıcıya Verilecek Geçici Şifre:</h4>
        <div class="password-text">${tempPassword}</div>
        <button class="copy-btn" onclick="copyToClipboard('${tempPassword}')">
            <i class="fas fa-copy"></i>
            Kopyala
        </button>
    `;
    
    document.querySelector('.add-user-form').appendChild(display);
    
    // Auto-hide after 30 seconds
    setTimeout(() => {
        if (display.parentNode) {
            display.remove();
        }
    }, 30000);
}

// Copy password to clipboard
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showMessage('Şifre panoya kopyalandı!', 'success');
    }).catch(() => {
        showMessage('Kopyalama başarısız', 'error');
    });
}

// Reset user password
async function resetUserPassword(userId) {
    if (!confirm('Bu kullanıcının şifresini sıfırlamak istediğinizden emin misiniz?')) {
        return;
    }
    
    try {
        const response = await fetch(`/api/users/${userId}/reset-password`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
            }
        });
        
        const result = await response.json();
        
        if (response.ok) {
            showMessage('Şifre sıfırlandı!', 'success');
            showTempPassword(result.tempPassword);
        } else {
            showMessage(result.message || 'Şifre sıfırlanırken hata oluştu', 'error');
        }
    } catch (error) {
        console.error('Error resetting password:', error);
        showMessage('Şifre sıfırlanırken hata oluştu', 'error');
    }
}

// Delete user
async function deleteUser(userId) {
    if (!confirm('Bu kullanıcıyı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.')) {
        return;
    }
    
    try {
        const response = await fetch(`/api/users/${userId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
            }
        });
        
        const result = await response.json();
        
        if (response.ok) {
            showMessage('Kullanıcı silindi!', 'success');
            loadUsers();
        } else {
            showMessage(result.message || 'Kullanıcı silinirken hata oluştu', 'error');
        }
    } catch (error) {
        console.error('Error deleting user:', error);
        showMessage('Kullanıcı silinirken hata oluştu', 'error');
    }
}

// Make functions globally available
window.generateTempPassword = generateTempPassword;
window.resetUserPassword = resetUserPassword;
window.deleteUser = deleteUser;
window.copyToClipboard = copyToClipboard;
