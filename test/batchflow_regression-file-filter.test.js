var testutil = require('testutil')
  , fs = require('fs')
  , batch = require('../lib/batchflow')
  , path = require('path')

describe('batchflow', function() {
  describe('regression', function() {
    describe('> when filtering a directory', function() {
      it('should return the file', function(done) {
        var files = [ '/Users/jprichardson/Dropbox/Projects/Personal/js/node_modules/fnoc/test/node_modules/faux-module/config',
  '/Users/jprichardson/Dropbox/Projects/Personal/js/node_modules/fnoc/test/node_modules/faux-module/index.js',
  '/Users/jprichardson/Dropbox/Projects/Personal/js/node_modules/fnoc/test/node_modules/faux-module/package.json' ]
        
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
          EQ (results.length, 1)
          EQ (results[0], files[2])
          done()
        })
      })
    })
  })
})