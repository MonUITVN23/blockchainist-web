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

// Applications Management
async function loadApplications() {
    const loadingDiv = document.getElementById('applications-loading');
    const listDiv = document.getElementById('applications-list');
    
    try {
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
        listDiv.innerHTML = '<p class="text-red-400 text-center py-8">Lỗi khi tải dữ liệu</p>';
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

function showMemberModal(editMode = false, memberId = null, name = '', role = '', avatar = '') {
    const modal = document.getElementById('member-modal');
    const title = document.getElementById('member-modal-title');
    const form = document.getElementById('member-form');
    
    // Set form values
    document.getElementById('member-name').value = name;
    document.getElementById('member-role').value = role;
    document.getElementById('member-avatar').value = avatar;
    
    // Set title and form action
    title.textContent = editMode ? 'Sửa thành viên' : 'Thêm thành viên';
    form.setAttribute('data-member-id', memberId || '');
    form.setAttribute('data-edit-mode', editMode);
    
    modal.classList.remove('hidden');
    modal.classList.add('flex');
}

function hideMemberModal() {
    const modal = document.getElementById('member-modal');
    modal.classList.add('hidden');
    modal.classList.remove('flex');
}

async function handleMemberSubmit(e) {
    e.preventDefault();
    
    const name = document.getElementById('member-name').value;
    const role = document.getElementById('member-role').value;
    const avatar = document.getElementById('member-avatar').value;
    const form = e.target;
    const memberId = form.getAttribute('data-member-id');
    const editMode = form.getAttribute('data-edit-mode') === 'true';
    
    const memberData = {
        name: name,
        role: role,
        avatar: avatar
    };
    
    try {
        if (editMode && memberId) {
            await db.collection('members').doc(memberId).update(memberData);
        } else {
            await db.collection('members').add(memberData);
        }
        
        hideMemberModal();
        loadMembers();
        
    } catch (error) {
        console.error('Error saving member:', error);
        alert('Lỗi khi lưu thành viên');
    }
}

function editMember(id, name, role, avatar) {
    showMemberModal(true, id, name, role, avatar);
}

async function deleteMember(id) {
    if (!confirm('Bạn có chắc chắn muốn xóa thành viên này?')) return;
    
    try {
        await db.collection('members').doc(id).delete();
        loadMembers();
    } catch (error) {
        console.error('Error deleting member:', error);
        alert('Lỗi khi xóa thành viên');
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
                    <h4 class="text-lg font-semibold text-white mb-2">${data.title}</h4>
                    <p class="text-sky-400 mb-2">${data.authors || 'Không rõ tác giả'}</p>
                    <p class="text-gray-400 text-sm mb-2">${data.journal || 'Không rõ tạp chí'} (${data.year || 'N/A'})</p>
                    ${data.abstract ? `<p class="text-gray-300 text-sm">${data.abstract}</p>` : ''}
                    <div class="flex justify-end space-x-2 mt-4">
                        ${data.url ? `<a href="${data.url}" target="_blank" class="text-sky-400 hover:text-sky-300 text-sm">Xem bài báo</a>` : ''}
                        <button onclick="deletePublication('${doc.id}')" class="text-red-400 hover:text-red-300 text-sm">Xóa</button>
                    </div>
                </div>
            `;
        });
        
        listDiv.innerHTML = html;
        
    } catch (error) {
        console.error('Error loading publications:', error);
        listDiv.innerHTML = '<p class="text-red-400 text-center py-8">Lỗi khi tải dữ liệu</p>';
    }
}

async function deletePublication(id) {
    if (!confirm('Bạn có chắc chắn muốn xóa công bố này?')) return;
    
    try {
        await db.collection('publications').doc(id).delete();
        loadPublications();
    } catch (error) {
        console.error('Error deleting publication:', error);
        alert('Lỗi khi xóa công bố');
    }
}

// Settings Management
async function loadSettings() {
    try {
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
    }
}

async function saveSettings() {
    const emailInput = document.getElementById('notification-email');
    if (!emailInput) return;
    
    const notificationEmail = emailInput.value;
    
    try {
        await db.collection('settings').doc('general').set({
            notificationEmail: notificationEmail,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
        
        showNotification('Cài đặt đã được lưu', 'success');
    } catch (error) {
        console.error('Error saving settings:', error);
        showNotification('Lỗi khi lưu cài đặt', 'error');
    }
}
