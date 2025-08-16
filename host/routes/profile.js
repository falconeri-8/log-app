const express = require('express');
const Profile = require('../models/Profile');
const auth = require('../middleware/authentication.js');
const router = express.Router();

// Create profile
router.post("/", auth, async (req, res) => {
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
            message: "Server error"
        })
    }
})

// Update profile
router.put("/:id", auth, async (req, res) => {
    try {
        const profile = await Profile.findById(req.params.id)
        if (!profile) {
            return res.status(404).json({
                success: false,
                message: "Profile not found"
            })
        }

        // Check ownership
        if (profile.author.toString() !== req.author.id) {
            return res.status(403).json({
                success: false,
                message: "Not authorized"
            })
        }

        const { name, contact, description } = req.body
        const updatedProfile = await Profile.findByIdAndUpdate(
            req.params.id,
            { name, contact, description },
            { new: true },
        )
            // .populate("author", "name key email")

        res.json(updatedProfile)
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Server error"
        })
    }
})

router.get("/name/:name", async (req, res) => {
    try {
        const profile = await Profile.findOne({name: req.params.name})
        if (!profile) {
            return res.status(404).json({
                success: false,
                message: "Profile not found"
            })
        }
        res.json({
            success: true,
            profile
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Server error"
        })
    }
})

router.get("/contact/:contact", async (req, res) => {
    try {
        const profile = await Profile.findOne({contact: req.params.contact})
        if (!profile) {
            return res.status(404).json({
                success: false,
                message: "Profile not found"
            })
        }
        res.json({
            success: true,
            profile
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Server error"
        })
    }
})


module.exports = router;