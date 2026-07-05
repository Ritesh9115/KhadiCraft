// src/config/cloudinary.js — Custom storage engine for Cloudinary v2
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const path = require('path');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ─── Custom Cloudinary Storage Engine (no multer-storage-cloudinary needed) ──
function cloudinaryStorage({ folder, transformation }) {
  return {
    _handleFile(req, file, cb) {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: 'image',
          allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
          transformation: transformation || [],
        },
        (error, result) => {
          if (error) return cb(error);
          cb(null, {
            path:       result.secure_url,
            secure_url: result.secure_url,
            public_id:  result.public_id,
            size:       result.bytes,
          });
        }
      );
      file.stream.pipe(uploadStream);
    },
    _removeFile(req, file, cb) {
      if (file.public_id) {
        cloudinary.uploader.destroy(file.public_id, cb);
      } else {
        cb(null);
      }
    },
  };
}

// File size limit helper
const fileSizeLimit = (mb) => ({ limits: { fileSize: mb * 1024 * 1024 } });

// ─── Multer instances with custom Cloudinary engine ──────
const uploadProduct  = multer({ storage: cloudinaryStorage({ folder: 'khadicraft/products',     transformation: [{ width: 1200, height: 1200, crop: 'limit', quality: 'auto' }] }), ...fileSizeLimit(5) });
const uploadAvatar   = multer({ storage: cloudinaryStorage({ folder: 'khadicraft/avatars',      transformation: [{ width: 400, height: 400, crop: 'fill', quality: 'auto' }] }),  ...fileSizeLimit(2) });
const uploadBanner   = multer({ storage: cloudinaryStorage({ folder: 'khadicraft/banners',      transformation: [{ width: 1920, height: 600, crop: 'limit', quality: 'auto' }] }), ...fileSizeLimit(5) });
const uploadCustom   = multer({ storage: cloudinaryStorage({ folder: 'khadicraft/custom-orders' }), ...fileSizeLimit(3) });
const uploadCategory = multer({ storage: cloudinaryStorage({ folder: 'khadicraft/categories',   transformation: [{ width: 800, height: 600, crop: 'limit', quality: 'auto' }] }),  ...fileSizeLimit(3) });
const uploadSettings = multer({ storage: cloudinaryStorage({ folder: 'khadicraft/settings' }),   ...fileSizeLimit(5) });

// ─── Delete helper ────────────────────────────────────────
const deleteFromCloudinary = async (publicUrl) => {
  try {
    if (!publicUrl) return;
    const parts = publicUrl.split('/');
    const folderAndFile = parts.slice(-2).join('/');
    const publicId = folderAndFile.replace(/\.[^/.]+$/, '');
    await cloudinary.uploader.destroy(publicId);
  } catch (e) {
    console.warn('Cloudinary delete warn:', e.message);
  }
};

module.exports = {
  cloudinary,
  uploadProduct,
  uploadAvatar,
  uploadBanner,
  uploadCustom,
  uploadCategory,
  uploadSettings,
  deleteFromCloudinary,
};
