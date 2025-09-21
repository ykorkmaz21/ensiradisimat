// Videos Page JavaScript

let currentCategory = 'all';
let allVideos = [];

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    // Update navigation for logged in user
    updateNavigation();
    
    initializeVideos();
    setupEventListeners();
    loadVideosFromAPI();
});

// Load videos from API
async function loadVideosFromAPI() {
    try {
        console.log('Loading videos from API...');
        const response = await fetch('/api/public/videos');
        
        if (response.ok) {
            allVideos = await response.json();
            console.log('Videos loaded from API:', allVideos.length);
            displayVideos();
        } else {
            console.error('Failed to load videos, status:', response.status);
            // Fallback: try to load from static data
            loadVideosFromStatic();
        }
    } catch (error) {
        console.error('Error loading videos:', error);
        // Fallback: try to load from static data
        loadVideosFromStatic();
    }
}

// Fallback function to load videos from static data
function loadVideosFromStatic() {
    console.log('Loading videos from static data...');
    // Static video data as fallback
    allVideos = [
        {
            "id": "1",
            "title": "Matematik Dersi - Video 1",
            "description": "En Sıra Dışı Matematik eğitim videosu. Matematik konularının detaylı anlatımı ve örnek soru çözümleri.",
            "thumbnail": "https://img.youtube.com/vi/4sSwVUP0Is8/maxresdefault.jpg",
            "videoId": "4sSwVUP0Is8",
            "duration": "15:30",
            "views": "1.2K",
            "category": "tutorials",
            "publishDate": "2024-09-15"
        },
        {
            "id": "2",
            "title": "Matematik Dersi - Video 2",
            "description": "Matematik problem çözme teknikleri ve adım adım çözüm yöntemleri. Öğrenciler için faydalı ipuçları.",
            "thumbnail": "https://img.youtube.com/vi/SZnrZGrX9bo/maxresdefault.jpg",
            "videoId": "SZnrZGrX9bo",
            "duration": "18:45",
            "views": "980",
            "category": "problem-solving",
            "publishDate": "2024-09-15"
        },
        {
            "id": "3",
            "title": "Matematik Problem Çözme Teknikleri",
            "description": "Matematik problemlerini çözme teknikleri ve stratejileri. Adım adım çözüm yöntemleri ile matematik becerilerinizi geliştirin.",
            "thumbnail": "https://img.youtube.com/vi/wBs4RbfdjMg/maxresdefault.jpg",
            "videoId": "wBs4RbfdjMg",
            "duration": "22:15",
            "views": "1.5K",
            "category": "problem-solving",
            "publishDate": "2024-09-15"
        },
        {
            "id": "4",
            "title": "Geometri Konu Anlatımı",
            "description": "Geometri konularının detaylı anlatımı. Temel geometrik şekiller ve özellikleri hakkında kapsamlı bilgi.",
            "thumbnail": "https://img.youtube.com/vi/sPd3VhBxmyE/maxresdefault.jpg",
            "videoId": "sPd3VhBxmyE",
            "duration": "19:30",
            "views": "1.1K",
            "category": "tutorials",
            "publishDate": "2024-09-15"
        },
        {
            "id": "5",
            "title": "Cebir ve Denklem Çözme",
            "description": "Cebirsel ifadeler ve denklem çözme teknikleri. Matematiksel düşünme becerilerinizi geliştirin.",
            "thumbnail": "https://img.youtube.com/vi/3d0Pxz-utiI/maxresdefault.jpg",
            "videoId": "3d0Pxz-utiI",
            "duration": "25:45",
            "views": "1.8K",
            "category": "tutorials",
            "publishDate": "2024-09-15"
        },
        {
            "id": "6",
            "title": "Sınav Hazırlık İpuçları",
            "description": "Matematik sınavlarına hazırlık için önemli ipuçları ve stratejiler. Başarılı olmak için gerekli teknikler.",
            "thumbnail": "https://img.youtube.com/vi/yv0hqMn_Rac/maxresdefault.jpg",
            "videoId": "yv0hqMn_Rac",
            "duration": "16:20",
            "views": "2.1K",
            "category": "exam-prep",
            "publishDate": "2024-09-15"
        },
        {
            "id": "7",
            "title": "Matematik Hesaplama Teknikleri",
            "description": "Hızlı ve doğru hesaplama teknikleri. Matematiksel işlemlerde pratik yöntemler ve ipuçları.",
            "thumbnail": "https://img.youtube.com/vi/m22TewnqY5o/maxresdefault.jpg",
            "videoId": "m22TewnqY5o",
            "duration": "20:10",
            "views": "1.3K",
            "category": "tips",
            "publishDate": "2024-09-15"
        },
        {
            "id": "8",
            "title": "Fonksiyonlar ve Grafikler",
            "description": "Fonksiyon kavramı ve grafik çizimi. Matematiksel fonksiyonların görselleştirilmesi ve analizi.",
            "thumbnail": "https://img.youtube.com/vi/vXIxV-rZgSU/maxresdefault.jpg",
            "videoId": "vXIxV-rZgSU",
            "duration": "24:35",
            "views": "1.6K",
            "category": "tutorials",
            "publishDate": "2024-09-15"
        },
        {
            "id": "9",
            "title": "Trigonometri Temelleri",
            "description": "Trigonometrik fonksiyonlar ve temel kavramlar. Açı hesaplamaları ve trigonometrik oranlar.",
            "thumbnail": "https://img.youtube.com/vi/mR5hhRCdwz4/maxresdefault.jpg",
            "videoId": "mR5hhRCdwz4",
            "duration": "28:40",
            "views": "1.4K",
            "category": "tutorials",
            "publishDate": "2024-09-15"
        },
        {
            "id": "10",
            "title": "Matematik Problem Çözme Stratejileri",
            "description": "Karmaşık matematik problemlerini çözme stratejileri. Analitik düşünme ve problem çözme becerileri.",
            "thumbnail": "https://img.youtube.com/vi/egVzBvzENv8/maxresdefault.jpg",
            "videoId": "egVzBvzENv8",
            "duration": "26:15",
            "views": "1.9K",
            "category": "problem-solving",
            "publishDate": "2024-09-15"
        }
    ];
    displayVideos();
}

