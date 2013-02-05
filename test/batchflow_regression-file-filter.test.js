var testutil = require('testutil')
  , fs = require('fs')
  , batch = require('../lib/batchflow')
  , path = require('path')
  , P = require('autoresolve')
  , S = require('string')

describe('batchflow', function() {
  describe('regression', function() {
    describe('> when filtering a directory', function() {
      it('should return the file', function(done) {
        var dir = P('test/resources/regr-file-filter')
        var files = fs.readdirSync(dir).map(function(file) { return path.join(dir, file) })

        batch(files).par().each(function(i, file, next) {
          if (path.extname(file) === '.json')
            fs.lstat(file, function (err, stats) {
              if (stats.isFile())
                next(file);
            })
          else
            next(); //is a directory or does not have .json extension
        })
        .error(done)
        .end(function(results){
          //console.dir(results)
          EQ (results.length, 1)
          T (S(results[0]).endsWith('package.json'))
          done()
        })
      })
    })
  })
})

