// Admin Panel - No Firebase Storage needed
// Using GitHub storage solution for assets

// Auth state management
let currentUser = null;

// Initialize admin functions when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Small delay to ensure Firebase and storage solution are loaded
    setTimeout(() => {
        initializeAdmin();
    }, 500);
});

function initializeAdmin() {
    // Check if Firebase is loaded
    if (typeof firebase === 'undefined') {
        console.error('❌ Firebase not loaded');
        return;
    }

    // Check if storage solution is loaded
    if (typeof getRandomAvatar === 'undefined') {
        console.error('❌ Storage solution not loaded');
        return;
    }

    console.log('✅ Admin panel initialized');

    // Check auth state
    firebase.auth().onAuthStateChanged((user) => {
        if (user) {
            currentUser = user;
            showDashboard();
            loadApplications();
            loadMembers();
            loadPublications();
            loadSettings();
        } else {
            showLoginForm();
        }
    });

    // Setup event listeners
    setupEventListeners();
}

function setupEventListeners() {
    // Login form
    const loginForm = document.getElementById('login-form-element');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    // Logout button
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }

    // Tab navigation
    const tabBtns = document.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const targetTab = e.target.getAttribute('data-tab');
            switchTab(targetTab);
        });
    });

    // Member management
    const addMemberBtn = document.getElementById('add-member-btn');
    if (addMemberBtn) {
        addMemberBtn.addEventListener('click', () => showMemberModal());
    }

    const cancelMemberBtn = document.getElementById('cancel-member-btn');
    if (cancelMemberBtn) {
        cancelMemberBtn.addEventListener('click', hideMemberModal);
    }

    const memberForm = document.getElementById('member-form');
    if (memberForm) {
        memberForm.addEventListener('submit', handleMemberSubmit);
    }

    // Settings
    const saveSettingsBtn = document.getElementById('save-settings-btn');
    if (saveSettingsBtn) {
        saveSettingsBtn.addEventListener('click', saveSettings);
    }
}

// Authentication functions
async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const errorDiv = document.getElementById('login-error');

    try {
        await firebase.auth().signInWithEmailAndPassword(email, password);
        errorDiv.classList.add('hidden');
    } catch (error) {
        errorDiv.textContent = 'Đăng nhập thất bại: ' + error.message;
        errorDiv.classList.remove('hidden');
    }
}

async function handleLogout() {
    try {
        await firebase.auth().signOut();
    } catch (error) {
        console.error('Logout error:', error);
    }
}

// UI Functions
function showLoginForm() {
    document.getElementById('login-form').classList.remove('hidden');
    document.getElementById('admin-dashboard').classList.add('hidden');
}

function showDashboard() {
    document.getElementById('login-form').classList.add('hidden');
    document.getElementById('admin-dashboard').classList.remove('hidden');
}

function switchTab(tabName) {
    // Hide all tab contents
    const tabContents = document.querySelectorAll('.tab-content');
    tabContents.forEach(tab => tab.classList.add('hidden'));

    // Remove active class from all tab buttons
    const tabBtns = document.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => {
        btn.classList.remove('active', 'border-sky-500', 'text-sky-400');
        btn.classList.add('border-transparent', 'text-gray-300');
    });

    // Show target tab content
    const targetTab = document.getElementById(`tab-${tabName}`);
    if (targetTab) {
        targetTab.classList.remove('hidden');
    }

    // Add active class to clicked tab button
    const activeBtn = document.querySelector(`[data-tab="${tabName}"]`);
    if (activeBtn) {
        activeBtn.classList.add('active', 'border-sky-500', 'text-sky-400');
        activeBtn.classList.remove('border-transparent', 'text-gray-300');
    }
}

