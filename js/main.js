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
}

// Load members from Firebase
async function loadMembers() {
    try {
        const snapshot = await db.collection('members').orderBy('name').get();
        const teamContainer = document.querySelector('#team .grid');
        
        if (teamContainer && !snapshot.empty) {
            let html = '';
            snapshot.forEach(doc => {
                const member = doc.data();
                html += `
                    <div class="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700 text-center" data-aos="fade-up">
                        <div class="w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden bg-gray-700">
                            <img src="${member.avatar || 'https://via.placeholder.com/96x96/4B5563/FFFFFF?text=' + (member.name?.charAt(0) || '?')}" 
                                 alt="${member.name || 'Thành viên'}" 
                                 class="w-full h-full object-cover">
                        </div>
                        <h4 class="text-lg font-bold text-white mb-2">${member.name || 'Không rõ tên'}</h4>
                        <p class="text-sky-400">${member.role || 'Thành viên'}</p>
                    </div>
                `;
            });
            teamContainer.innerHTML = html;
            
            // Re-initialize AOS for new elements
            if (typeof AOS !== 'undefined') {
                AOS.refresh();
            }
        }
    } catch (error) {
        console.error('Error loading members:', error);
    }
}

// Load publications from Firebase
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
                        <h4 class="text-xl font-bold text-white mb-2">${pub.title || 'Tiêu đề không rõ'}</h4>
                        <p class="text-sky-400 mb-2">${pub.authors || 'Tác giả không rõ'}</p>
                        <p class="text-gray-400 text-sm mb-4">${pub.journal || 'Tạp chí không rõ'} (${pub.year || 'N/A'})</p>
                        ${pub.abstract ? `
                            <button class="toggle-abstract text-sky-400 hover:text-sky-300 text-sm mb-2 focus:outline-none">
                                Xem Abstract
                            </button>
                            <div class="abstract-content hidden">
                                <p class="text-gray-300 text-sm p-4 bg-gray-700 rounded-lg">${pub.abstract}</p>
                            </div>
                        ` : ''}
                        ${pub.url ? `
                            <div class="mt-4">
                                <a href="${pub.url}" target="_blank" class="text-sky-400 hover:text-sky-300 text-sm">
                                    <i data-lucide="external-link" class="inline w-4 h-4 mr-1"></i>
                                    Xem bài báo
                                </a>
                            </div>
                        ` : ''}
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
        }
    } catch (error) {
        console.error('Error loading publications:', error);
    }
}

// Setup abstract toggle functionality
function setupAbstractToggles() {
    document.querySelectorAll('.toggle-abstract').forEach(button => {
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
