/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

var Router      = require('express').Router;
var boardController  = require('../controllers/BoardController');
var expect      = require('chai').expect;

var boardRouter = Router();

boardRouter.post('/api/threads/:board', boardController.postThread);
boardRouter.post('/api/replies/:board', boardController.postReply);
boardRouter.delete('/api/threads/:board', boardController.deleteThread);
boardRouter.delete('/api/replies/:board', boardController.deleteReply);
boardRouter.put('/api/threads/:board', boardController.reportThread);
boardRouter.put('/api/replies/:board', boardController.reportReply);
boardRouter.get('/api/threads/:board', boardController.getBoard);
boardRouter.get('/api/replies/:board', boardController.getThread);

module.exports = boardRouter;
