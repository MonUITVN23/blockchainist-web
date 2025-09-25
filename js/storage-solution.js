// Hybrid storage solution: GitHub for assets + Unsplash for placeholder images
const STORAGE_SOLUTION = {
  // Static assets (logos, icons) -> GitHub
  github: {
    username: 'MonUITVN23',
    repo: 'blockchainist-web',
    branch: 'main',
    assetsPath: 'assets'
  },
  
  // Profile images -> Unsplash (free high-quality images)
  unsplash: {
    baseUrl: 'https://images.unsplash.com',
    collections: {
      avatars: ['photo-1507003211169-0a1dd7228f2d', 'photo-1494790108755-2616b612b109', 'photo-1472099645785-5658abf4ff4e'],
      tech: ['photo-1518709268805-4e9042af2176', 'photo-1526374965328-7f61d4dc18c5']
    }
  },
  
  // Documents (CV, transcripts) -> Email attachment hoặc Google Drive link
  documents: {
    method: 'email', // 'email', 'gdrive', 'dropbox'
    instruction: 'Gửi CV và bảng điểm qua email: contact@yourwebsite.com'
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

function getRandomAvatar() {
  const avatars = STORAGE_SOLUTION.unsplash.collections.avatars;
  const randomId = avatars[Math.floor(Math.random() * avatars.length)];
  return getUnsplashUrl(randomId);
}

export { getGitHubAssetUrl, getUnsplashUrl, getRandomAvatar, STORAGE_SOLUTION };