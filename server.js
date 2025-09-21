const express = require('express');
const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const app = express();

// Set the port
const PORT = process.env.PORT || 3000;

// JWT Secret (use environment variable in production)
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';

// Admin credentials (use environment variables in production)
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Data file paths
const VIDEOS_FILE = path.join(__dirname, 'data', 'videos.json');
const USERS_FILE = path.join(__dirname, 'data', 'users.json');

// Ensure data directory exists
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

// Initialize users data if file doesn't exist
if (!fs.existsSync(USERS_FILE)) {
    const hashedPassword = bcrypt.hashSync('admin123', 10);
    const initialUsers = [
        {
            id: '1',
            username: 'admin',
            email: 'admin@ensiradisimatematik.com',
            password: hashedPassword,
            role: 'admin',
            createdAt: new Date().toISOString(),
            isActive: true
        }
    ];
    fs.writeFileSync(USERS_FILE, JSON.stringify(initialUsers, null, 2));
}

// Initialize videos data if file doesn't exist
if (!fs.existsSync(VIDEOS_FILE)) {
    const initialVideos = [
        {
            id: '1',
            title: 'Matematik Dersi - Video 1',
            description: 'En Sıra Dışı Matematik eğitim videosu. Matematik konularının detaylı anlatımı ve örnek soru çözümleri.',
            thumbnail: 'https://img.youtube.com/vi/4sSwVUP0Is8/maxresdefault.jpg',
            videoId: '4sSwVUP0Is8',
            duration: '15:30',
            views: '1.2K',
            category: 'tutorials',
            publishDate: '2024-09-15'
        },
        {
            id: '2',
            title: 'Matematik Dersi - Video 2',
            description: 'Matematik problem çözme teknikleri ve adım adım çözüm yöntemleri. Öğrenciler için faydalı ipuçları.',
            thumbnail: 'https://img.youtube.com/vi/SZnrZGrX9bo/maxresdefault.jpg',
            videoId: 'SZnrZGrX9bo',
            duration: '18:45',
            views: '980',
            category: 'problem-solving',
            publishDate: '2024-09-15'
        }
    ];
    fs.writeFileSync(VIDEOS_FILE, JSON.stringify(initialVideos, null, 2));
}

// Serve the main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Serve the videos page
app.get('/videos', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'videos.html'));
});

// Serve the videos page with .html extension
app.get('/videos.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'videos.html'));
});

// Serve the admin page
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// Serve the admin page with .html extension
app.get('/admin.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// Serve the login page
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Serve the login page with .html extension
app.get('/login.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Serve the register page
app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'register.html'));
});

// Serve the register page with .html extension
app.get('/register.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'register.html'));
});

// Serve the video player page
app.get('/video-player', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'video-player.html'));
});

// Serve the video player page with .html extension
app.get('/video-player.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'video-player.html'));
});

// Authentication middleware
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Erişim token\'ı gerekli' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Geçersiz token' });
        }
        req.user = user;
        next();
    });
}

// Admin role middleware
function requireAdmin(req, res, next) {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Bu işlem için admin yetkisi gerekli' });
    }
    next();
}

// Authentication Routes

// Register endpoint
app.post('/api/auth/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Validation
        if (!username || !email || !password) {
            return res.status(400).json({ message: 'Tüm alanlar doldurulmalıdır' });
        }

        if (username.length < 3 || username.length > 20) {
            return res.status(400).json({ message: 'Kullanıcı adı 3-20 karakter arası olmalıdır' });
        }

        if (password.length < 6) {
            return res.status(400).json({ message: 'Şifre en az 6 karakter olmalıdır' });
        }

        // Check if user already exists
        const users = JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
        const existingUser = users.find(user => 
            user.username === username || user.email === email
        );

        if (existingUser) {
            return res.status(400).json({ 
                message: existingUser.username === username 
                    ? 'Bu kullanıcı adı zaten kullanılıyor' 
                    : 'Bu e-posta adresi zaten kayıtlı' 
            });
        }

        // Hash password
        const hashedPassword = bcrypt.hashSync(password, 10);

        // Create new user
        const newUser = {
            id: Date.now().toString(),
            username,
            email,
            password: hashedPassword,
            role: 'user',
            createdAt: new Date().toISOString(),
            isActive: true
        };

        // Save user
        users.push(newUser);
        fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));

        res.status(201).json({
            message: 'Kayıt başarılı',
            user: { 
                id: newUser.id, 
                username: newUser.username, 
                email: newUser.email 
            }
        });

    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ message: 'Kayıt sırasında hata oluştu' });
    }
});

