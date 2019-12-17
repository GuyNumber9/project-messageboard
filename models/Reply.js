const mongoose = require('mongoose');

let ReplySchema = new mongoose.Schema({
    text: String,
    delete_password: String,
    thread_id: mongoose.Schema.Types.ObjectId,
    reported: Boolean,
    created_on: Date
});

let Reply = mongoose.model('Replies', ReplySchema);

module.exports = {
    schema: ReplySchema,
    model: Reply
};