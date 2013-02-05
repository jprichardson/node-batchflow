var testutil = require('testutil')
  , fs = require('fs')
  , batch = require('../lib/batchflow')

describe('batchflow', function() {
  describe('load testing', function() {
    it('should pass', function(done) {
      var a = []
      for (var i = 0; i < 10000; ++i)
        a[i] = i
      batch(a).seq()
      .each(function(i, val, next) {
        next() //<--- before 0.3.2 this would fail
      })
      .end(function() {
        done()
      })
    })
  })
})