// Login endpoint
app.post('/api/auth/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        // Load users
        const users = JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
        const user = users.find(u => u.username === username && u.isActive);

        if (!user) {
            return res.status(401).json({ message: 'Kullanıcı adı veya şifre hatalı' });
        }

        // Check password
        const isValidPassword = bcrypt.compareSync(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ message: 'Kullanıcı adı veya şifre hatalı' });
        }

        // Create JWT token
        const token = jwt.sign(
            { 
                userId: user.id, 
                username: user.username, 
                role: user.role 
            },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            message: 'Giriş başarılı',
            token: token,
            user: { 
                id: user.id, 
                username: user.username, 
                role: user.role,
                needsPasswordChange: user.needsPasswordChange || false
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Giriş sırasında hata oluştu' });
    }
});

// Verify token endpoint
app.post('/api/auth/verify', authenticateToken, (req, res) => {
    res.json({ 
        message: 'Token geçerli',
        user: req.user 
    });
});

// Logout endpoint
app.post('/api/auth/logout', (req, res) => {
    res.json({ message: 'Çıkış başarılı' });
});

// API Routes for Video Management

// Get all videos (public - no authentication required)
app.get('/api/public/videos', (req, res) => {
    try {
        const videos = JSON.parse(fs.readFileSync(VIDEOS_FILE, 'utf8'));
        res.json(videos);
    } catch (error) {
        console.error('Error reading videos:', error);
        res.status(500).json({ message: 'Videolar yüklenirken hata oluştu' });
    }
});

// Get all videos (protected - requires admin authentication)
app.get('/api/videos', authenticateToken, requireAdmin, (req, res) => {
    try {
        const videos = JSON.parse(fs.readFileSync(VIDEOS_FILE, 'utf8'));
        res.json(videos);
    } catch (error) {
        console.error('Error reading videos:', error);
        res.status(500).json({ message: 'Videolar yüklenirken hata oluştu' });
    }
});

// Add new video (protected - requires admin authentication)
app.post('/api/videos', authenticateToken, requireAdmin, (req, res) => {
    try {
        const videos = JSON.parse(fs.readFileSync(VIDEOS_FILE, 'utf8'));
        const newVideo = {
            id: Date.now().toString(),
            ...req.body,
            publishDate: new Date().toISOString().split('T')[0]
        };
        
        videos.push(newVideo);
        fs.writeFileSync(VIDEOS_FILE, JSON.stringify(videos, null, 2));
        
        res.status(201).json(newVideo);
    } catch (error) {
        console.error('Error adding video:', error);
        res.status(500).json({ message: 'Video eklenirken hata oluştu' });
    }
});

// Update video (protected - requires admin authentication)
app.put('/api/videos/:id', authenticateToken, requireAdmin, (req, res) => {
    try {
        const videos = JSON.parse(fs.readFileSync(VIDEOS_FILE, 'utf8'));
        const videoIndex = videos.findIndex(v => v.id === req.params.id);
        
        if (videoIndex === -1) {
            return res.status(404).json({ message: 'Video bulunamadı' });
        }
        
        videos[videoIndex] = { ...videos[videoIndex], ...req.body };
        fs.writeFileSync(VIDEOS_FILE, JSON.stringify(videos, null, 2));
        
        res.json(videos[videoIndex]);
    } catch (error) {
        console.error('Error updating video:', error);
        res.status(500).json({ message: 'Video güncellenirken hata oluştu' });
    }
});

// Delete video (protected - requires admin authentication)
app.delete('/api/videos/:id', authenticateToken, requireAdmin, (req, res) => {
    try {
        const videos = JSON.parse(fs.readFileSync(VIDEOS_FILE, 'utf8'));
        const videoIndex = videos.findIndex(v => v.id === req.params.id);
        
        if (videoIndex === -1) {
            return res.status(404).json({ message: 'Video bulunamadı' });
        }
        
        videos.splice(videoIndex, 1);
        fs.writeFileSync(VIDEOS_FILE, JSON.stringify(videos, null, 2));
        
        res.json({ message: 'Video başarıyla silindi' });
    } catch (error) {
        console.error('Error deleting video:', error);
        res.status(500).json({ message: 'Video silinirken hata oluştu' });
    }
});

// User Management API Endpoints

// Get all users (admin only)
app.get('/api/users', authenticateToken, requireAdmin, (req, res) => {
    try {
        const users = JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
        // Remove password from response
        const usersWithoutPasswords = users.map(user => ({
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role,
            createdAt: user.createdAt,
            isActive: user.isActive,
            needsPasswordChange: user.needsPasswordChange || false
        }));
        res.json(usersWithoutPasswords);
    } catch (error) {
        console.error('Error reading users:', error);
        res.status(500).json({ message: 'Kullanıcılar yüklenirken hata oluştu' });
    }
});

