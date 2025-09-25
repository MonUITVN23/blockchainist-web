// GitHub Storage Solution - No Firebase Storage needed
// Storage functions will be loaded from storage-solution.js

// Wait for DOM and Firebase to be ready
document.addEventListener('DOMContentLoaded', function() {
    // Small delay to ensure Firebase and storage solution are loaded
    setTimeout(() => {
        initializeWebsite();
    }, 500);
});

function initializeWebsite() {
    // Check if Firebase is loaded
    if (typeof firebase === 'undefined') {
        console.error('❌ Firebase not loaded');
        showNotification('Lỗi: Firebase chưa được tải', 'error');
        return;
    }

    // Check if storage solution is loaded
    if (typeof getRandomAvatar === 'undefined') {
        console.error('❌ Storage solution not loaded');
        showNotification('Lỗi: Storage solution chưa được tải', 'error');
        return;
    }

    console.log('✅ Website initialized successfully');
    loadMembers();
    loadPublications();
    setupContactForm();
    setupSmoothScrolling();
    setupProfileModal();
}

// Load members from Firebase với click handler
async function loadMembers() {
    try {
        const snapshot = await db.collection('members').orderBy('name').get();
        const teamContainer = document.querySelector('#team .grid');
        
        if (teamContainer && !snapshot.empty) {
            let html = '';
            snapshot.forEach(doc => {
                const member = doc.data();
                const memberId = doc.id;
                html += `
                    <div class="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700 text-center hover:border-sky-500 transition-colors cursor-pointer member-card" 
                         data-member-id="${memberId}" data-aos="fade-up">
                        <div class="w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden bg-gray-700">
                            <img src="${member.avatar || 'https://via.placeholder.com/96x96/4B5563/FFFFFF?text=' + (member.name?.charAt(0) || '?')}" 
                                 alt="${member.name || 'Thành viên'}" 
                                 class="w-full h-full object-cover">
                        </div>
                        <h4 class="text-lg font-bold text-white mb-2">${member.name || 'Không rõ tên'}</h4>
                        <p class="text-sky-400 mb-2">${member.role || 'Thành viên'}</p>
                        <p class="text-xs text-gray-400 hover:text-sky-300 transition-colors">Click để xem profile →</p>
                    </div>
                `;
            });
            teamContainer.innerHTML = html;
            
            // Add click handlers to member cards
            document.querySelectorAll('.member-card').forEach(card => {
                card.addEventListener('click', (e) => {
                    const memberId = e.currentTarget.getAttribute('data-member-id');
                    showMemberProfile(memberId);
                });
            });
            
            // Re-initialize AOS for new elements
            if (typeof AOS !== 'undefined') {
                AOS.refresh();
            }
        }
    } catch (error) {
        console.error('Error loading members:', error);
    }
}

// Setup profile modal
function setupProfileModal() {
    const modal = document.getElementById('member-profile-modal');
    const closeBtn = document.getElementById('close-profile-modal');
    
    // Close modal handlers
    closeBtn?.addEventListener('click', hideProfileModal);
    modal?.addEventListener('click', (e) => {
        if (e.target === modal) {
            hideProfileModal();
        }
    });
    
    // Escape key handler
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
            hideProfileModal();
        }
    });
    
    // Setup profile tabs
    document.querySelectorAll('.profile-tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const targetTab = e.target.getAttribute('data-tab');
            switchProfileTab(targetTab);
        });
    });
}

