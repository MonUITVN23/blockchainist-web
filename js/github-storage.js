// Enhanced GitHub Storage with upload functionality

const GITHUB_CONFIG = {
  username: 'MonUITVN23',
  repository: 'blockchainist-web',
  branch: 'main',
  assetsFolder: 'assets',
  // GitHub Personal Access Token - SET THIS IN ADMIN PANEL
  token: '', // Will be set dynamically
};

// Function để tạo URL từ GitHub
function getGitHubAssetURL(filename) {
  return `https://raw.githubusercontent.com/${GITHUB_CONFIG.username}/${GITHUB_CONFIG.repository}/${GITHUB_CONFIG.branch}/${GITHUB_CONFIG.assetsFolder}/${filename}`;
}

// Function để upload ảnh thông qua GitHub API
async function uploadToGitHub(file, filename, githubToken, folder = 'avatars') {
  try {
    // Validate file
    if (!file || !filename || !githubToken) {
      throw new Error('Missing required parameters');
    }
    
    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      throw new Error('File quá lớn (max 10MB)');
    }
    
    // Check file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      throw new Error('Định dạng file không được hỗ trợ. Chỉ chấp nhận: JPG, PNG, GIF, WebP');
    }
    
    // Convert file to base64
    const base64Content = await fileToBase64(file);
    const base64Data = base64Content.split(',')[1]; // Remove data:image/... prefix
    
    // Create file path
    const filePath = `${GITHUB_CONFIG.assetsFolder}/${folder}/${filename}`;
    
    // GitHub API endpoint
    const apiUrl = `https://api.github.com/repos/${GITHUB_CONFIG.username}/${GITHUB_CONFIG.repository}/contents/${filePath}`;
    
    // Check if file exists first
    let sha = null;
    try {
      const checkResponse = await fetch(apiUrl, {
        headers: {
          'Authorization': `token ${githubToken}`,
          'Accept': 'application/vnd.github.v3+json',
        }
      });
      
      if (checkResponse.ok) {
        const existingFile = await checkResponse.json();
        sha = existingFile.sha; // Get SHA for updating existing file
      }
    } catch (e) {
      // File doesn't exist, that's fine
    }
    
    // Upload file
    const uploadData = {
      message: `Upload ${filename} via admin panel`,
      content: base64Data,
    };
    
    if (sha) {
      uploadData.sha = sha; // Required for updating existing files
    }
    
    const response = await fetch(apiUrl, {
      method: 'PUT',
      headers: {
        'Authorization': `token ${githubToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/vnd.github.v3+json',
      },
      body: JSON.stringify(uploadData)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`GitHub API Error: ${errorData.message || 'Upload failed'}`);
    }
    
    const result = await response.json();
    
    // Return the raw GitHub URL
    const downloadUrl = `https://raw.githubusercontent.com/${GITHUB_CONFIG.username}/${GITHUB_CONFIG.repository}/${GITHUB_CONFIG.branch}/${filePath}`;
    
    return {
      success: true,
      url: downloadUrl,
      filename: filename,
      size: file.size,
      type: file.type,
      githubUrl: result.content.html_url
    };
    
  } catch (error) {
    console.error('Upload error:', error);
    throw error;
  }
}

// Helper function to convert file to base64
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
}

// Helper function to generate unique filename
function generateUniqueFilename(originalName) {
  const timestamp = Date.now();
  const extension = originalName.split('.').pop();
  const nameWithoutExt = originalName.replace(/\.[^/.]+$/, "");
  const safeName = nameWithoutExt.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
  return `${safeName}_${timestamp}.${extension}`;
}

// Helper function to compress image before upload
async function compressImage(file, maxWidth = 800, quality = 0.8) {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = function() {
      // Calculate new dimensions
      let { width, height } = img;
      
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }
      
      canvas.width = width;
      canvas.height = height;
      
      // Draw and compress
      ctx.drawImage(img, 0, 0, width, height);
      
      canvas.toBlob(resolve, file.type, quality);
    };
    
    img.src = URL.createObjectURL(file);
  });
}

// Export functions
if (typeof window !== 'undefined') {
  window.uploadToGitHub = uploadToGitHub;
  window.fileToBase64 = fileToBase64;
  window.generateUniqueFilename = generateUniqueFilename;
  window.compressImage = compressImage;
  window.getGitHubAssetURL = getGitHubAssetURL;
  window.GITHUB_CONFIG = GITHUB_CONFIG;
}

// ES6 exports
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    uploadToGitHub,
    fileToBase64,
    generateUniqueFilename,
    compressImage,
    getGitHubAssetURL,
    GITHUB_CONFIG
  };
}