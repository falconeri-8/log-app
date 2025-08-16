const mongoose = require('mongoose');

const authorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    key: {
        type: String,
        required: true,
        unique: true
    },
    dateofcreation: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Author', authorSchema);