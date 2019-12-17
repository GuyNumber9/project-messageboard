const mongoose      = require('mongoose');
const ReplySchema   = require('./Reply').schema;

let ThreadSchema = new mongoose.Schema({
    text: String,
    delete_password: String,
    created_on: Date,
    bumped_on: Date,
    reported: Boolean,
    replies: [ReplySchema]
});

let Thread = mongoose.model('Threads', ThreadSchema);

module.exports = {
    schema: ThreadSchema,
    model: Thread
};