// Initialize videos page
function initializeVideos() {
    // Add smooth scrolling
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.5s ease';
    
    window.addEventListener('load', function() {
        document.body.style.opacity = '1';
    });
}

// Setup event listeners
function setupEventListeners() {
    // Category tabs
    const categoryTabs = document.querySelectorAll('.category-tab');
    categoryTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const category = this.getAttribute('data-category');
            filterVideosByCategory(category);
            
            // Update active tab
            categoryTabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
        });
    });
    
}

// Filter videos by category
function filterVideosByCategory(category) {
    currentCategory = category;
    displayVideos();
}

// Display videos in the grid
function displayVideos() {
    console.log('Displaying videos...');
    const videosGrid = document.getElementById('videosGrid');
    if (!videosGrid) {
        console.error('Videos grid element not found!');
        return;
    }
    
    console.log('Total videos:', allVideos.length);
    videosGrid.innerHTML = '';
    
    const filteredVideos = currentCategory === 'all' 
        ? allVideos 
        : allVideos.filter(video => video.category === currentCategory);
    
    console.log('Filtered videos:', filteredVideos.length);
    
    if (filteredVideos.length === 0) {
        videosGrid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 3rem; color: #666;">
                <i class="fas fa-video" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.5;"></i>
                <h3>Henüz video bulunmuyor</h3>
                <p>Bu kategoride henüz video bulunmuyor.</p>
            </div>
        `;
        return;
    }
    
    filteredVideos.forEach((video, index) => {
        console.log(`Creating video card ${index + 1}:`, video.title);
        const videoCard = createVideoCard(video);
        videosGrid.appendChild(videoCard);
    });
}

// Create video card element
function createVideoCard(video) {
    console.log('Creating video card for:', video.title);
    const card = document.createElement('div');
    card.className = 'video-card';
    card.setAttribute('data-video-id', video.videoId);
    card.setAttribute('data-category', video.category);
    
    // Create thumbnail container
    const thumbnailContainer = document.createElement('div');
    thumbnailContainer.className = 'video-thumbnail';
    thumbnailContainer.onclick = () => playVideo(video.videoId, thumbnailContainer);
    
    const img = document.createElement('img');
    img.src = video.thumbnail;
    img.alt = video.title;
    img.loading = 'lazy';
    
    const playButton = document.createElement('div');
    playButton.className = 'play-button';
    playButton.innerHTML = '<i class="fas fa-play"></i>';
    
    thumbnailContainer.appendChild(img);
    thumbnailContainer.appendChild(playButton);
    
    // Create iframe container
    const iframeContainer = document.createElement('div');
    iframeContainer.className = 'video-iframe-container';
    iframeContainer.style.display = 'none';
    
    // Create video content
    const content = document.createElement('div');
    content.className = 'video-content';
    
    const title = document.createElement('h3');
    title.className = 'video-title';
    title.textContent = video.title;
    
    const description = document.createElement('p');
    description.className = 'video-description';
    description.textContent = video.description;
    
    const meta = document.createElement('div');
    meta.className = 'video-meta';
    meta.innerHTML = `
        <span class="video-category">${getCategoryName(video.category)}</span>
        <span class="video-duration">
            <i class="fas fa-clock"></i>
            ${video.duration}
        </span>
        <span class="video-views">
            <i class="fas fa-eye"></i>
            ${video.views}
        </span>
    `;
    
    const actions = document.createElement('div');
    actions.className = 'video-actions';
    actions.innerHTML = `
        <button class="btn-primary" onclick="openVideoPlayer('${video.videoId}', '${video.title}', '${video.description}', '${video.duration}', '${video.views}', '${getCategoryName(video.category)}')">
            <i class="fas fa-play"></i>
            Videoyu İzle
        </button>
    `;
    
    content.appendChild(title);
    content.appendChild(description);
    content.appendChild(meta);
    content.appendChild(actions);
    
    // Create player container
    const playerContainer = document.createElement('div');
    playerContainer.className = 'video-player-container';
    playerContainer.appendChild(thumbnailContainer);
    playerContainer.appendChild(iframeContainer);
    
    card.appendChild(playerContainer);
    card.appendChild(content);
    
    console.log('Video card created successfully');
    return card;
}

// Open video player in new page
function openVideoPlayer(videoId, title, description, duration, views, category) {
    console.log('Opening video player for:', videoId);
    
    // Encode parameters for URL
    const params = new URLSearchParams({
        id: videoId,
        title: title,
        description: description,
        duration: duration,
        views: views,
        category: category
    });
    
    // Open video player page
    window.open(`/video-player.html?${params.toString()}`, '_blank');
}

// Play video function (for thumbnail click)
function playVideo(videoId, thumbnailElement) {
    console.log('Playing video:', videoId);
    const videoCard = thumbnailElement.closest('.video-card');
    const thumbnail = videoCard.querySelector('.video-thumbnail');
    const iframeContainer = videoCard.querySelector('.video-iframe-container');
    
    // Hide thumbnail and show iframe
    thumbnail.style.display = 'none';
    iframeContainer.style.display = 'block';
    
    // Add loading state
    const loadingDiv = document.createElement('div');
    loadingDiv.style.cssText = 'display: flex; align-items: center; justify-content: center; height: 100%; background: #000; color: white;';
    loadingDiv.innerHTML = '<i class="fas fa-spinner fa-spin" style="font-size: 2rem; margin-right: 1rem;"></i>Video yükleniyor...';
    iframeContainer.appendChild(loadingDiv);
    
    // Load iframe after a short delay
    setTimeout(() => {
        iframeContainer.innerHTML = '';
        const iframe = document.createElement('iframe');
        iframe.src = `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&autoplay=1`;
        iframe.frameBorder = '0';
        iframe.allowFullscreen = true;
        iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
        iframeContainer.appendChild(iframe);
    }, 500);
}

// Get category display name
function getCategoryName(category) {
    const categoryNames = {
        'problem-solving': 'Problem Çözme',
        'tutorials': 'Konu Anlatımı',
        'exam-prep': 'Sınav Hazırlık',
        'tips': 'İpuçları'
    };
    return categoryNames[category] || category;
}



// Authentication functions
function checkAuth() {
    const token = localStorage.getItem('adminToken');
    if (!token) {
        return false;
    }
    return true;
}

// Update navigation based on authentication status
function updateNavigation() {
    const token = localStorage.getItem('adminToken');
    const loginLink = document.getElementById('loginLink');
    const logoutBtn = document.getElementById('logoutBtn');
    const adminLink = document.getElementById('adminLink');
    
    if (token) {
        // User is logged in
        if (loginLink) loginLink.style.display = 'none';
        if (logoutBtn) logoutBtn.style.display = 'inline-flex';
        
        // Check if user is admin
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            if (payload.role === 'admin' && adminLink) {
                adminLink.style.display = 'inline-flex';
            } else if (adminLink) {
                adminLink.style.display = 'none';
            }
        } catch (error) {
            console.error('Error parsing token:', error);
            if (adminLink) adminLink.style.display = 'none';
        }
    } else {
        // User is not logged in
        if (loginLink) loginLink.style.display = 'inline-flex';
        if (logoutBtn) logoutBtn.style.display = 'none';
        if (adminLink) adminLink.style.display = 'none';
    }
}

// Logout function
async function logout() {
    try {
        const token = localStorage.getItem('adminToken');
        if (token) {
            await fetch('/api/auth/logout', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
        }
    } catch (error) {
        console.error('Logout error:', error);
    } finally {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('rememberMe');
        window.location.href = '/';
    }
}

// Navigation functions
function goHome() {
    window.location.href = '/';
}

// Social media functions (reused from main script)
function openInstagram() {
    window.open('https://www.instagram.com/ensiradisimat/', '_blank');
}

function openYouTube() {
    window.open('http://youtube.com/user/kolaymatgeo', '_blank');
}


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

// Add animation on scroll for elements
const animationObserverOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const animationObserver = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, animationObserverOptions);

// Observe elements for animation
document.addEventListener('DOMContentLoaded', function() {
    const animateElements = document.querySelectorAll('.video-card, .category-tab');
    
    animateElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        animationObserver.observe(el);
    });
});