// Applications Management - Updated with better error handling
async function loadApplications() {
    const loadingDiv = document.getElementById('applications-loading');
    const listDiv = document.getElementById('applications-list');
    
    try {
        // Check if user is authenticated
        if (!currentUser) {
            throw new Error('User not authenticated');
        }
        
        const snapshot = await db.collection('applications').orderBy('timestamp', 'desc').get();
        
        loadingDiv.classList.add('hidden');
        
        if (snapshot.empty) {
            listDiv.innerHTML = '<p class="text-gray-400 text-center py-8">Chưa có hồ sơ ứng tuyển nào</p>';
            return;
        }

        let html = '';
        snapshot.forEach(doc => {
            const data = doc.data();
            const date = data.timestamp ? data.timestamp.toDate().toLocaleDateString('vi-VN') : 'Không rõ';
            
            html += `
                <div class="bg-gray-700 p-6 rounded-lg border border-gray-600">
                    <div class="flex justify-between items-start mb-4">
                        <div>
                            <h4 class="text-lg font-semibold text-white">${data.name || 'Không rõ'}</h4>
                            <p class="text-sky-400">${data.email || 'Không rõ'}</p>
                        </div>
                        <span class="text-sm text-gray-400">${date}</span>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <p class="text-sm text-gray-400">Trường:</p>
                            <p class="text-white">${data.school || 'Không rõ'}</p>
                        </div>
                        <div>
                            <p class="text-sm text-gray-400">Điện thoại:</p>
                            <p class="text-white">${data.phone || 'Không rõ'}</p>
                        </div>
                    </div>
                    ${data.message ? `
                        <div class="mb-4">
                            <p class="text-sm text-gray-400">Thư ngỏ:</p>
                            <p class="text-white">${data.message}</p>
                        </div>
                    ` : ''}
                    <div class="flex space-x-2 flex-wrap">
                        ${data.cvInfo ? `
                            <span class="text-sky-400 text-sm">
                                <i class="fas fa-file-pdf mr-1"></i>CV: ${data.cvInfo.name} (${(data.cvInfo.size/1024/1024).toFixed(2)}MB)
                            </span>
                        ` : '<span class="text-gray-500 text-sm">Không có CV</span>'}
                        ${data.transcriptInfo ? `
                            <span class="text-green-400 text-sm">
                                <i class="fas fa-file-pdf mr-1"></i>Bảng điểm: ${data.transcriptInfo.name} (${(data.transcriptInfo.size/1024/1024).toFixed(2)}MB)
                            </span>
                        ` : '<span class="text-gray-500 text-sm">Không có bảng điểm</span>'}
                        <button onclick="deleteApplication('${doc.id}')" class="text-red-400 hover:text-red-300 text-sm ml-auto">
                            <i class="fas fa-trash mr-1"></i>Xóa
                        </button>
                        <button onclick="contactApplicant('${data.email}', '${data.name}')" class="text-blue-400 hover:text-blue-300 text-sm">
                            <i class="fas fa-envelope mr-1"></i>Liên hệ
                        </button>
                    </div>
                </div>
            `;
        });
        
        listDiv.innerHTML = html;
        
    } catch (error) {
        console.error('Error loading applications:', error);
        loadingDiv.classList.add('hidden');
        
        if (error.code === 'permission-denied') {
            listDiv.innerHTML = '<p class="text-red-400 text-center py-8">❌ Không có quyền truy cập. Vui lòng đăng nhập.</p>';
        } else {
            listDiv.innerHTML = '<p class="text-red-400 text-center py-8">❌ Lỗi khi tải dữ liệu: ' + error.message + '</p>';
        }
    }
}

async function deleteApplication(id) {
    if (!confirm('Bạn có chắc chắn muốn xóa hồ sơ này?')) return;
    
    try {
        await db.collection('applications').doc(id).delete();
        loadApplications(); // Reload list
        showNotification('Đã xóa hồ sơ thành công', 'success');
    } catch (error) {
        console.error('Error deleting application:', error);
        showNotification('Lỗi khi xóa hồ sơ', 'error');
    }
}

// Contact applicant function
function contactApplicant(email, name) {
    const subject = encodeURIComponent(`Phản hồi hồ sơ ứng tuyển - ${name}`);
    const body = encodeURIComponent(`Chào ${name},\n\nCảm ơn bạn đã quan tâm và gửi hồ sơ ứng tuyển cho nhóm nghiên cứu chúng tôi.\n\nVui lòng gửi CV và bảng điểm qua email này để chúng tôi có thể xem xét hồ sơ của bạn.\n\nTrân trọng,\nNhóm Nghiên cứu Blockchain, Mạng & Bảo mật`);
    
    window.open(`mailto:${email}?subject=${subject}&body=${body}`, '_blank');
}