// Show member profile modal
async function showMemberProfile(memberId) {
    const modal = document.getElementById('member-profile-modal');
    const loadingDiv = document.getElementById('profile-loading');
    const contentDiv = document.getElementById('profile-content');
    
    // Show modal and loading state
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    loadingDiv.classList.remove('hidden');
    contentDiv.classList.add('hidden');
    
    try {
        // Load member data
        const memberDoc = await db.collection('members').doc(memberId).get();
        if (!memberDoc.exists) {
            throw new Error('Member not found');
        }
        
        const memberData = memberDoc.data();
        
        // Load member's publications
        const publicationsSnapshot = await db.collection('publications')
            .where('authorIds', 'array-contains', createSlugFromName(memberData.nickname || memberData.name))
            .orderBy('year', 'desc')
            .get();
        
        const publications = publicationsSnapshot.docs.map(doc => doc.data());
        
        // Populate profile data
        populateProfileModal(memberData, publications);
        
        // Show content, hide loading
        loadingDiv.classList.add('hidden');
        contentDiv.classList.remove('hidden');
        
        // Initialize Lucide icons
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
        
    } catch (error) {
        console.error('Error loading member profile:', error);
        showNotification('Lỗi khi tải thông tin thành viên', 'error');
        hideProfileModal();
    }
}

// Hide profile modal
function hideProfileModal() {
    const modal = document.getElementById('member-profile-modal');
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    
    // Reset to first tab
    switchProfileTab('research');
}

// Populate profile modal with member data
function populateProfileModal(memberData, publications) {
    // Basic info
    document.getElementById('profile-avatar').src = memberData.avatar || '/default-avatar.png';
    document.getElementById('profile-avatar').alt = memberData.name || 'Thành viên';
    document.getElementById('profile-name').textContent = memberData.name || 'Không rõ tên';
    document.getElementById('profile-nickname').textContent = memberData.nickname || '';
    document.getElementById('profile-role').textContent = memberData.role || 'Thành viên';
    document.getElementById('profile-bio').textContent = memberData.bio || 'Chưa có thông tin tiểu sử.';
    
    // Links
    const googleScholarLink = document.getElementById('profile-google-scholar');
    const orcidLink = document.getElementById('profile-orcid');
    
    if (memberData.googleScholar) {
        googleScholarLink.href = memberData.googleScholar;
        googleScholarLink.style.display = 'inline-block';
    } else {
        googleScholarLink.style.display = 'none';
    }
    
    if (memberData.orcid) {
        orcidLink.href = memberData.orcid;
        orcidLink.style.display = 'inline-block';
    } else {
        orcidLink.style.display = 'none';
    }
    
    // Research interests
    const researchContainer = document.getElementById('profile-research-interests');
    if (memberData.researchInterests && memberData.researchInterests.length > 0) {
        researchContainer.innerHTML = memberData.researchInterests.map(interest => 
            `<span class="bg-sky-600 text-white px-3 py-1 rounded-full text-sm">${interest}</span>`
        ).join('');
    } else {
        researchContainer.innerHTML = '<p class="text-gray-400">Chưa có thông tin hướng nghiên cứu.</p>';
    }
    
    // Publications
    const publicationsContainer = document.getElementById('profile-publications-list');
    const publicationsCount = document.getElementById('profile-publications-count');
    
    if (publications.length > 0) {
        publicationsCount.textContent = `${publications.length} công bố`;
        publicationsContainer.innerHTML = publications.map(pub => `
            <div class="bg-gray-700 p-4 rounded-lg border border-gray-600">
                <div class="flex justify-between items-start mb-2">
                    <span class="text-xs px-2 py-1 rounded ${getPublicationTypeColor(pub.type)} text-white">
                        ${pub.type || 'Paper'}
                    </span>
                    <div class="flex items-center text-sm text-gray-400">
                        <i data-lucide="calendar" class="w-4 h-4 mr-1"></i>
                        ${pub.year || 'N/A'}
                    </div>
                </div>
                <h5 class="text-lg font-semibold text-white mb-2">${pub.title}</h5>
                <p class="text-sky-400 text-sm mb-2">${pub.authors}</p>
                <p class="text-gray-300 text-sm mb-3"><em>${pub.journal}</em></p>
                ${pub.abstract ? `
                    <div class="mb-3">
                        <button class="toggle-abstract text-sky-400 hover:text-sky-300 text-sm">Xem Abstract</button>
                        <div class="abstract-content hidden mt-2">
                            <p class="text-gray-400 text-sm p-3 bg-gray-800 rounded-lg">${pub.abstract}</p>
                        </div>
                    </div>
                ` : ''}
                <div class="flex justify-between items-center">
                    <div class="flex space-x-4 text-sm text-gray-400">
                        ${pub.citations ? `<span><i data-lucide="quote" class="w-4 h-4 inline mr-1"></i>${pub.citations} citations</span>` : ''}
                        ${pub.doi ? `<span>DOI: ${pub.doi}</span>` : ''}
                    </div>
                    ${pub.url ? `
                        <a href="${pub.url}" target="_blank" class="text-sky-400 hover:text-sky-300 text-sm">
                            <i data-lucide="external-link" class="w-4 h-4 inline mr-1"></i>Xem bài báo
                        </a>
                    ` : ''}
                </div>
            </div>
        `).join('');
        
        // Setup abstract toggles
        setTimeout(() => {
            publicationsContainer.querySelectorAll('.toggle-abstract').forEach(button => {
                button.addEventListener('click', () => {
                    const content = button.nextElementSibling;
                    const isHidden = content.classList.contains('hidden');
                    
                    if (isHidden) {
                        content.classList.remove('hidden');
                        button.textContent = 'Ẩn Abstract';
                    } else {
                        content.classList.add('hidden');
                        button.textContent = 'Xem Abstract';
                    }
                });
            });
        }, 100);
        
    } else {
        publicationsCount.textContent = '0 công bố';
        publicationsContainer.innerHTML = '<p class="text-gray-400 text-center py-8">Chưa có công bố khoa học.</p>';
    }
    
    // Education
    const educationContainer = document.getElementById('profile-education');
    if (memberData.education && memberData.education.length > 0) {
        educationContainer.innerHTML = memberData.education.map(edu => `
            <div class="flex items-start">
                <i data-lucide="graduation-cap" class="w-5 h-5 text-sky-400 mr-3 mt-1 flex-shrink-0"></i>
                <p class="text-gray-300">${edu}</p>
            </div>
        `).join('');
    } else {
        educationContainer.innerHTML = '<p class="text-gray-400">Chưa có thông tin học vấn.</p>';
    }
    
    // Achievements
    const achievementsContainer = document.getElementById('profile-achievements');
    if (memberData.achievements && memberData.achievements.length > 0) {
        achievementsContainer.innerHTML = memberData.achievements.map(achievement => `
            <div class="flex items-start">
                <i data-lucide="award" class="w-5 h-5 text-yellow-400 mr-3 mt-1 flex-shrink-0"></i>
                <p class="text-gray-300">${achievement}</p>
            </div>
        `).join('');
    } else {
        achievementsContainer.innerHTML = '<p class="text-gray-400">Chưa có thông tin thành tích.</p>';
    }
}

