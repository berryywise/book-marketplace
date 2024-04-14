const multer = require('multer');
const path = require('path');

const saveDirectory = getSaveDirectory();

function getSaveDirectory() {
  const railwayVolumeMountPath = process.env.RAILWAY_VOLUME_MOUNT_PATH;
  return (railwayVolumeMountPath) ? railwayVolumeMountPath : path.join(__dirname, "..", "uploads");
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === 'pdfFile') {
      cb(null, saveDirectory);
    } else if (file.fieldname === 'thumbnailFile') {
      cb(null, saveDirectory);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});

const limits = { fileSize: 10 * 1024 * 1024 }; // 10 MB limit

const multerMiddleware = (req, res, next) => {
  const uploadInstance = multer({
    storage: storage,
    limits: limits,
  }).fields([
    { name: "pdfFile", maxCount: 1 },
    { name: "thumbnailFile", maxCount: 1 },
  ]);

  uploadInstance(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      // A Multer error occurred (e.g., file size exceeded)
      req.fileSizeLimitError = true;
      return res.status(400).send('File size exceeds the allowed limit, max 10 MB');
    } else if (err) {
      // An unknown error occurred
      console.error('Multer error:', err);
      return res.status(500).send('Internal Server Error');
    }

    if (!req.files["pdfFile"] || !req.files["thumbnailFile"]) {
      return res.status(400).send('Both PDF file and Thumbnail are required!');
    }
    
    // No errors, proceed to the next middleware
    next();
  });
};

module.exports = multerMiddleware;
