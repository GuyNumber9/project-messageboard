const Board = require("../models/Board").model;
const Thread = require("../models/Thread").model;
const ReplyModel = require("../models/Reply").model;

function postThread(req, res) {
  let created = new Date();

  Board.findOneAndUpdate(
    {
      name: req.params.board
    },
    {
      $push: {
        threads: {
          text: req.body.text,
          delete_password: req.body.delete_password,
          created_on: created,
          bumped_on: created,
          reported: false
        }
      }
    },
    {
      upsert: true,
      new: true,
      useFindAndModify: false
    },
    function postThreadCallback(err, doc) {
      if (err) {
        res.send(err);
      } else {
        res.redirect(`/b/${doc.name}/`);
      }
    }
  );
}

function postReply(req, res) {
  Board.findOneAndUpdate(
    {
      name: req.params.board,
      "threads._id": req.body.thread_id
    },
    {
      $push: {
        "threads.$.replies": {
          text: req.body.text,
          delete_password: req.body.delete_password,
          reported: false,
          created_on: new Date()
        }
      }
    },
    {
      useFindAndModify: false
    },
    function postReplyCallback(err, doc) {
      if (err) {
        res.send(err);
      } else {
        res.redirect(`/b/${req.params.board}/${req.body.thread_id}`);
      }
    }
  );
}

function getBoard(req, res) {
  Board.aggregate([
    {
      '$match': {
        'name': 'general'
      }
    }, {
      '$unwind': {
        'path': '$threads'
      }
    }, {
      '$unwind': {
        'path': '$threads.replies'
      }
    }, {
      '$match': {
        'threads.reported': false, 
        'threads.replies.reported': false
      }
    }, {
      '$sort': {
        'threads.bumped_on': 1, 
        'threads.replies.created_on': 1
      }
    }, {
      '$group': {
        '_id': '$threads._id', 
        'text': {
          '$first': '$threads.text'
        }, 
        'created_on': {
          '$first': '$threads.created_on'
        }, 
        'bumped_on': {
          '$first': '$threads.bumped_on'
        }, 
        'replies': {
          '$push': {
            'text': '$threads.replies.text', 
            '_id': '$threads.replies._id', 
            'created_on': '$threads.replies.created_on'
          }
        }
      }
    }, {
      '$limit': 10
    }
  ], function boardsCallback(err, docs){
    if(err){
      res.send(err);
    }
    else {
      docs.map((doc) => {
        doc.replies.splice(3);
      });
      res.json(docs);
    }
  });
}

function getThread(req, res) {
  res.send("Not yet implemented");
}

function deleteThread(req, res) {
  res.send("Not yet implemented");
}

function deleteReply(req, res) {
  res.send("Not yet implemented");
}

function reportThread(req, res) {
  res.send("Not yet implemented");
}

function reportReply(req, res) {
  res.send("Not yet implemented");
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
