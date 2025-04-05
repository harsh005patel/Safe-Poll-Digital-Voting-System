const fs = require('fs');
const path = require('path');
const { v4: uuid } = require('uuid');

// Create uploads directories if they don't exist
const createDirectories = () => {
  const dirs = [
    path.join(__dirname, 'uploads'),
    path.join(__dirname, 'uploads', 'photos'),
    path.join(__dirname, 'uploads', 'thumbnails')
  ];

  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      console.log(`Creating directory: ${dir}`);
      fs.mkdirSync(dir, { recursive: true });
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

// Main function
const setupUploads = () => {
  console.log('Setting up uploads directories...');
  createDirectories();
  createDefaultImages();
  console.log('Uploads setup complete!');
};

// Run the setup
setupUploads(); 