// Show notification function
function showNotification(message, type = 'info') {
    // Simple notification for admin panel
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-md`;
    notification.className += type === 'success' ? ' bg-green-600' : 
                             type === 'error' ? ' bg-red-600' : ' bg-blue-600';
    notification.innerHTML = `<p class="text-white">${message}</p>`;
    
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
}

// Members Management
async function loadMembers() {
    const listDiv = document.getElementById('members-list');
    
    try {
        const snapshot = await db.collection('members').orderBy('name').get();
        
        if (snapshot.empty) {
            listDiv.innerHTML = '<p class="text-gray-400 text-center py-8 col-span-3">Chưa có thành viên nào</p>';
            return;
        }

        let html = '';
        snapshot.forEach(doc => {
            const data = doc.data();
            
            html += `
                <div class="bg-gray-700 p-6 rounded-lg border border-gray-600">
                    <div class="text-center">
                        <img src="${data.avatar || '/default-avatar.png'}" alt="${data.name}" 
                             class="w-20 h-20 rounded-full mx-auto mb-4 object-cover">
                        <h4 class="text-lg font-semibold text-white mb-2">${data.name}</h4>
                        <p class="text-sky-400 text-sm">${data.role}</p>
                        <div class="flex justify-center space-x-2 mt-4">
                            <button onclick="editMember('${doc.id}', '${data.name}', '${data.role}', '${data.avatar || ''}')" 
                                    class="text-sky-400 hover:text-sky-300 text-sm">Sửa</button>
                            <button onclick="deleteMember('${doc.id}')" 
                                    class="text-red-400 hover:text-red-300 text-sm">Xóa</button>
                        </div>
                    </div>
                </div>
            `;
        });
        
        listDiv.innerHTML = html;
        
    } catch (error) {
        console.error('Error loading members:', error);
        listDiv.innerHTML = '<p class="text-red-400 text-center py-8 col-span-3">Lỗi khi tải dữ liệu</p>';
    }
}

function showMemberModal(editMode = false, memberId = null, memberData = {}) {
    const modal = document.getElementById('member-modal');
    const title = document.getElementById('member-modal-title');
    const form = document.getElementById('member-form');
    
    // Reset form and states
    selectedAvatarFile = null;
    currentAvatarUrl = memberData.avatar || null;
    
    // Set form values
    document.getElementById('member-name').value = memberData.name || '';
    document.getElementById('member-nickname').value = memberData.nickname || '';
    document.getElementById('member-role').value = memberData.role || '';
    document.getElementById('member-avatar-url').value = '';
    document.getElementById('member-google-scholar').value = memberData.googleScholar || '';
    document.getElementById('member-orcid').value = memberData.orcid || '';
    document.getElementById('member-bio').value = memberData.bio || '';
    document.getElementById('member-research-interests').value = 
        (memberData.researchInterests || []).join('\n');
    document.getElementById('member-education').value = 
        (memberData.education || []).join('\n');
    document.getElementById('member-achievements').value = 
        (memberData.achievements || []).join('\n');
    
    // Load saved GitHub token
    const savedToken = localStorage.getItem('github_token');
    if (savedToken) {
        document.getElementById('github-token').value = savedToken;
    }
    
    // Show current avatar if editing
    if (editMode) {
        showCurrentAvatar(memberData.avatar);
    } else {
        document.getElementById('current-avatar-display').classList.add('hidden');
    }
    
    // Hide preview initially
    hideAvatarPreview();
    
    // Set title and form action
    title.textContent = editMode ? 'Sửa thành viên' : 'Thêm thành viên';
    form.setAttribute('data-member-id', memberId || '');
    form.setAttribute('data-edit-mode', editMode);
    
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    
    // Setup upload functionality if not already done
    if (!document.getElementById('avatar-file-input').hasEventListener) {
        setupAvatarUpload();
        document.getElementById('avatar-file-input').hasEventListener = true;
    }
}

function hideMemberModal() {
    const modal = document.getElementById('member-modal');
    modal.classList.add('hidden');
    modal.classList.remove('flex');
}

async function handleMemberSubmit(e) {
    e.preventDefault();
    
    const saveButton = e.target.querySelector('button[type="submit"]');
    const saveText = document.getElementById('save-member-text');
    const saveLoading = document.getElementById('save-member-loading');
    const githubToken = document.getElementById('github-token').value.trim();
    
    // Show loading state
    saveButton.disabled = true;
    saveText.classList.add('hidden');
    saveLoading.classList.remove('hidden');
    
    try {
        let avatarUrl = currentAvatarUrl; // Keep existing avatar by default
        
        // Handle avatar upload
        if (selectedAvatarFile && githubToken) {
            // Upload file to GitHub
            const progressInterval = showUploadProgress();
            
            try {
                const filename = generateUniqueFilename(selectedAvatarFile.name);
                const uploadResult = await uploadToGitHub(selectedAvatarFile, filename, githubToken, 'avatars');
                
                avatarUrl = uploadResult.url;
                
                clearInterval(progressInterval);
                document.getElementById('upload-progress-bar').style.width = '100%';
                document.getElementById('upload-status').textContent = 'Tải lên thành công!';
                
                setTimeout(hideUploadProgress, 1000);
                
                showNotification('Đã tải ảnh lên GitHub thành công!', 'success');
                
            } catch (uploadError) {
                clearInterval(progressInterval);
                hideUploadProgress();
                
                // If upload fails, ask user if they want to continue
                const continueWithoutUpload = confirm(
                    `Lỗi khi tải ảnh lên GitHub: ${uploadError.message}\n\n` +
                    'Bạn có muốn tiếp tục lưu thành viên mà không có ảnh mới không?'
                );
                
                if (!continueWithoutUpload) {
                    throw new Error('Người dùng hủy do lỗi upload ảnh');
                }
            }
        } else if (document.getElementById('member-avatar-url').value.trim()) {
            // Use URL instead
            avatarUrl = document.getElementById('member-avatar-url').value.trim();
        } else if (selectedAvatarFile && !githubToken) {
            throw new Error('Cần GitHub token để tải ảnh lên. Vui lòng nhập token hoặc sử dụng URL.');
        }
        
        // Collect form data
        const name = document.getElementById('member-name').value;
        const nickname = document.getElementById('member-nickname').value;
        const role = document.getElementById('member-role').value;
        const googleScholar = document.getElementById('member-google-scholar').value;
        const orcid = document.getElementById('member-orcid').value;
        const bio = document.getElementById('member-bio').value;
        const researchInterests = document.getElementById('member-research-interests').value
            .split('\n').filter(item => item.trim()).map(item => item.trim());
        const education = document.getElementById('member-education').value
            .split('\n').filter(item => item.trim()).map(item => item.trim());
        const achievements = document.getElementById('member-achievements').value
            .split('\n').filter(item => item.trim()).map(item => item.trim());
        
        const form = e.target;
        const memberId = form.getAttribute('data-member-id');
        const editMode = form.getAttribute('data-edit-mode') === 'true';
        
        const memberData = {
            name: name,
            nickname: nickname,
            role: role,
            avatar: avatarUrl,
            googleScholar: googleScholar,
            orcid: orcid,
            bio: bio,
            researchInterests: researchInterests,
            education: education,
            achievements: achievements,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        };
        
        // Save to Firebase
        if (editMode && memberId) {
            await db.collection('members').doc(memberId).update(memberData);
        } else {
            memberData.createdAt = firebase.firestore.FieldValue.serverTimestamp();
            await db.collection('members').add(memberData);
        }
        
        // Success
        hideMemberModal();
        loadMembers();
        showNotification('Đã lưu thành viên thành công!', 'success');
        
        // Store token in localStorage for convenience (optional)
        if (githubToken) {
            localStorage.setItem('github_token', githubToken);
        }
        
    } catch (error) {
        console.error('Error saving member:', error);
        showNotification('Lỗi khi lưu thành viên: ' + error.message, 'error');
    } finally {
        // Reset button state
        saveButton.disabled = false;
        saveText.classList.remove('hidden');
        saveLoading.classList.add('hidden');
        hideUploadProgress();
    }
}

// Updated showMemberModal function
function showMemberModal(editMode = false, memberId = null, memberData = {}) {
    const modal = document.getElementById('member-modal');
    const title = document.getElementById('member-modal-title');
    const form = document.getElementById('member-form');
    
    // Reset form and states
    selectedAvatarFile = null;
    currentAvatarUrl = memberData.avatar || null;
    
    // Set form values
    document.getElementById('member-name').value = memberData.name || '';
    document.getElementById('member-nickname').value = memberData.nickname || '';
    document.getElementById('member-role').value = memberData.role || '';
    document.getElementById('member-avatar-url').value = '';
    document.getElementById('member-google-scholar').value = memberData.googleScholar || '';
    document.getElementById('member-orcid').value = memberData.orcid || '';
    document.getElementById('member-bio').value = memberData.bio || '';
    document.getElementById('member-research-interests').value = 
        (memberData.researchInterests || []).join('\n');
    document.getElementById('member-education').value = 
        (memberData.education || []).join('\n');
    document.getElementById('member-achievements').value = 
        (memberData.achievements || []).join('\n');
    
    // Load saved GitHub token
    const savedToken = localStorage.getItem('github_token');
    if (savedToken) {
        document.getElementById('github-token').value = savedToken;
    }
    
    // Show current avatar if editing
    if (editMode) {
        showCurrentAvatar(memberData.avatar);
    } else {
        document.getElementById('current-avatar-display').classList.add('hidden');
    }
    
    // Hide preview initially
    hideAvatarPreview();
    
    // Set title and form action
    title.textContent = editMode ? 'Sửa thành viên' : 'Thêm thành viên';
    form.setAttribute('data-member-id', memberId || '');
    form.setAttribute('data-edit-mode', editMode);
    
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    
    // Setup upload functionality if not already done
    if (!document.getElementById('avatar-file-input').hasEventListener) {
        setupAvatarUpload();
        document.getElementById('avatar-file-input').hasEventListener = true;
    }
}

// Enhanced admin.js với file upload functionality
let selectedAvatarFile = null;
let currentAvatarUrl = null;

// Setup file upload functionality
function setupAvatarUpload() {
    const fileInput = document.getElementById('avatar-file-input');
    const urlInput = document.getElementById('member-avatar-url');
    const previewSection = document.getElementById('avatar-preview');
    const previewImage = document.getElementById('avatar-preview-image');
    const fileInfo = document.getElementById('avatar-file-info');
    const compressBtn = document.getElementById('compress-avatar-btn');
    const removeBtn = document.getElementById('remove-avatar-btn');
    
    // File input change handler
    fileInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            selectedAvatarFile = file;
            showAvatarPreview(file);
            urlInput.value = ''; // Clear URL input
        }
    });
    
    // URL input change handler
    urlInput.addEventListener('input', function(e) {
        const url = e.target.value.trim();
        if (url) {
            selectedAvatarFile = null;
            fileInput.value = '';
            showUrlPreview(url);
        } else {
            hideAvatarPreview();
        }
    });
    
    // Compress button handler
    compressBtn.addEventListener('click', async function() {
        if (selectedAvatarFile) {
            try {
                compressBtn.disabled = true;
                compressBtn.textContent = 'Đang nén...';
                
                const compressed = await compressImage(selectedAvatarFile, 400, 0.8);
                selectedAvatarFile = compressed;
                showAvatarPreview(compressed);
                
                showNotification('Đã nén ảnh thành công', 'success');
            } catch (error) {
                showNotification('Lỗi khi nén ảnh: ' + error.message, 'error');
            } finally {
                compressBtn.disabled = false;
                compressBtn.textContent = 'Nén ảnh';
            }
        }
    });
    
    // Remove button handler
    removeBtn.addEventListener('click', function() {
        selectedAvatarFile = null;
        fileInput.value = '';
        urlInput.value = '';
        hideAvatarPreview();
    });
}

// Show avatar preview for file
function showAvatarPreview(file) {
    const previewSection = document.getElementById('avatar-preview');
    const previewImage = document.getElementById('avatar-preview-image');
    const fileInfo = document.getElementById('avatar-file-info');
    
    // Create object URL for preview
    const objectUrl = URL.createObjectURL(file);
    previewImage.src = objectUrl;
    
    // Show file info
    const sizeInMB = (file.size / 1024 / 1024).toFixed(2);
    fileInfo.textContent = `${file.name} (${sizeInMB} MB, ${file.type})`;
    
    previewSection.classList.remove('hidden');
    
    // Cleanup old object URL
    previewImage.onload = () => URL.revokeObjectURL(objectUrl);
}

// Show preview for URL
function showUrlPreview(url) {
    const previewSection = document.getElementById('avatar-preview');
    const previewImage = document.getElementById('avatar-preview-image');
    const fileInfo = document.getElementById('avatar-file-info');
    const compressBtn = document.getElementById('compress-avatar-btn');
    
    previewImage.src = url;
    fileInfo.textContent = `URL: ${url}`;
    
    // Hide compress button for URL
    compressBtn.classList.add('hidden');
    
    previewSection.classList.remove('hidden');
}

// Hide avatar preview
function hideAvatarPreview() {
    const previewSection = document.getElementById('avatar-preview');
    previewSection.classList.add('hidden');
    
    // Show compress button again
    document.getElementById('compress-avatar-btn').classList.remove('hidden');
}

// Show current avatar in edit mode
function showCurrentAvatar(avatarUrl) {
    const currentAvatarDisplay = document.getElementById('current-avatar-display');
    const currentAvatarImage = document.getElementById('current-avatar-image');
    const currentAvatarUrlText = document.getElementById('current-avatar-url');
    
    if (avatarUrl) {
        currentAvatarImage.src = avatarUrl;
        currentAvatarUrlText.textContent = avatarUrl;
        currentAvatarDisplay.classList.remove('hidden');
        currentAvatarUrl = avatarUrl;
    } else {
        currentAvatarDisplay.classList.add('hidden');
        currentAvatarUrl = null;
    }
}

// Upload progress display
function showUploadProgress() {
    const progressSection = document.getElementById('upload-progress');
    const progressBar = document.getElementById('upload-progress-bar');
    const statusText = document.getElementById('upload-status');
    
    progressSection.classList.remove('hidden');
    progressBar.style.width = '0%';
    statusText.textContent = 'Đang chuẩn bị tải lên...';
    
    // Simulate progress (since GitHub API doesn't provide real progress)
    let progress = 0;
    const interval = setInterval(() => {
        progress += Math.random() * 30;
        if (progress > 90) progress = 90;
        
        progressBar.style.width = progress + '%';
        statusText.textContent = `Đang tải lên... ${Math.round(progress)}%`;
        
        if (progress >= 90) {
            clearInterval(interval);
        }
    }, 200);
    
    return interval;
}

function hideUploadProgress() {
    const progressSection = document.getElementById('upload-progress');
    progressSection.classList.add('hidden');
}

// Updated handleMemberSubmit function
async function handleMemberSubmit(e) {
    e.preventDefault();
    
    const saveButton = e.target.querySelector('button[type="submit"]');
    const saveText = document.getElementById('save-member-text');
    const saveLoading = document.getElementById('save-member-loading');
    const githubToken = document.getElementById('github-token').value.trim();
    
    // Show loading state
    saveButton.disabled = true;
    saveText.classList.add('hidden');
    saveLoading.classList.remove('hidden');
    
    try {
        let avatarUrl = currentAvatarUrl; // Keep existing avatar by default
        
        // Handle avatar upload
        if (selectedAvatarFile && githubToken) {
            // Upload file to GitHub
            const progressInterval = showUploadProgress();
            
            try {
                const filename = generateUniqueFilename(selectedAvatarFile.name);
                const uploadResult = await uploadToGitHub(selectedAvatarFile, filename, githubToken, 'avatars');
                
                avatarUrl = uploadResult.url;
                
                clearInterval(progressInterval);
                document.getElementById('upload-progress-bar').style.width = '100%';
                document.getElementById('upload-status').textContent = 'Tải lên thành công!';
                
                setTimeout(hideUploadProgress, 1000);
                
                showNotification('Đã tải ảnh lên GitHub thành công!', 'success');
                
            } catch (uploadError) {
                clearInterval(progressInterval);
                hideUploadProgress();
                
                // If upload fails, ask user if they want to continue
                const continueWithoutUpload = confirm(
                    `Lỗi khi tải ảnh lên GitHub: ${uploadError.message}\n\n` +
                    'Bạn có muốn tiếp tục lưu thành viên mà không có ảnh mới không?'
                );
                
                if (!continueWithoutUpload) {
                    throw new Error('Người dùng hủy do lỗi upload ảnh');
                }
            }
        } else if (document.getElementById('member-avatar-url').value.trim()) {
            // Use URL instead
            avatarUrl = document.getElementById('member-avatar-url').value.trim();
        } else if (selectedAvatarFile && !githubToken) {
            throw new Error('Cần GitHub token để tải ảnh lên. Vui lòng nhập token hoặc sử dụng URL.');
        }
        
        // Collect form data
        const name = document.getElementById('member-name').value;
        const nickname = document.getElementById('member-nickname').value;
        const role = document.getElementById('member-role').value;
        const googleScholar = document.getElementById('member-google-scholar').value;
        const orcid = document.getElementById('member-orcid').value;
        const bio = document.getElementById('member-bio').value;
        const researchInterests = document.getElementById('member-research-interests').value
            .split('\n').filter(item => item.trim()).map(item => item.trim());
        const education = document.getElementById('member-education').value
            .split('\n').filter(item => item.trim()).map(item => item.trim());
        const achievements = document.getElementById('member-achievements').value
            .split('\n').filter(item => item.trim()).map(item => item.trim());
        
        const form = e.target;
        const memberId = form.getAttribute('data-member-id');
        const editMode = form.getAttribute('data-edit-mode') === 'true';
        
        const memberData = {
            name: name,
            nickname: nickname,
            role: role,
            avatar: avatarUrl,
            googleScholar: googleScholar,
            orcid: orcid,
            bio: bio,
            researchInterests: researchInterests,
            education: education,
            achievements: achievements,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        };
        
        // Save to Firebase
        if (editMode && memberId) {
            await db.collection('members').doc(memberId).update(memberData);
        } else {
            memberData.createdAt = firebase.firestore.FieldValue.serverTimestamp();
            await db.collection('members').add(memberData);
        }
        
        // Success
        hideMemberModal();
        loadMembers();
        showNotification('Đã lưu thành viên thành công!', 'success');
        
        // Store token in localStorage for convenience (optional)
        if (githubToken) {
            localStorage.setItem('github_token', githubToken);
        }
        
    } catch (error) {
        console.error('Error saving member:', error);
        showNotification('Lỗi khi lưu thành viên: ' + error.message, 'error');
    } finally {
        // Reset button state
        saveButton.disabled = false;
        saveText.classList.remove('hidden');
        saveLoading.classList.add('hidden');
        hideUploadProgress();
    }
}

// Publications Management
async function loadPublications() {
    const listDiv = document.getElementById('publications-list');
    
    try {
        const snapshot = await db.collection('publications').orderBy('year', 'desc').get();
        
        if (snapshot.empty) {
            listDiv.innerHTML = '<p class="text-gray-400 text-center py-8">Chưa có công bố nào</p>';
            return;
        }

        let html = '';
        snapshot.forEach(doc => {
            const data = doc.data();
            
            html += `
                <div class="bg-gray-700 p-6 rounded-lg border border-gray-600">
                    <div class="flex justify-between items-start mb-2">
                        <span class="text-xs px-2 py-1 rounded ${getPublicationTypeColor(data.type)} text-white">
                            ${data.type || 'Paper'}
                        </span>
                        <span class="text-sm text-gray-400">${data.year || 'N/A'}</span>
                    </div>
                    <h4 class="text-lg font-bold text-white mb-2">${data.title || 'Tiêu đề không rõ'}</h4>
                    <p class="text-sky-400 mb-2">${data.authors || 'Tác giả không rõ'}</p>
                    <p class="text-gray-400 text-sm mb-4"><em>${data.journal || 'Tạp chí không rõ'}</em></p>
                    <div class="flex justify-between items-center">
                        <div class="flex space-x-4 text-sm text-gray-400">
                            ${data.citations ? `<span><i data-lucide="quote" class="w-4 h-4 inline mr-1"></i>${data.citations}</span>` : ''}
                            ${data.doi ? `<span>DOI: ${data.doi}</span>` : ''}
                        </div>
                        <div class="flex space-x-2">
                            <button onclick="editPublication('${doc.id}')" 
                                    class="text-sky-400 hover:text-sky-300 text-sm">Sửa</button>
                            <button onclick="deletePublication('${doc.id}')" 
                                    class="text-red-400 hover:text-red-300 text-sm">Xóa</button>
                        </div>
                    </div>
                </div>
            `;
        });
        
        listDiv.innerHTML = html;
        
    } catch (error) {
        console.error('Error loading publications:', error);
        
        if (error.code === 'permission-denied') {
            listDiv.innerHTML = '<p class="text-red-400 text-center py-8">❌ Không có quyền truy cập publications</p>';
        } else {
            listDiv.innerHTML = '<p class="text-red-400 text-center py-8">❌ Lỗi khi tải dữ liệu publications</p>';
        }
    }
}

function editPublication(id) {
    // Placeholder for edit publication functionality
    showNotification('Tính năng sửa publication đang được phát triển', 'info');
}

function deletePublication(id) {
    if (confirm('Bạn có chắc chắn muốn xóa publication này?')) {
        db.collection('publications').doc(id).delete()
            .then(() => {
                showNotification('Đã xóa publication thành công', 'success');
                loadPublications();
            })
            .catch(error => {
                showNotification('Lỗi khi xóa publication: ' + error.message, 'error');
            });
    }
}

// Helper function to get publication type color
function getPublicationTypeColor(type) {
    switch (type) {
        case 'Journal Article':
            return 'bg-blue-600';
        case 'Conference Paper':
            return 'bg-green-600';
        case 'Book Chapter':
            return 'bg-purple-600';
        case 'Magazine Article':
            return 'bg-orange-600';
        default:
            return 'bg-gray-600';
    }
}

// Settings Management
async function loadSettings() {
    try {
        // Check if user is authenticated
        if (!currentUser) {
            console.warn('User not authenticated, skipping settings load');
            return;
        }
        
        const doc = await db.collection('settings').doc('general').get();
        if (doc.exists) {
            const data = doc.data();
            const emailInput = document.getElementById('notification-email');
            if (emailInput) {
                emailInput.value = data.notificationEmail || '';
            }
        }
    } catch (error) {
        console.error('Error loading settings:', error);
        if (error.code === 'permission-denied') {
            showNotification('Không có quyền truy cập settings', 'error');
        }
    }
}

// Setup file upload functionality
function setupAvatarUpload() {
    const fileInput = document.getElementById('avatar-file-input');
    const urlInput = document.getElementById('member-avatar-url');
    const previewSection = document.getElementById('avatar-preview');
    const previewImage = document.getElementById('avatar-preview-image');
    const fileInfo = document.getElementById('avatar-file-info');
    const compressBtn = document.getElementById('compress-avatar-btn');
    const removeBtn = document.getElementById('remove-avatar-btn');
    
    if (!fileInput) return; // Elements might not be loaded yet
    
    // File input change handler
    fileInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            selectedAvatarFile = file;
            showAvatarPreview(file);
            if (urlInput) urlInput.value = ''; // Clear URL input
        }
    });
    
    // URL input change handler
    if (urlInput) {
        urlInput.addEventListener('input', function(e) {
            const url = e.target.value.trim();
            if (url) {
                selectedAvatarFile = null;
                fileInput.value = '';
                showUrlPreview(url);
            } else {
                hideAvatarPreview();
            }
        });
    }
    
    // Compress button handler
    if (compressBtn) {
        compressBtn.addEventListener('click', async function() {
            if (selectedAvatarFile && typeof compressImage !== 'undefined') {
                try {
                    compressBtn.disabled = true;
                    compressBtn.textContent = 'Đang nén...';
                    
                    const compressed = await compressImage(selectedAvatarFile, 400, 0.8);
                    selectedAvatarFile = compressed;
                    showAvatarPreview(compressed);
                    
                    showNotification('Đã nén ảnh thành công', 'success');
                } catch (error) {
                    showNotification('Lỗi khi nén ảnh: ' + error.message, 'error');
                } finally {
                    compressBtn.disabled = false;
                    compressBtn.textContent = 'Nén ảnh';
                }
            }
        });
    }
    
    // Remove button handler
    if (removeBtn) {
        removeBtn.addEventListener('click', function() {
            selectedAvatarFile = null;
            fileInput.value = '';
            if (urlInput) urlInput.value = '';
            hideAvatarPreview();
        });
    }
}

// Show avatar preview for file
function showAvatarPreview(file) {
    const previewSection = document.getElementById('avatar-preview');
    const previewImage = document.getElementById('avatar-preview-image');
    const fileInfo = document.getElementById('avatar-file-info');
    
    if (!previewSection || !previewImage || !fileInfo) return;
    
    // Create object URL for preview
    const objectUrl = URL.createObjectURL(file);
    previewImage.src = objectUrl;
    
    // Show file info
    const sizeInMB = (file.size / 1024 / 1024).toFixed(2);
    fileInfo.textContent = `${file.name} (${sizeInMB} MB, ${file.type})`;
    
    previewSection.classList.remove('hidden');
    
    // Cleanup old object URL
    previewImage.onload = () => URL.revokeObjectURL(objectUrl);
}

// Show preview for URL
function showUrlPreview(url) {
    const previewSection = document.getElementById('avatar-preview');
    const previewImage = document.getElementById('avatar-preview-image');
    const fileInfo = document.getElementById('avatar-file-info');
    const compressBtn = document.getElementById('compress-avatar-btn');
    
    if (!previewSection || !previewImage || !fileInfo) return;
    
    previewImage.src = url;
    fileInfo.textContent = `URL: ${url}`;
    
    // Hide compress button for URL
    if (compressBtn) compressBtn.classList.add('hidden');
    
    previewSection.classList.remove('hidden');
}

// Hide avatar preview
function hideAvatarPreview() {
    const previewSection = document.getElementById('avatar-preview');
    if (previewSection) {
        previewSection.classList.add('hidden');
    }
    
    // Show compress button again
    const compressBtn = document.getElementById('compress-avatar-btn');
    if (compressBtn) compressBtn.classList.remove('hidden');
}

// Show current avatar in edit mode
function showCurrentAvatar(avatarUrl) {
    const currentAvatarDisplay = document.getElementById('current-avatar-display');
    const currentAvatarImage = document.getElementById('current-avatar-image');
    const currentAvatarUrlText = document.getElementById('current-avatar-url');
    
    if (!currentAvatarDisplay || !currentAvatarImage || !currentAvatarUrlText) return;
    
    if (avatarUrl) {
        currentAvatarImage.src = avatarUrl;
        currentAvatarUrlText.textContent = avatarUrl;
        currentAvatarDisplay.classList.remove('hidden');
        currentAvatarUrl = avatarUrl;
    } else {
        currentAvatarDisplay.classList.add('hidden');
        currentAvatarUrl = null;
    }
}

// Upload progress display
function showUploadProgress() {
    const progressSection = document.getElementById('upload-progress');
    const progressBar = document.getElementById('upload-progress-bar');
    const statusText = document.getElementById('upload-status');
    
    if (!progressSection || !progressBar || !statusText) return null;
    
    progressSection.classList.remove('hidden');
    progressBar.style.width = '0%';
    statusText.textContent = 'Đang chuẩn bị tải lên...';
    
    // Simulate progress (since GitHub API doesn't provide real progress)
    let progress = 0;
    const interval = setInterval(() => {
        progress += Math.random() * 30;
        if (progress > 90) progress = 90;
        
        progressBar.style.width = progress + '%';
        statusText.textContent = `Đang tải lên... ${Math.round(progress)}%`;
        
        if (progress >= 90) {
            clearInterval(interval);
        }
    }, 200);
    
    return interval;
}

function hideUploadProgress() {
    const progressSection = document.getElementById('upload-progress');
    if (progressSection) {
        progressSection.classList.add('hidden');
    }
}

// Updated initialization
function setupEventListeners() {
    // Login form
    const loginForm = document.getElementById('login-form-element');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    // Logout button
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }

    // Tab navigation
    const tabBtns = document.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const targetTab = e.target.getAttribute('data-tab');
            switchTab(targetTab);
        });
    });

    // Member management
    const addMemberBtn = document.getElementById('add-member-btn');
    if (addMemberBtn) {
        addMemberBtn.addEventListener('click', () => showMemberModal());
    }

    const cancelMemberBtn = document.getElementById('cancel-member-btn');
    if (cancelMemberBtn) {
        cancelMemberBtn.addEventListener('click', hideMemberModal);
    }

    const memberForm = document.getElementById('member-form');
    if (memberForm) {
        memberForm.addEventListener('submit', handleMemberSubmit);
    }
}
