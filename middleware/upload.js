// In your upload middleware (middleware/upload.js)
const storage = multer.diskStorage({
  destination: 'uploads/', // No leading slash
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
});