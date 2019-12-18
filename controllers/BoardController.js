const BoardModel    = require('../models/Board').model;
const ThreadModel   = require('../models/Thread').model;
const ReplyModel    = require('../models/Reply').model

function postThread(req, res){
    res.send('Not yet implemented');
}

function postReply(req, res){
    res.send('Not yet implemented');
}

function getBoard(req, res){
    res.send('Not yet implemented');
}

function getThread(req, res){
    res.send('Not yet implemented');
}

function deleteThread(req, res){
    res.send('Not yet implemented');
}

function deleteReply(req, res){
    res.send('Not yet implemented');
}

function reportThread(req, res){
    res.send('Not yet implemented');
}

function reportReply(req, res){
    res.send('Not yet implemented');
}

module.exports = {
    postThread,
    postReply,
    getBoard,
    getThread,
    deleteThread,
    deleteReply,
    reportThread,
    reportReply
};