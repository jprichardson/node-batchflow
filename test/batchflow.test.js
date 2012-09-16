var assert = require('assert')
  , testutil = require('testutil')
  , batch = require('../lib/batchflow')
  , fs = require('fs');

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
            it('should execute async sequentially', function(done) {
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

            it('should execute sync sequentially', function(done) {
                var t = [1,2,3];
                batch(t)
                  .sequential()
                  .each(function(i, token, done) {
                    done(token*2);
                  })
                .end(function(results){
                    assert(results[0] === 2);
                    assert(results[1] === 4);
                    assert(results[2] === 6);
                    done();
                });

            })

            it('should not execute if its empty', function(done) {
                batch([]).sequential().each(function(){
                    T(false)
                }).end(function(results){
                    done();
                })
            })

            it('should have an empty results array when nothing is passed to next', function(done) {
                batch(['hello']).sequential().each(function(i, item, next) {
                    next();
                }).end(function(results) {
                    T (results.length === 0)
                    done();
                });
            })
            
        })

        describe('parallel', function() {
            it('should execute async in parallel', function(done) {
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
            })

            it('should execute sync in parallel', function(done) {
                var t = [1,2,3];//{'a': 1, 'b': 2, 'c': 3};
                batch(t)
                  .parallel()
                  .each(function(i, token, done) {
                    done(token*2);
                  })
                .end(function(results){
                    assert(results[0] === 2);
                    assert(results[1] === 4);
                    assert(results[2] === 6);
                    done();
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
                batch(['hello']).parallel().each(function(i, item, next) {
                    next();
                }).end(function(results) {
                    T (results.length === 0)
                    done();
                });
            })

        })
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
            it('should execute async sequentially', function(done) {
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
            
            })


            it('should execute sync sequentially', function(done) {
                var t = {'a': 1, 'b': 2, 'c': 3};
                batch(t)
                  .sequential()
                  .each(function(i, token, done) {
                    done(token*2);
                  })
                .end(function(results){
                    assert(results[0] === 2);
                    assert(results[1] === 4);
                    assert(results[2] === 6);
                    done();
                });

            })

            it('should not execute if its empty', function(done) {
                batch({}).sequential().each(function(){
                    T (false)
                }).end(function(results){
                    done()
                })
            })

            it('should have an empty results array when nothing is passed to next', function(done) {
                batch({'a': 'hello'}).sequential().each(function(i, item, next) {
                    next();
                }).end(function(results) {
                    T (results.length === 0)
                    done();
                });
            })
            
        });

        describe('parallel', function() {
            it('should execute async in parallel', function(done) {
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
            })

            it('should execute sync in parallel', function(done) {
                var t = {'a': 1, 'b': 2, 'c': 3};
                batch(t)
                  .parallel()
                  .each(function(i, token, done) {
                    done(token*2);
                  })
                .end(function(results){
                    assert(results[0] === 2);
                    assert(results[1] === 4);
                    assert(results[2] === 6);
                    done();
                });

            })


            it('should not execute if its empty', function(done) {
                batch({}).parallel().each(function(){
                    T (false)
                }).end(function(results){
                    done()
                })
            })

            it('should have an empty results array when nothing is passed to next', function(done) {
                batch({'a': 'hello'}).parallel().each(function(i, item, next) {
                    next();
                }).end(function(results) {
                    T (results.length === 0)
                    done();
                });
            })
        });

    });


    describe('error handling', function() {
        it('should call the series-array error handler', function(done) {
             var a = ['/tmp/file_DOES_NOT_exist_hopefully' + Math.random()];
            batch(a).series().each(function(i, item, done) {
                fs.readFile(item, done);
            }).error(function(err) {
                assert(err);
                done();
            }).end(function() {
                assert(false); //<--- shouldn't get here
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
                assert(false); //<--- shouldn't get here
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
                assert(false); //<--- shouldn't get here
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
                assert(false); //<--- shouldn't get here
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
                assert(false); //<--- shouldn't get here
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
                assert(false); //<--- shouldn't get here
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
                assert(false); //<--- shouldn't get here
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
                assert(false); //<--- shouldn't get here
            });
        });
    });


});


