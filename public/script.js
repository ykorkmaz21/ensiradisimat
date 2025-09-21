// Navigation function
function goHome() {
    window.location.href = '/';
}

// Smooth scrolling function
function scrollToContact() {
    const contactSection = document.getElementById('contact');
    contactSection.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
    });
}

// Open Instagram
function openInstagram() {
    window.open('https://www.instagram.com/ensiradisimat/', '_blank');
}

// Open YouTube
function openYouTube() {
    window.open('http://youtube.com/user/kolaymatgeo', '_blank');
}

// Open Google Maps
function openMaps() {
    window.open('https://maps.app.goo.gl/xHrj7t2kk4ooz5sp6', '_blank');
}

// Contact form handling
document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.getElementById('contactForm');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const formData = new FormData(contactForm);
            const name = formData.get('name');
            const email = formData.get('email');
            const message = formData.get('message');
            
            // Basic validation
            if (!name || !email || !message) {
                alert('Lütfen tüm alanları doldurun.');
                return;
            }
            
            // Email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                alert('Lütfen geçerli bir e-posta adresi girin.');
                return;
            }
            
            // Create mailto link with form data
            const subject = encodeURIComponent(`En Sıra Dışı Matematik - İletişim Formu`);
            const body = encodeURIComponent(`Ad: ${name}\nE-posta: ${email}\n\nMesaj:\n${message}`);
            const mailtoLink = `mailto:iletisim@ensiradisimatematik.com?subject=${subject}&body=${body}`;
            
            // Open email client
            window.location.href = mailtoLink;
            
            // Show success message
            alert(`Teşekkürler ${name}!\n\nE-posta uygulamanız açılacak. Mesajınızı gönderdikten sonra size en kısa sürede dönüş yapacağız.`);
            
            // Reset form
            contactForm.reset();
        });
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

// Add animation on scroll for elements
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe elements for animation
document.addEventListener('DOMContentLoaded', function() {
    const animateElements = document.querySelectorAll('.link-card, .contact-info, .contact-form');
    
    animateElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
});

// Add loading animation
window.addEventListener('load', function() {
    document.body.style.opacity = '1';
});

// Initialize page
document.body.style.opacity = '0';
document.body.style.transition = 'opacity 0.5s ease';

// Check authentication status and update navigation
document.addEventListener('DOMContentLoaded', function() {
    updateNavigation();
});

// Update navigation based on authentication status
function updateNavigation() {
    const token = localStorage.getItem('adminToken');
    const loginLink = document.getElementById('loginLink');
    const registerLink = document.getElementById('registerLink');
    const logoutBtn = document.getElementById('logoutBtn');
    const adminLink = document.getElementById('adminLink');
    const videosLink = document.getElementById('videosLink');
    
    if (token) {
        // User is logged in
        if (loginLink) loginLink.style.display = 'none';
        if (registerLink) registerLink.style.display = 'none';
        if (logoutBtn) logoutBtn.style.display = 'inline-flex';
        if (adminLink) adminLink.style.display = 'inline-flex';
        if (videosLink) {
            videosLink.onclick = function(e) {
                // Allow normal navigation to videos
                return true;
            };
        }
    } else {
        // User is not logged in
        if (loginLink) loginLink.style.display = 'inline-flex';
        if (registerLink) registerLink.style.display = 'inline-flex';
        if (logoutBtn) logoutBtn.style.display = 'none';
        if (adminLink) adminLink.style.display = 'none';
        if (videosLink) {
            videosLink.onclick = function(e) {
                e.preventDefault();
                alert('Videoları görmek için giriş yapmanız gerekiyor.');
                window.location.href = '/login.html';
                return false;
            };
        }
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
        updateNavigation();
        // Refresh page to update all elements
        window.location.reload();
    }
}
