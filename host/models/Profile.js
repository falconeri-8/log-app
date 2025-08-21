const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        index: true
    },
    contact: {
        type: String,
        required: true,
        index: true
    },
    description: {
        type: String,
        required: true
    },
    dateofcreation: {
        type: Date,
        default: Date.now
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Author',
        required: true
    },
});

module.exports = mongoose.model('Profile', profileSchema);