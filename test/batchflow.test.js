var assert = require('assert')
  , testutil = require('testutil')
  , batch = require('../lib/batchflow')
  , fs = require('fs');

describe('batchflow', function() {


    describe('error handling', function() {
        it('should call the series-array error handler', function(done) {
             var a = ['/tmp/file_DOES_NOT_exist_hopefully' + Math.random()];
            batch(a).series().each(function(i, item, done) {
                fs.readFile(item, done);
            }).error(function(err) {
                assert(err);
                done();
            }).end(function() {
                //assert(false); //<--- shouldn't get here
            });
        });

        it('should call the parallel-array error handler', function(done) {
             var a = ['/tmp/file_DOES_NOT_exist_hopefully' + Math.random()];
            batch(a).parallel().each(function(i, item, done) {
                fs.readFile(item, done);
            }).error(function(err) {
                assert(err);
                done();
            }).end(function() {
                //assert(false); //<--- shouldn't get here
            });
        });

        it('should call the series-obj error handler', function(done) {
            var a = {'f': '/tmp/file_DOES_NOT_exist_hopefully' + Math.random()};
            batch(a).series().each(function(i, item, done) {
                fs.readFile(item, done);
            }).error(function(err) {
                assert(err);
                done();
            }).end(function() {
                //assert(false); //<--- shouldn't get here
            });
        });

        it('should call the parallel-obj error handler', function(done) {
            var a = {'f': '/tmp/file_DOES_NOT_exist_hopefully' + Math.random()};
            batch(a).parallel().each(function(i, item, done) {
                fs.readFile(item, done);
            }).error(function(err) {
                assert(err);
                done();
            }).end(function() {
                //assert(false); //<--- shouldn't get here
            });
        });

        it('should throw the series-array error handler', function(done) {
             var a = ['/tmp/file_DOES_NOT_exist_hopefully' + Math.random()];
            batch(a).series().each(function(i, item, done) {
                throw new Error('err');
            }).error(function(err) {
                assert(err);
                done();
            }).end(function() {
                //assert(false); //<--- shouldn't get here
            });
        });

        it('should throw the parallel-array error handler', function(done) {
             var a = ['/tmp/file_DOES_NOT_exist_hopefully' + Math.random()];
            batch(a).parallel().each(function(i, item, done) {
                throw new Error('err');
            }).error(function(err) {
                assert(err);
                done();
            }).end(function() {
                //assert(false); //<--- shouldn't get here
            });
        });

        it('should throw the series-obj error handler', function(done) {
            var a = {'f': '/tmp/file_DOES_NOT_exist_hopefully' + Math.random()};
            batch(a).series().each(function(i, item, done) {
                throw new Error('err');
            }).error(function(err) {
                assert(err);
                done();
            }).end(function() {
                //assert(false); //<--- shouldn't get here
            });
        });

        it('should throw the parallel-obj error handler', function(done) {
            var a = {'f': '/tmp/file_DOES_NOT_exist_hopefully' + Math.random()};
            batch(a).parallel().each(function(i, item, done) {
                throw new Error('err');
            }).error(function(err) {
                assert(err);
                done();
            }).end(function() {
                //assert(false); //<--- shouldn't get here
            });
        });
    });


});


