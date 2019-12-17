const mongoose      = require('mongoose');
const ThreadSchema  = require('./Thread').schema;

let BoardSchema = new mongoose.Schema({
    name: String,
    threads: [ThreadSchema]
});

let Board = mongoose.model('Board', BoardSchema);

module.exports = {
    schema: BoardSchema,
    model: Board
};