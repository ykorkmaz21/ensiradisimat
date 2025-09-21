// Video Player Page JavaScript

let currentVideoId = '';
let currentVideoTitle = '';

// Initialize video player page
document.addEventListener('DOMContentLoaded', function() {
    console.log('Video player page initialized');
    
    // Get video data from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const videoId = urlParams.get('id');
    const title = urlParams.get('title');
    const description = urlParams.get('description');
    const duration = urlParams.get('duration');
    const views = urlParams.get('views');
    const category = urlParams.get('category');
    
    if (videoId) {
        currentVideoId = videoId;
        currentVideoTitle = title || 'Video';
        loadVideo(videoId, title, description, duration, views, category);
    } else {
        // No video ID provided, redirect to videos page
        window.location.href = '/videos.html';
    }
});

// Load video
function loadVideo(videoId, title, description, duration, views, category) {
    console.log('Loading video:', videoId);
    
    // Update page title
    document.title = `${title} | En Sıra Dışı Matematik`;
    
    // Update video info
    document.getElementById('videoTitle').textContent = title || 'Video Başlığı';
    document.getElementById('videoDescription').textContent = description || 'Video açıklaması';
    document.getElementById('videoCategory').textContent = category || 'Kategori';
    document.getElementById('videoDuration').innerHTML = `<i class="fas fa-clock"></i> ${duration || 'Süre'}`;
    document.getElementById('videoViews').innerHTML = `<i class="fas fa-eye"></i> ${views || 'Görüntülenme'}`;
    
    // Show loading state
    const iframeContainer = document.getElementById('videoIframeContainer');
    iframeContainer.innerHTML = `
        <div class="video-loading">
            <i class="fas fa-spinner fa-spin"></i>
            Video yükleniyor...
        </div>
    `;
    
    // Load iframe after a short delay
    setTimeout(() => {
        iframeContainer.innerHTML = '';
        const iframe = document.createElement('iframe');
        iframe.src = `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&autoplay=1`;
        iframe.frameBorder = '0';
        iframe.allowFullscreen = true;
        iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
        iframeContainer.appendChild(iframe);
    }, 1000);
}

// Open video in YouTube
function openInYouTube() {
    if (currentVideoId) {
        window.open(`https://www.youtube.com/watch?v=${currentVideoId}`, '_blank');
    }
}

// Go back to videos page
function goBack() {
    window.location.href = '/videos.html';
}

// Go home
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

// Add scroll effect to header
window.addEventListener('scroll', function() {
    const header = document.querySelector('.video-player-header');
    if (window.scrollY > 50) {
        header.style.background = 'rgba(255, 255, 255, 0.98)';
        header.style.borderBottom = '1px solid rgba(0, 0, 0, 0.1)';
    } else {
        header.style.background = 'rgba(255, 255, 255, 0.95)';
        header.style.borderBottom = '1px solid var(--border)';
    }
});

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Escape key to go back
    if (e.key === 'Escape') {
        goBack();
    }
    
    // Space key to pause/play (if video is focused)
    if (e.key === ' ' && e.target.tagName !== 'INPUT') {
        e.preventDefault();
        // This would require more complex implementation with YouTube API
    }
});