// Switch profile tabs
function switchProfileTab(tabName) {
    // Hide all tab contents
    document.querySelectorAll('.profile-tab-content').forEach(tab => {
        tab.classList.add('hidden');
    });
    
    // Remove active class from all tab buttons
    document.querySelectorAll('.profile-tab-btn').forEach(btn => {
        btn.classList.remove('active', 'border-sky-500', 'text-sky-400');
        btn.classList.add('border-transparent', 'text-gray-300');
    });
    
    // Show target tab content
    const targetTab = document.getElementById(`profile-tab-${tabName}`);
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

// Helper function to create slug from name
function createSlugFromName(name) {
    return name.toLowerCase()
        .replace(/[^a-z0-9 -]/g, '') // Remove special characters
        .replace(/\s+/g, '-')        // Replace spaces with hyphens
        .replace(/-+/g, '-');        // Replace multiple hyphens with single
}

// Load publications from Firebase - Updated with error handling
async function loadPublications() {
    try {
        const snapshot = await db.collection('publications').orderBy('year', 'desc').limit(5).get();
        const publicationsContainer = document.querySelector('#publications .space-y-6');
        
        if (publicationsContainer && !snapshot.empty) {
            let html = '';
            snapshot.forEach(doc => {
                const pub = doc.data();
                html += `
                    <div class="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700" data-aos="fade-up">
                        <div class="flex justify-between items-start mb-2">
                            <span class="text-xs px-2 py-1 rounded ${getPublicationTypeColor(pub.type)} text-white">
                                ${pub.type || 'Paper'}
                            </span>
                            <span class="text-sm text-gray-400">${pub.year || 'N/A'}</span>
                        </div>
                        <h4 class="text-xl font-bold text-white mb-2">${pub.title || 'Tiêu đề không rõ'}</h4>
                        <p class="text-sky-400 mb-2">${pub.authors || 'Tác giả không rõ'}</p>
                        <p class="text-gray-400 text-sm mb-4"><em>${pub.journal || 'Tạp chí không rõ'}</em></p>
                        ${pub.abstract ? `
                            <button class="toggle-abstract text-sky-400 hover:text-sky-300 text-sm mb-2 focus:outline-none">
                                Xem Abstract
                            </button>
                            <div class="abstract-content hidden">
                                <p class="text-gray-300 text-sm p-4 bg-gray-700 rounded-lg">${pub.abstract}</p>
                            </div>
                        ` : ''}
                        <div class="flex justify-between items-center mt-4">
                            <div class="flex space-x-4 text-sm text-gray-400">
                                ${pub.citations ? `<span><i data-lucide="quote" class="w-4 h-4 inline mr-1"></i>${pub.citations}</span>` : ''}
                                ${pub.doi ? `<span>DOI: ${pub.doi}</span>` : ''}
                            </div>
                            ${pub.url ? `
                                <a href="${pub.url}" target="_blank" class="text-sky-400 hover:text-sky-300 text-sm">
                                    <i data-lucide="external-link" class="inline w-4 h-4 mr-1"></i>
                                    Xem bài báo
                                </a>
                            ` : ''}
                        </div>
                    </div>
                `;
            });
            
            publicationsContainer.innerHTML = html;
            
            // Setup abstract toggles
            setupAbstractToggles();
            
            // Re-initialize AOS and Lucide icons
            if (typeof AOS !== 'undefined') {
                AOS.refresh();
            }
            if (typeof lucide !== 'undefined') {
                lucide.createIcons();
            }
        } else {
            // Handle empty state
            const publicationsContainer = document.querySelector('#publications .space-y-6');
            if (publicationsContainer) {
                publicationsContainer.innerHTML = `
                    <div class="text-center py-8">
                        <p class="text-gray-400">Chưa có công bố khoa học nào.</p>
                    </div>
                `;
            }
        }
    } catch (error) {
        console.error('Error loading publications:', error);
        const publicationsContainer = document.querySelector('#publications .space-y-6');
        if (publicationsContainer) {
            if (error.code === 'permission-denied') {
                publicationsContainer.innerHTML = `
                    <div class="text-center py-8">
                        <p class="text-red-400">❌ Không thể tải danh sách công bố. Đang cập nhật quyền truy cập...</p>
                    </div>
                `;
            } else {
                publicationsContainer.innerHTML = `
                    <div class="text-center py-8">
                        <p class="text-red-400">❌ Lỗi khi tải công bố: ${error.message}</p>
                    </div>
                `;
            }
        }
    }
}

// Setup contact form
function setupContactForm() {
    const contactForm = document.querySelector('#contact form');
    
    if (contactForm) {
        contactForm.addEventListener('submit', handleContactSubmit);
    }
    
    // Setup file inputs
    setupFileInput('cv-upload', 'cv-filename');
    setupFileInput('transcript-upload', 'transcript-filename');
}

// Handle contact form submission (simplified without file storage)
async function handleContactSubmit(e) {
    e.preventDefault();
    
    const submitButton = e.target.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;
    
    // Show loading state
    submitButton.disabled = true;
    submitButton.innerHTML = '<div class="animate-spin rounded-full h-5 w-5 border-b-2 border-white mx-auto"></div>';
    
    try {
        // Get form data
        const formData = {
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            school: document.getElementById('school').value,
            phone: document.getElementById('phone').value,
            message: document.getElementById('message').value,
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            status: 'pending'
        };
        
        // Handle file information (store metadata only)
        const cvFile = document.getElementById('cv-upload').files[0];
        const transcriptFile = document.getElementById('transcript-upload').files[0];
        
        if (cvFile) {
            formData.cvInfo = {
                name: cvFile.name,
                size: cvFile.size,
                type: cvFile.type,
                hasFile: true
            };
        }
        
        if (transcriptFile) {
            formData.transcriptInfo = {
                name: transcriptFile.name,
                size: transcriptFile.size,
                type: transcriptFile.type,
                hasFile: true
            };
        }
        
        // Save to Firestore (without actual files)
        await db.collection('applications').add(formData);
        
        // Show success message with instructions
        let message = 'Thông tin của bạn đã được gửi thành công! ';
        if (cvFile || transcriptFile) {
            message += 'Vui lòng gửi CV và bảng điểm qua email: admin@blockchainist.edu.vn với tiêu đề "Hồ sơ ứng tuyển - ' + formData.name + '"';
        }
        showNotification(message, 'success');
        
        // Reset form
        e.target.reset();
        document.getElementById('cv-filename').textContent = 'Chưa chọn tệp';
        document.getElementById('transcript-filename').textContent = 'Chưa chọn tệp';
        
    } catch (error) {
        console.error('Error submitting application:', error);
        showNotification('Có lỗi xảy ra khi gửi hồ sơ. Vui lòng thử lại sau.', 'error');
    } finally {
        // Reset button
        submitButton.disabled = false;
        submitButton.textContent = originalText;
    }
}

// Setup file input display
function setupFileInput(inputId, filenameId) {
    const input = document.getElementById(inputId);
    const filenameDisplay = document.getElementById(filenameId);
    
    if (input && filenameDisplay) {
        input.addEventListener('change', () => {
            if (input.files.length > 0) {
                const fileName = input.files[0].name;
                const fileSize = (input.files[0].size / 1024 / 1024).toFixed(2);
                filenameDisplay.textContent = `${fileName} (${fileSize} MB)`;
                filenameDisplay.classList.remove('text-gray-500');
                filenameDisplay.classList.add('text-green-400');
            } else {
                filenameDisplay.textContent = 'Chưa chọn tệp';
                filenameDisplay.classList.remove('text-green-400');
                filenameDisplay.classList.add('text-gray-500');
            }
        });
    }
}

// Setup smooth scrolling
function setupSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const headerOffset = 80;
                const elementPosition = target.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Show notification
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existing = document.querySelector('.notification');
    if (existing) {
        existing.remove();
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-md transition-all duration-300 transform translate-x-full`;
    
    const bgColor = type === 'success' ? 'bg-green-600' : type === 'error' ? 'bg-red-600' : 'bg-blue-600';
    notification.classList.add(bgColor);
    
    notification.innerHTML = `
        <div class="flex items-center">
            <div class="flex-shrink-0">
                ${type === 'success' ? 
                    '<i data-lucide="check-circle" class="w-5 h-5 text-white"></i>' :
                    type === 'error' ?
                    '<i data-lucide="x-circle" class="w-5 h-5 text-white"></i>' :
                    '<i data-lucide="info" class="w-5 h-5 text-white"></i>'
                }
            </div>
            <div class="ml-3 flex-1">
                <p class="text-sm font-medium text-white">${message}</p>
            </div>
            <button onclick="this.parentElement.parentElement.remove()" class="ml-4 text-white hover:text-gray-200">
                <i data-lucide="x" class="w-4 h-4"></i>
            </button>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Initialize Lucide icons for notification
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
    
    // Animate in
    setTimeout(() => {
        notification.classList.remove('translate-x-full');
    }, 100);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.classList.add('translate-x-full');
            setTimeout(() => {
                if (notification.parentElement) {
                    notification.remove();
                }
            }, 300);
        }
    }, 5000);
}

// Utility function to format date
function formatDate(date) {
    if (!date) return 'Không rõ';
    
    if (typeof date === 'object' && date.toDate) {
        date = date.toDate();
    }
    
    return new Intl.DateTimeFormat('vi-VN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }).format(date);
}

// Export functions for global access
window.showNotification = showNotification;
window.formatDate = formatDate;
