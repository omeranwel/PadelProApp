import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { v2 as cloudinary } from 'cloudinary';

// Cloudinary config (will look at process.env automatically if configured correctly)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

let storage;

if (process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_KEY !== 'placeholder') {
  storage = new CloudinaryStorage({
    cloudinary,
    params: async (req, file) => ({
      folder: 'padelpro',
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
      transformation: [{ width: 1200, height: 800, crop: 'limit', quality: 'auto' }]
    })
  });
} else {
  console.warn('⚠️ Cloudinary not configured, falling back to MemoryStorage');
  storage = multer.memoryStorage();
}

export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only images allowed'), false);
  }
});
