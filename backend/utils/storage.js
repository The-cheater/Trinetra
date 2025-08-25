const fs = require('fs');
const path = require('path');
const multer = require('multer');

// Set up storage engine for multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

// Initialize upload variable
const upload = multer({ storage: storage });

// Utility function to handle file uploads
const uploadFile = (req, res) => {
  upload.single('file')(req, res, (err) => {
    if (err) {
      return res.status(500).json({ message: 'File upload failed', error: err });
    }
    res.status(200).json({ message: 'File uploaded successfully', file: req.file });
  });
};

// Utility function to retrieve files
const getFile = (req, res) => {
  const filePath = path.join(__dirname, '../uploads', req.params.filename);
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      return res.status(404).json({ message: 'File not found' });
    }
    res.sendFile(filePath);
  });
};

module.exports = {
  uploadFile,
  getFile
};