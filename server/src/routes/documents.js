const express = require('express');
const router = express.Router();
const documentController = require('../controllers/documentController');
// Auth middleware removed for public access
// const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

// @route   POST api/documents/upload
// @desc    Upload & Process Document
// @access  Private (Admin)
router.post('/upload', upload.single('file'), documentController.uploadDocument);

// @route   GET api/documents
// @desc    Get all documents (with optional state filter)
// @access  Private (Admin)
router.get('/', documentController.getDocuments);

// @route   DELETE api/documents/:id
// @desc    Delete document
// @access  Private (Admin)
router.delete('/:id', documentController.deleteDocument);

module.exports = router;
