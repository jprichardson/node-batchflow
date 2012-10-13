var testutil = require('testutil')
  , fs = require('fs')
  , batch = require('../lib/batchflow')

describe('batchflow', function() {
  describe('parallel limits', function() {
    var a = [ 
      function(done) { setTimeout(function() { done(1) }, 15) }, 
      function(done) { setTimeout(function() { done(2) }, 30) }, 
      function(done) { setTimeout(function() { done(3) }, 5) }, 
      function(done) { setTimeout(function() { done(4) }, 12) }
    ];


    describe('when no limit is set', function() {
      it('should execute async in parallel', function(done) {
        var indexes = [];

        batch(a).parallel()
        .each(function(i, item, next) {
          indexes.push(i);
          item(next);
        }).end(function(results) {
          T (results[0] === 3)
          T (results[1] === 4)
          T (results[2] === 1)
          T (results[3] === 2)

          for (var i = 0; i < indexes.length; ++i) {
            T (indexes[i] === i);
          }
                      
          T (indexes.length === 4)

          done()
        });

      })
    })

    describe('when a limit is set', function() {
      it('should only execute the number specified by the limit async in parallel', function(done) {
        var indexes = [];

        batch(a).parallel(2)
        .each(function(i, item, next) {
          indexes.push(i);
          item(next);
        }).end(function(results) {
          //console.log(results)
          //exit()
          T (results[0] === 1)
          T (results[1] === 3)
          T (results[2] === 2)
          T (results[3] === 4)

          for (var i = 0; i < indexes.length; ++i) {
            T (indexes[i] === i);
          }
                      
          T (indexes.length === 4)

          done()
        });

      })
    })
  })
})
