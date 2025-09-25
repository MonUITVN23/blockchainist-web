// Cloudinary Configuration for Blockchainist Web
// Update these values with your actual Cloudinary settings

// IMPORTANT: Update these values before deploying
const CLOUDINARY_SETTINGS = {
  // Free demo account (replace with your account)
  cloudName: 'demo', // ← Replace with your cloud name
  uploadPreset: 'ml_default', // ← Replace with your upload preset
  
  // Folder organization
  folders: {
    avatars: 'blockchainist/avatars',
    banners: 'blockchainist/banners',
    gallery: 'blockchainist/gallery',
    icons: 'blockchainist/icons'
  },
  
  // Image transformations for optimization
  transforms: {
    avatar: 'c_fill,g_face,h_150,w_150,q_auto,f_auto',
    avatarLarge: 'c_fill,g_face,h_300,w_300,q_auto,f_auto',
    thumbnail: 'c_fill,h_200,w_200,q_auto,f_auto',
    banner: 'c_fill,h_400,w_800,q_auto,f_auto',
    optimized: 'q_auto,f_auto'
  }
};

// Apply settings to global config
if (typeof CLOUDINARY_CONFIG !== 'undefined') {
  Object.assign(CLOUDINARY_CONFIG, CLOUDINARY_SETTINGS);
}

// Environment detection
const isDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

console.log(`🌍 Environment: ${isDev ? 'Development' : 'Production'}`);
console.log(`☁️ Cloudinary Cloud: ${CLOUDINARY_SETTINGS.cloudName}`);

// Configuration warnings
const warnings = [];
if (CLOUDINARY_SETTINGS.cloudName === 'demo') {
  warnings.push('⚠️ Using demo cloud - update for production');
}
if (CLOUDINARY_SETTINGS.uploadPreset === 'ml_default') {
  warnings.push('⚠️ Using default preset - create custom preset');
}

if (warnings.length > 0) {
  console.warn('Cloudinary Configuration:', warnings);
}

// Export for use
if (typeof window !== 'undefined') {
  window.CLOUDINARY_SETTINGS = CLOUDINARY_SETTINGS;
}