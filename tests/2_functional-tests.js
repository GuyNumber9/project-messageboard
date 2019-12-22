/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       (if additional are added, keep them at the very end!)
*/

var chaiHttp = require('chai-http');
var chai = require('chai');
var assert = chai.assert;
var {app, db} = require('../server');

chai.use(chaiHttp);

let delete_thread_id  = '';
let report_thread_id  = '';
let reply_thread_id   = ''; 
let delete_reply_id   = '';
let report_reply_id   = '';

suite('Functional Tests', function() {

  before(function beforeCallback(done){
    this.timeout(5000);
    db.once('open', function openCallback(){
      done();
    });
  });

  suite('API ROUTING FOR /api/threads/:board', function() {
    
    suite('POST', function() {
      test('create a new thread', function testCallback(done){
        let body = {
          text: "Test text",
          delete_password: "qwerty"
        }
        chai.request(app).post(`/api/threads/general`).send(body).end(function testRequestCallback(err, res){
          assert.equal(res.statusCode, 200);
          assert.equal(res.req.path, '/b/general/');
          done();
        });
      });
    });
    
    suite('GET', function() {
      test('get a board', function testCallback(done){
        chai.request(app).get(`/api/threads/general`).query({}).end(function testRequestCallback(err, res){
          let body = res.body;
          let thread = body[0];
          delete_thread_id  = body[0]._id;
          report_thread_id  = body[1]._id;
          reply_thread_id   = body[2]._id;
          assert.isArray(body);
          assert.property(thread, '_id');
          assert.property(thread, 'text');
          assert.property(thread, 'created_on');
          assert.property(thread, 'bumped_on');
          assert.property(thread, 'replies');
          assert.isArray(thread.replies);
          done();
        });
      });
    });
    
    suite('DELETE', function() {
      test('delete a board', function testCallback(done){
        this.timeout(3000);
        let body = {
          thread_id: delete_thread_id,
          delete_password: 'qwerty'
        };

        chai.request(app).delete(`/api/threads/general`).send(body).end(function testRequestCallback(err, res){
          assert.equal(res.text, 'success');
          done();
        });
      });
    });
    
    suite('PUT', function() {
      test('report a thread', function testCallback(done){
        let body = {
          thread_id: report_thread_id,
        }
        chai.request(app).put(`/api/threads/general`).send(body).end(function testRequestCallback(err, res){
          assert.equal(res.text, 'success');
          done();
        });
      });
    });
    

  });
  
  suite('API ROUTING FOR /api/replies/:board', function() {
    
    suite('POST', function() {
      test('reply to a thread', function testCallback(done){
        let body = {
          thread_id: reply_thread_id,
          text: 'Test reply',
          delete_password: 'qwerty'
        };

        chai.request(app).post(`/api/replies/general`).send(body).end(function testRequestCallback(err, res){
          assert.equal(res.statusCode, 200);
          assert.equal(res.req.path, `/b/general/${reply_thread_id}`);
          done();
        });
      });
    });
    
    suite('GET', function() {
      test('retrieve a thread', function testCallback(done){
        let query = {
          thread_id: reply_thread_id
        };

        chai.request(app).get(`/api/replies/general`).query(query).end(function testRequestCallback(err, res){
          let thread = res.body;
          assert.property(thread, '_id');
          assert.property(thread, 'text');
          assert.property(thread, 'created_on');
          assert.property(thread, 'bumped_on');
          assert.property(thread, 'replies');
          assert.isArray(thread.replies);
          done();
        });
      });
    });
    
    suite('PUT', function() {
      test('delete a reply', function testCallback(done){
        let body = {
          thread_id: reply_thread_id,
          text: 'Test reply',
          delete_password: 'qwerty'
        };

        chai.request(app).post(`/api/replies/general`).send(body).end(function testRequestCallback(err, resReply){
          let query = {
            thread_id: reply_thread_id
          };
  
          chai.request(app).get(`/api/replies/general`).query(query).end(function testRequestCallback(err, resThread){
            let body = {
              thread_id: reply_thread_id,
              reply_id: resThread.body.replies[0]._id,
            };
    
            chai.request(app).put(`/api/replies/general`).send(body).end(function testRequestCallback(err, res){
              assert.equal(res.text, 'success');
              done();
            });
          });
        });
      });
    });
    
    suite('DELETE', function() {
      test('delete a reply', function testCallback(done){
        let body = {
          thread_id: reply_thread_id,
          text: 'Test reply',
          delete_password: 'qwerty'
        };

        chai.request(app).post(`/api/replies/general`).send(body).end(function testRequestCallback(err, resReply){
          let query = {
            thread_id: reply_thread_id
          };
  
          chai.request(app).get(`/api/replies/general`).query(query).end(function testRequestCallback(err, resThread){
            let body = {
              thread_id: reply_thread_id,
              reply_id: resThread.body.replies[0]._id,
              delete_password: 'qwerty'
            };
    
            chai.request(app).delete(`/api/replies/general`).send(body).end(function testRequestCallback(err, res){
              assert.equal(res.text, 'success');
              done();
            });
          });
        });
      });
    });
  });
});
