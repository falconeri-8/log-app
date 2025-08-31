const express = require('express');
const Profile = require('../models/Profile');
const auth = require('../middleware/authentication.js');
const { sort } = require('../middleware/collections.js');
const router = express.Router();

const multer = require("multer");
const upload = multer({
    storage: multer.memoryStorage(), // Important: use memory storage
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Not an image file'), false);
        }
    }
});

router.post("/", auth, upload.single("image"), async (req, res) => {
    try {
        const { name, contact, description } = req.body

        const profileExists = await Profile.findOne({name})

        if (profileExists) {
            const updatedProfile = await Profile.findByIdAndUpdate(
                profileExists.id,
                {name, contact, description},
                {new: true}
            )

            return res.status(200).json({
                success: true,
                message: "Existing profile updated",
                updatedProfile
            })
        }

        const profile = new Profile({
            name,
            contact,
            description,
            image: {
                data: req.file.buffer,
                contentType: req.file.mimetype,
            },
            author: req.author.id,
        })

        await profile.save()
        // await profile.populate("author", "name key contact")
        res.status(201).json({
            success: true,
            message: "Profile created",
            profile,
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || "Server error"
        })
    }
})

router.post('/filtered', auth, async (req, res) => {
    try {
        const { page = 1, limit = 10, search = ''} = req.body;

        const filter = search ? {
            $or : [
                {name: {$regex: search, $options: 'i'}},
                {contact: {$regex: search, $options: 'i'}},
            ]
        } : {};

        const results = await sort(Profile, page, limit, filter);

        if (results.profiles) {
            results.profiles = results.profiles.map(profile => {
                if (profile.image && profile.image.data) {
                    const base64Image = profile.image.data.toString('base64');
                    profile.imageUrl = `data:${profile.image.contentType};base64,${base64Image}`;
                }
                // Remove the raw buffer data to reduce payload size
                delete profile.image;
                return profile;
            });
        }

        res.status(200).json({
            success: true,
            ...results,
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
})

module.exports = router;