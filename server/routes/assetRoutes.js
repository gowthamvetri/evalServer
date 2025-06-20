const express = require('express');
const { getAssets, createAsset, getAssetById, updateAsset, deleteAsset } = require('../controllers/assetController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Get all assets
router.get('/', getAssets);

// Create a new asset
router.post('/', authMiddleware, createAsset);

// Get an asset by ID
router.get('/:id', getAssetById);

// Update an asset
router.put('/:id', authMiddleware, updateAsset);

// Delete an asset
router.delete('/:id', authMiddleware, deleteAsset);

module.exports = router;