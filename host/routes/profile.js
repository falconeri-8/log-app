const express = require('express');
const Profile = require('../models/Profile');
const auth = require('../middleware/authentication.js');
const { sort } = require('../middleware/collections.js');
const router = express.Router();

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

router.get('/', async (req, res) => {
    try {
        const page = req.query.page || 1;
            const limit = req.query.limit || 10;
        const search = req.query.search || '';

        const filter = search ? {
            $or : [
                {name: {$regex: search, $options: 'i'}},
                {contact: {$regex: search, $options: 'i'}},
            ]
        } : {};
        // Use this for searching for one at a time,
        // or preload 100 IndexedDB entries and sort through that for multiple entries (no need for api call after each search)
        // const results = await Profile.findOne({
        //     $or: [
        //         {name: {$regex: search, $options: 'i'}},
        //         {contact: {$regex: search, $options: 'i'}},
        //     ]
        // })
        const results = await sort(Profile, page, limit, filter);

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