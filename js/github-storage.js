// Sử dụng GitHub làm CDN miễn phí
const GITHUB_CONFIG = {
  username: 'MonUITVN23', // Thay bằng username GitHub của bạn
  repository: 'blockchainist-web', // Tên repository
  branch: 'main', // hoặc 'master'
  assetsFolder: 'assets' // Thư mục chứa hình ảnh
};

// Function để tạo URL từ GitHub
function getGitHubAssetURL(filename) {
  return `https://raw.githubusercontent.com/${GITHUB_CONFIG.username}/${GITHUB_CONFIG.repository}/${GITHUB_CONFIG.branch}/${GITHUB_CONFIG.assetsFolder}/${filename}`;
}

// Function để upload ảnh thông qua GitHub API (cần token)
async function uploadToGitHub(file, filename, githubToken) {
  const content = await fileToBase64(file);
  
  const response = await fetch(`https://api.github.com/repos/${GITHUB_CONFIG.username}/${GITHUB_CONFIG.repository}/contents/${GITHUB_CONFIG.assetsFolder}/${filename}`, {
    method: 'PUT',
    headers: {
      'Authorization': `token ${githubToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message: `Add ${filename}`,
      content: content.split(',')[1], // Remove data:image/... prefix
    })
  });
  
  return response.json();
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
}

export { getGitHubAssetURL, uploadToGitHub };