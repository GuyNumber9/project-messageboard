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
  let d = new Date();
  Board.findOneAndUpdate(
    {
      name: req.params.board,
      "threads._id": req.body.thread_id
    },
    {
      $set: {
        "threads.$.bumped_on": d
      },
      $push: {
        "threads.$.replies": {
          text: req.body.text,
          delete_password: req.body.delete_password,
          reported: false,
          created_on: d
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
        '$match': {
          'name': req.params.board
        }
      }, {
        '$unwind': {
          'path': '$threads'
        }
      }, {
        '$sort': {
          'threads.bumped_on': -1
        }
      }, {
        '$limit': 10
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
    ],
    function boardsCallback(err, docs) {
      if (err) {
        res.send(err);
      } else {
        docs.sort((a, b) => Date.parse(b.bumped_on) - Date.parse(a.bumped_on));
        docs.map(doc => {
          doc.replies.sort((a, b) => Date.parse(b.created_on) - Date.parse(a.created_on));
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
  Board.updateOne({
    name: req.params.board
  }, {
    "$pull": {
      "threads":{
        "_id": new ObjectId(req.body.thread_id),
        "delete_password": req.body.delete_password
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

function deleteReply(req, res) {
  Board.updateOne({
    name: req.params.board,
    "threads._id": new ObjectId(req.body.thread_id),
  }, {
    "$pull": {
      "threads.$.replies":{
        "_id": new ObjectId(req.body.reply_id),
        "delete_password": req.body.delete_password
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
