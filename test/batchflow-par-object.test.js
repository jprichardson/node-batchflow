var testutil = require('testutil')
  , fs = require('fs')
  , batch = require('../lib/batchflow')

describe('batchflow', function() {
  describe('objects', function() {
    var o = {
      'a': function(done) { setTimeout(function() { done(1) }, 1) }, //1 ms 
      'b': function(done) { setTimeout(function() { done(2) }, 20) }, //20 ms
      'c': function(done) { setTimeout(function() { done(3) }, 5) }  //3 ms
    };

    describe('parallel', function() {
      it('should execute async in parallel', function(done) {
        var keys = [];

        batch(o).parallel()
        .each(function(key, val, next) {
          keys.push(key);
          val(next);
        }).end(function(results) {
          T (results[0] === 1)
          T (results[1] === 3)
          T (results[2] === 2)

          T (keys[0] === 'a')
          T (keys[1] === 'b')
          T (keys[2] === 'c')

          T (results.length === 3)
          T (keys.length === 3)

          done();
        })

      })

      it('should execute sync in parallel', function(done) {
        var t = {'a': 1, 'b': 2, 'c': 3};
          
        batch(t).parallel()
        .each(function(i, token, next) {
          next(token*2)
        })
        .end(function(results){
          T (results[0] === 2)
          T (results[1] === 4)
          T (results[2] === 6)
          done()
        })
      })

      it('should not execute if its empty', function(done) {
        batch({}).parallel()
        .each(function(){
          T (false)
        }).end(function(results){
          done()
        })
      })

      it('should have an empty results array when nothing is passed to next', function(done) {
        batch({'a': 'hello'}).parallel()
        .each(function(i, item, next) {
          next();
        }).end(function(results) {
          T (results.length === 0)
          done();
        })
      })
    })
  })
})

