const express = require("express")
const jwt = require("jsonwebtoken")
const Author = require("../models/Author.js")
const auth = require("../middleware/authentication.js")

const router = express.Router()

router.post("/register", async (req, res) => {
    try {
        const {name, key} = req.body

        const newAuthor = new Author({name, key})
        await newAuthor.save()
        const token = jwt.sign({author: {id: newAuthor._id}}, process.env.JWT_SECRET, {expiresIn: "7d"})

        res.status(201).json({
            success: true,
            token,
            author: newAuthor,
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Server error"
        })
    }
})

router.post("/login", async (req, res) => {
    try {
        const { key } = req.body

        // Find author and check key
        const author = await Author.findOne({ key })
        if (!author) {
            return res.status(404).json({
                success: false,
                message: 'Invalid key'
            });
        }
        // Create token
        const token = jwt.sign({ author: { id: author._id } }, process.env.JWT_SECRET, { expiresIn: "7d" })

        res.json({
            success: true,
            token,
            author,
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Server error"
        })
    }
})

router.get("/me", auth, async (req, res) => {
    try {
        const author = await Author.findById(req.author.id).select("-key")
        res.json(author)
    } catch (error) {
        res.status(500).json({ message: "Server error" })
    }
})

module.exports = router;