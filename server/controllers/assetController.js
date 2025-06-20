const Asset = require('../models/Asset');
const User = require('../models/User');

// Create a new asset
exports.createAsset = async (req, res) => {
    const { title, image, creditsUsed } = req.body;

    try {
        const newAsset = new Asset({ title, image, creditsUsed });
        await newAsset.save();
        res.status(201).json(newAsset);
    } catch (error) {
        res.status(500).json({ message: 'Error creating asset', error });
    }
};

// Get all assets
exports.getAssets = async (req, res) => {
    try {
        const assets = await Asset.find();
        res.status(200).json(assets);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching assets', error });
    }
};

// Get a single asset by ID
exports.getAssetById = async (req, res) => {
    const { id } = req.params;

    try {
        const asset = await Asset.findById(id);
        if (!asset) {
            return res.status(404).json({ message: 'Asset not found' });
        }
        res.status(200).json(asset);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching asset', error });
    }
};

// Update an asset
exports.updateAsset = async (req, res) => {
    const { id } = req.params;
    const { title, image, creditsUsed } = req.body;

    try {
        const updatedAsset = await Asset.findByIdAndUpdate(id, { title, image, creditsUsed }, { new: true });
        if (!updatedAsset) {
            return res.status(404).json({ message: 'Asset not found' });
        }
        res.status(200).json(updatedAsset);
    } catch (error) {
        res.status(500).json({ message: 'Error updating asset', error });
    }
};

// Delete an asset
exports.deleteAsset = async (req, res) => {
    const { id } = req.params;

    try {
        const deletedAsset = await Asset.findByIdAndDelete(id);
        if (!deletedAsset) {
            return res.status(404).json({ message: 'Asset not found' });
        }
        res.status(200).json({ message: 'Asset deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting asset', error });
    }
};