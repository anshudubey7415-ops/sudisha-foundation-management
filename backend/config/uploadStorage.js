import fs from "fs";
import { randomUUID } from "crypto";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";

const backendDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
export const uploadsDir = path.resolve(
  process.env.UPLOADS_DIR || path.join(backendDirectory, "uploads")
);

fs.mkdirSync(uploadsDir, { recursive: true });

const imageExtensions = new Map([
  ["image/jpeg", ".jpg"],
  ["image/png", ".png"],
  ["image/webp", ".webp"],
  ["image/gif", ".gif"],
]);

const storage = multer.diskStorage({
  destination: uploadsDir,
  filename: (req, file, cb) => {
    cb(null, `${randomUUID()}${imageExtensions.get(file.mimetype)}`);
  },
});

export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!imageExtensions.has(file.mimetype)) {
      return cb(new Error("Only JPEG, PNG, WebP, and GIF images are allowed."));
    }
    cb(null, true);
  },
});