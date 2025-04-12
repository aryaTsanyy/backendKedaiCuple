/** @format */

import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
  destination(req, _file, cb) {
    // Determine destination based on product category
    const category = req.body.categoryType || "Makanan";
    const dest = path.join(__dirname, "../public/images", category);
    cb(null, dest);
  },
  filename(_req, file, cb) {
    // Create a unique filename
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + "-" + uniqueSuffix + ext);
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 3 * 1024 * 1024 }, // 5MB limit
  fileFilter: (_req, file, cb) => {
    // Accept only images
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
});
export default upload;
