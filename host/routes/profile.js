const express = require('express');
const Profile = require('../models/Profile');
const auth = require('../middleware/authentication.js');
const { sort } = require('../middleware/collections.js');
const router = express.Router();

const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }
});

router.post("/", auth, upload.single('image'),  async (req, res) => {
    try {
        const { name, contact, description } = req.body

        const profileExists = await Profile.findOne({name})

        if (profileExists) {

            const updateData = {name, contact, description};

            if (req.file) {
                updateData.image = {
                    data: req.file.buffer,
                    contentType: req.file.mimetype
                };
            }

            const updatedProfile = await Profile.findByIdAndUpdate(
                profileExists.id,
                updateData,
                {new: true}
            )

            return res.status(200).json({
                success: true,
                message: "Existing profile updated",
                updatedProfile
            })
        }

        const profileData = {
            name,
            contact,
            description,
            author: req.author.id
        };

        if (req.file) {
            profileData.image = {
                data: req.file.buffer,
                contentType: req.file.mimetype
            };
        }

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

        const profilesWithImages = results.profiles.map(profile => {
            const profileObj = profile.toObject();
            if (profileObj.image && profileObj.image.data) {
                profileObj.image = {
                    data: `data:${profileObj.image.contentType};base64,${profileObj.image.data.toString('base64')}`,
                    contentType: profileObj.image.contentType
                };
            }
            return profileObj;
        });

        res.status(200).json({
            success: true,
            profiles: profilesWithImages,
            sorting: results.sorting,
            // ...results,
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
})

module.exports = router;