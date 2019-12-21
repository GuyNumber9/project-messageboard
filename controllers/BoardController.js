let ObjectId = require('mongoose').Types.ObjectId;

const Board = require("../models/Board").model;

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
  Board.aggregate(
    [
      {
        $match: {
          name: req.params.board
        }
      },
      {
        $unwind: {
          path: "$threads"
        }
      },
      {
        $unwind: {
          path: "$threads.replies"
        }
      },
      {
        $match: {
          "threads.reported": false,
          "threads.replies.reported": false
        }
      },
      {
        $sort: {
          "threads.bumped_on": 1,
          "threads.replies.created_on": 1
        }
      },
      {
        $group: {
          _id: "$threads._id",
          text: {
            $first: "$threads.text"
          },
          created_on: {
            $first: "$threads.created_on"
          },
          bumped_on: {
            $first: "$threads.bumped_on"
          },
          replies: {
            $push: {
              text: "$threads.replies.text",
              _id: "$threads.replies._id",
              created_on: "$threads.replies.created_on"
            }
          }
        }
      },
      {
        $limit: 10
      }
    ],
    function boardsCallback(err, docs) {
      if (err) {
        res.send(err);
      } else {
        docs.map(doc => {
          doc.replies.splice(3);
        });
        res.json(docs);
      }
    }
  );
}

function getThread(req, res) {
  Board.aggregate([
    {
      '$match': {
        'name': req.params.board, 
        'threads._id': new ObjectId(req.query.thread_id)
      }
    }, {
      '$unwind': {
        'path': '$threads'
      }
    }, {
      '$group': {
        '_id': '$threads._id', 
        'text': {
          '$first': '$threads.text'
        }, 
        'bumped_on': {
          '$first': '$threads.bumped_on'
        }, 
        'created_on': {
          '$first': '$threads.created_on'
        }, 
        'replies': {
          '$first': '$threads.replies'
        }
      }
    }
  ], function getThreadCallback(err, doc){
    if(err){
      res.send(err);
    }
    else {
      res.json(doc[0]);
    }
  });
}

function deleteThread(req, res) {
  Board.update({
    name: req.params.board
  }, {
    "$pull": {
      "_id": new ObjectId(req.body.thread_id),
      "delete_password": req.body.delete_password
    }
  }, function deleteThreadCallback(err, raw){
    if(err){
      res.send("incorrect password");
    }
    else {
      res.send("success");
    }
  });
}

function deleteReply(req, res) {
  Board.update({
    name: req.params.board
  }, {
    "$pull": {
      "threads":{
        "_id": new ObjectId(req.body.thread_id),
        "replies._id": new ObjectId(req.body.reply_id),
        "replies.delete_password": req.body.delete_password
    }
  }
  }, function deleteThreadCallback(err, raw){
    if(err){
      res.send("incorrect password");
    }
    else {
      res.send("success");
    }
  });
}

function reportThread(req, res) {
  Board.updateOne(
    {
        'name': req.params.board, 
        'threads._id': new ObjectId(req.body.thread_id)
    }, {
      '$set': {
        'threads.$.reported': true
      }
    }
  , function reportThreadCallback(err, doc){
    if(err){
      res.send(err);
    }
    else {
      res.send('success');
    }
  });
}

function reportReply(req, res) {
  Board.updateOne(
    {
        'name': req.params.board,
    }, {
      '$set': {
        'threads.$[threadElement].replies.$[replyElement].reported': true
      }
    },
    {
      arrayFilters: [
        {
          "threadElement._id": new ObjectId(req.body.thread_id)
        },
        {
          "replyElement._id": new ObjectId(req.body.reply_id)
        }
      ]
    }
  , function reportReplyCallback(err, doc){
    if(err){
      res.send(err);
    }
    else {
      res.send('success');
    }
  });
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