// Create new user (admin only)
app.post('/api/users', authenticateToken, requireAdmin, (req, res) => {
    try {
        const { username, email, password, role } = req.body;
        
        if (!username || !email || !password || !role) {
            return res.status(400).json({ message: 'Tüm alanlar gereklidir' });
        }
        
        const users = JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
        
        // Check if username or email already exists
        if (users.find(u => u.username === username)) {
            return res.status(400).json({ message: 'Bu kullanıcı adı zaten kullanılıyor' });
        }
        
        if (users.find(u => u.email === email)) {
            return res.status(400).json({ message: 'Bu e-posta adresi zaten kullanılıyor' });
        }
        
        // Generate new user ID
        const newUserId = Date.now().toString();
        
        // Hash the password
        const hashedPassword = bcrypt.hashSync(password, 10);
        
        // Create new user
        const newUser = {
            id: newUserId,
            username,
            email,
            password: hashedPassword,
            role,
            createdAt: new Date().toISOString(),
            isActive: true,
            needsPasswordChange: true // First login requires password change
        };
        
        users.push(newUser);
        fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
        
        res.json({ 
            message: 'Kullanıcı başarıyla oluşturuldu',
            tempPassword: password // Return the temporary password for admin to give to user
        });
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ message: 'Kullanıcı oluşturulurken hata oluştu' });
    }
});

// Delete user (admin only)
app.delete('/api/users/:id', authenticateToken, requireAdmin, (req, res) => {
    try {
        const users = JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
        const userIndex = users.findIndex(u => u.id === req.params.id);
        
        if (userIndex === -1) {
            return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
        }
        
        // Prevent deleting the last admin
        const user = users[userIndex];
        if (user.role === 'admin') {
            const adminCount = users.filter(u => u.role === 'admin').length;
            if (adminCount <= 1) {
                return res.status(400).json({ message: 'Son admin kullanıcısı silinemez' });
            }
        }
        
        users.splice(userIndex, 1);
        fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
        
        res.json({ message: 'Kullanıcı başarıyla silindi' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ message: 'Kullanıcı silinirken hata oluştu' });
    }
});

// Reset user password (admin only)
app.post('/api/users/:id/reset-password', authenticateToken, requireAdmin, (req, res) => {
    try {
        const users = JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
        const userIndex = users.findIndex(u => u.id === req.params.id);
        
        if (userIndex === -1) {
            return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
        }
        
        // Generate new temporary password
        const tempPassword = generateTempPassword();
        const hashedPassword = bcrypt.hashSync(tempPassword, 10);
        
        users[userIndex].password = hashedPassword;
        users[userIndex].needsPasswordChange = true;
        
        fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
        
        res.json({ 
            message: 'Şifre sıfırlandı',
            tempPassword: tempPassword
        });
    } catch (error) {
        console.error('Error resetting password:', error);
        res.status(500).json({ message: 'Şifre sıfırlanırken hata oluştu' });
    }
});

// Change password (for users)
app.post('/api/users/change-password', authenticateToken, (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        
        if (!newPassword) {
            return res.status(400).json({ message: 'Yeni şifre gereklidir' });
        }
        
        if (newPassword.length < 6) {
            return res.status(400).json({ message: 'Yeni şifre en az 6 karakter olmalıdır' });
        }
        
        const users = JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
        const userIndex = users.findIndex(u => u.id === req.user.userId);
        
        if (userIndex === -1) {
            return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
        }
        
        const user = users[userIndex];
        
        // If user needs password change (first login), skip current password verification
        if (user.needsPasswordChange) {
            // First-time password change, no current password required
        } else {
            // Regular password change, verify current password
            if (!currentPassword) {
                return res.status(400).json({ message: 'Mevcut şifre gereklidir' });
            }
            
            if (!bcrypt.compareSync(currentPassword, user.password)) {
                return res.status(400).json({ message: 'Mevcut şifre yanlış' });
            }
        }
        
        // Update password
        const hashedNewPassword = bcrypt.hashSync(newPassword, 10);
        users[userIndex].password = hashedNewPassword;
        users[userIndex].needsPasswordChange = false;
        
        fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
        
        res.json({ message: 'Şifre başarıyla değiştirildi' });
    } catch (error) {
        console.error('Error changing password:', error);
        res.status(500).json({ message: 'Şifre değiştirilirken hata oluştu' });
    }
});

// Helper function to generate temporary password
function generateTempPassword() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 12; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
}

// Start the server
app.listen(PORT, () => {
    console.log(`🚀 Enşira Dışı Matematik Education Center website is running on port ${PORT}`);
    console.log(`🌐 Visit: http://localhost:${PORT}`);
    console.log(`📚 Ready for ensiradisimatematik.com domain`);
});
