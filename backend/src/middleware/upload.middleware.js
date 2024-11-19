//this is upload middleware

const multer = require('multer');
const path = require('path');

const upload = multer({
    storage: multer.diskStorage({
        destination: (req, file, cb) =>
            cb(null, path.join(__dirname, '../uploads/')), // Absolute path
        filename: (req, file, cb) =>
            cb(null, `${Date.now()}-${file.originalname}`)
    }),
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'));
        }
    }
});

// Multer middleware for specific fields
const serviceUpload = upload.fields([
    { name: 'serviceImages', maxCount: 5 } // Matches frontend
]);

module.exports = serviceUpload;
