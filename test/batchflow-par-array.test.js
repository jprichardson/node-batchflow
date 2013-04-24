var testutil = require('testutil')
  , fs = require('fs')
  , batch = require('../lib/batchflow')

describe('batchflow', function() {
  describe('arrays', function() {
    var a = [ 
      function(done) {  setTimeout(function() { done(1) }, 1) }, //1 ms
      function(done) {  setTimeout(function() { done(2) }, 20) }, //20 ms
      function(done) {  setTimeout(function() { done(3) }, 5) } //2 ms
    ];


    describe('parallel', function() {
      it('should execute async in parallel', function(done) {
        var indexes = [];

        batch(a).parallel()
        .each(function(i, item, next) {
          indexes.push(i);
          item(next);
        }).end(function(results) {
          console.dir(results)
          T (results[0] === 1)
          T (results[1] === 3)
          T (results[2] === 2)

          for (var i = 0; i < indexes.length; ++i) {
            T (indexes[i] === i);
          }
                      
          T (indexes.length === 3)

          done()
        });
      })

      it('should execute sync in parallel', function(done) {
        var t = [1,2,3];
        batch(t).parallel()
        .each(function(i, token, next) {
          next(token*2);
        })
        .end(function(results){
          T (results[0] === 2)
          T (results[1] === 4)
          T (results[2] === 6)
          done()
        });
      })

      it('should not execute if its empty', function(done) {
        batch([]).parallel().each(function(){
          T (false)
        }).end(function(results){
          done()
        })
      })

      it('should have an empty results array when nothing is passed to next', function(done) {
        batch(['hello']).parallel()
        .each(function(i, item, next) {
          next()
        }).end(function(results) {
          T (results.length === 0)
          done();
        });
      })
    })
  })
})



