import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create upload directories if they don't exist
const createUploadDirectories = () => {
  const uploadDirs = [
    path.join(__dirname, 'uploads'),
    path.join(__dirname, 'uploads', 'photos'),
    path.join(__dirname, 'uploads', 'thumbnails')
  ];

  uploadDirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`Created directory: ${dir}`);
    }
  });
};

// Create default images if they don't exist
const createDefaultImages = () => {
  // Default candidate image
  const defaultCandidatePath = path.join(__dirname, 'uploads', 'photos', 'default.png');
  if (!fs.existsSync(defaultCandidatePath)) {
    console.log('Creating default candidate image');
    // Create a simple text file as a placeholder
    fs.writeFileSync(defaultCandidatePath, 'Default candidate image');
  }

  // Default election thumbnail
  const defaultThumbnailPath = path.join(__dirname, 'uploads', 'thumbnails', 'default.png');
  if (!fs.existsSync(defaultThumbnailPath)) {
    console.log('Creating default election thumbnail');
    // Create a simple text file as a placeholder
    fs.writeFileSync(defaultThumbnailPath, 'Default election thumbnail');
  }
};

// Initialize upload directories and default images
const initializeUploads = () => {
  createUploadDirectories();
  createDefaultImages();
};

export default initializeUploads; 