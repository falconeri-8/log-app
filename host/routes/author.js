const express = require('express');
const Author = require('../models/Author');
const Profile = require('../models/Profile');
const router = express.Router();

router.get('/:id/profiles', async (req, res) => {
    const { id } = req.params;

    try {
        const profiles = await Profile.find({ author: id }).populate('author', 'name');
        res.status(200).json({
            success: true,
            profiles
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});


module.exports = router;