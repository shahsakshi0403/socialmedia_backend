const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    authId: {
        type: mongoose.Schema.Types.ObjectId, ref: 'User',
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
    likes: {
        type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
        required: true,
    },
    dislikes: {
        type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
        required: true,
    },
}, { timestamps: true });

module.exports = mongoose.model('Post', postSchema);
