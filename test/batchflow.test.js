var assert = require('assert')
  , batch = require('../lib/batchflow');

describe('batchflow', function() {

    describe('arrays', function() {
        var a = [
            function(done) {
                //console.log('A1')
                setTimeout(function() {
                    done(1);
                }, 1);
            },
            function(done) {
                //console.log('A2')
                setTimeout(function() {
                    done(2);
                }, 20);
            },
            function(done) {
                //console.log('A3')
                setTimeout(function() {
                    done(3);
                }, 2);
            }
        ];

        describe('sequential', function() {
            it('should execute sequentially', function(done) {
                var indexes = [];

                batch(a).sequential()
                .each(function(i, item, done) {
                    indexes.push(i);
                    item(done);
                }).end(function(results) {
                    /*for (var i = 0; i < results.length; ++i) {
                        console.log(results[i]);
                    }*/
                    
                    assert(results[0] === 1);
                    assert(results[1] === 2);
                    assert(results[2] === 3);

                    for (var i = 0; i < indexes.length; ++i) {
                        assert(indexes[i] === i);
                    }

                    assert(indexes.length === 3);

                    done();
                });
            
            });
            
        });

        describe('parallel', function() {
            it('should execute in parallel', function(done) {
                var indexes = [];

                batch(a).parallel()
                .each(function(i, item, done) {
                    indexes.push(i);
                    item(done);
                }).end(function(results) {
                    /*for (var i = 0; i < results.length; ++i) {
                        console.log(results[i]);
                    }*/

                    assert(results[0] === 1);
                    assert(results[1] === 3);
                    assert(results[2] === 2);

                    for (var i = 0; i < indexes.length; ++i) {
                        assert(indexes[i] === i);
                    }

                    assert(indexes.length === 3);

                    done();
                });
            });

        });
    });

    describe('objects', function() {
        var o = {
            'a': function(done) {
                //console.log('A1')
                setTimeout(function() {
                    done(1);
                }, 1);
            },
            'b': function(done) {
                //console.log('A2')
                setTimeout(function() {
                    done(2);
                }, 20);
            },
            'c': function(done) {
                //console.log('A3')
                setTimeout(function() {
                    done(3);
                }, 2);
            }
        };

        describe('sequential', function() {
            it('should execute sequentially', function(done) {
                var keys = [];

                batch(o).sequential()
                .each(function(key, val, done) {
                    keys.push(key);
                    val(done);
                }).end(function(results) {
                    /*for (var i = 0; i < results.length; ++i) {
                        console.log(results[i]);
                    }*/
                    
                    assert(results[0] === 1);
                    assert(results[1] === 2);
                    assert(results[2] === 3);

                    assert(keys[0] === 'a');
                    assert(keys[1] === 'b');
                    assert(keys[2] === 'c');

                    assert(results.length === 3);
                    assert(keys.length === 3);

                    done();
                });
            
            });
            
        });

        describe('parallel', function() {
            it('should execute in parallel', function(done) {
                var keys = [];

                batch(o).parallel()
                .each(function(key, val, done) {
                    keys.push(key);
                    val(done);
                }).end(function(results) {
                    //console.log
                    /*for (var i = 0; i < results.length; ++i) {
                        console.log(results[i]);
                    }*/

                    assert(results[0] === 1);
                    assert(results[1] === 3);
                    assert(results[2] === 2);

                    assert(keys[0] === 'a');
                    assert(keys[1] === 'b');
                    assert(keys[2] === 'c');

                    assert(results.length === 3);
                    assert(keys.length === 3);

                    done();
                });
            });

        });
    });


});


