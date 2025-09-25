// GitHub Storage Solution for Blockchainist Web
// Using GitHub repository as free CDN and storage

const STORAGE_SOLUTION = {
  // Static assets (logos, icons) -> GitHub
  github: {
    username: 'MonUITVN23',
    repo: 'blockchainist-web',
    branch: 'master', // Updated to match your current branch
    assetsPath: 'assets'
  },
  
  // Profile images -> Unsplash (free high-quality images)
  unsplash: {
    baseUrl: 'https://images.unsplash.com',
    collections: {
      avatars: [
        'photo-1507003211169-0a1dd7228f2d', // Professional man
        'photo-1494790108755-2616b612b109', // Professional woman
        'photo-1472099645785-5658abf4ff4e', // Tech person
        'photo-1438761681033-6461ffad8d80', // Professional woman 2
        'photo-1500648767791-00dcc994a43e', // Professional man 2
        'photo-1573497019940-1c28c88b4f3e'  // Professional woman 3
      ],
      tech: ['photo-1518709268805-4e9042af2176', 'photo-1526374965328-7f61d4dc18c5']
    }
  },
  
  // Documents (CV, transcripts) -> Email attachment hoặc Google Drive link
  documents: {
    method: 'email', // 'email', 'gdrive', 'dropbox'
    instruction: 'Files will be processed via admin panel - no direct storage needed'
  }
};

// Helper functions
function getGitHubAssetUrl(filename) {
  const { username, repo, branch, assetsPath } = STORAGE_SOLUTION.github;
  return `https://raw.githubusercontent.com/${username}/${repo}/${branch}/${assetsPath}/${filename}`;
}

function getUnsplashUrl(photoId, width = 150, height = 150) {
  return `${STORAGE_SOLUTION.unsplash.baseUrl}/${photoId}?w=${width}&h=${height}&fit=crop&crop=face`;
}

function getRandomAvatar(width = 150, height = 150) {
  const avatars = STORAGE_SOLUTION.unsplash.collections.avatars;
  const randomId = avatars[Math.floor(Math.random() * avatars.length)];
  return getUnsplashUrl(randomId, width, height);
}

// Get default avatar for specific roles
function getAvatarByRole(role, width = 150, height = 150) {
  const roleMap = {
    'Trưởng nhóm': 'photo-1507003211169-0a1dd7228f2d',
    'Nghiên cứu sinh': 'photo-1472099645785-5658abf4ff4e',
    'Nghiên cứu viên': 'photo-1494790108755-2616b612b109',
    'Thành viên': 'photo-1500648767791-00dcc994a43e'
  };
  
  const photoId = roleMap[role] || STORAGE_SOLUTION.unsplash.collections.avatars[0];
  return getUnsplashUrl(photoId, width, height);
}

// Create GitHub repository structure guide
function getRepositoryStructureGuide() {
  return `
Repository Structure for Assets:

${STORAGE_SOLUTION.github.repo}/
├── assets/
│   ├── avatars/           # Member avatars (150x150px)
│   │   ├── member-1.jpg   # Use format: member-{id}.jpg
│   │   ├── member-2.jpg
│   │   └── default.jpg    # Fallback avatar
│   ├── icons/            # Icons and logos
│   │   ├── logo.svg      # Website logo
│   │   ├── favicon.ico   # Favicon
│   │   └── social/       # Social media icons
│   ├── images/           # General images
│   │   ├── hero-bg.jpg   # Hero background
│   │   └── research/     # Research-related images
│   └── documents/        # Public documents (if any)
└── uploads/              # Dynamic uploads (handled by backend)
    └── applications/     # CV, transcripts (requires GitHub API)

Usage Examples:
- Avatar: ${getGitHubAssetUrl('avatars/member-1.jpg')}
- Logo: ${getGitHubAssetUrl('icons/logo.svg')}
- Random Avatar: ${getRandomAvatar()}
  `;
}

// Log structure guide for development
if (typeof console !== 'undefined') {
  console.log('📁 GitHub Storage Solution Initialized');
  console.log('Repository:', `${STORAGE_SOLUTION.github.username}/${STORAGE_SOLUTION.github.repo}`);
  console.log('Branch:', STORAGE_SOLUTION.github.branch);
}

// Export for global access (compatible with non-module environments)
if (typeof window !== 'undefined') {
  window.getGitHubAssetUrl = getGitHubAssetUrl;
  window.getUnsplashUrl = getUnsplashUrl;
  window.getRandomAvatar = getRandomAvatar;
  window.getAvatarByRole = getAvatarByRole;
  window.STORAGE_SOLUTION = STORAGE_SOLUTION;
}

// Also support ES6 exports for future compatibility
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    getGitHubAssetUrl,
    getUnsplashUrl, 
    getRandomAvatar,
    getAvatarByRole,
    STORAGE_SOLUTION,
    getRepositoryStructureGuide
  };
}