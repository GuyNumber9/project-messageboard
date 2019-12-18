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
  res.send("Not yet implemented");
}

function getBoard(req, res) {
  res.send("Not yet implemented");
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
