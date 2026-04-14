import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";

// ── Configure Cloudinary ──────────────────────────────────────
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ── Item image storage ────────────────────────────────────────
const itemStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder:         "community-share/items",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    transformation: [
      { width: 800, height: 600, crop: "limit" }, // resize large images
      { quality: "auto" },                         // auto compress
      { fetch_format: "auto" },                    // serve webp to browsers that support it
    ],
  },
});

// ── Avatar storage ────────────────────────────────────────────
const avatarStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder:          "community-share/avatars",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    transformation: [
      { width: 200, height: 200, crop: "fill", gravity: "face" }, // square crop, face-detect
      { quality: "auto" },
    ],
  },
});

// ── Multer upload instances ───────────────────────────────────
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

export const uploadItemImages = multer({
  storage: itemStorage,
  limits:  { fileSize: MAX_SIZE },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith("image/")) return cb(null, true);
    cb(new Error("Only image files are allowed"));
  },
}).array("images", 4); // max 4 images per item

export const uploadAvatar = multer({
  storage: avatarStorage,
  limits:  { fileSize: MAX_SIZE },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith("image/")) return cb(null, true);
    cb(new Error("Only image files are allowed"));
  },
}).single("avatar");

// ── Delete image from Cloudinary ──────────────────────────────
export const deleteImage = async (imageUrl) => {
  try {
    // extract public_id from URL
    // e.g. https://res.cloudinary.com/demo/image/upload/v123/community-share/items/abc.jpg
    const parts   = imageUrl.split("/");
    const file    = parts[parts.length - 1].split(".")[0];
    const folder  = parts[parts.length - 2];
    const publicId = `${folder}/${file}`;
    await cloudinary.uploader.destroy(publicId);
  } catch (err) {
    console.error("[Cloudinary] Failed to delete image:", err.message);
  }
};

export default cloudinary;