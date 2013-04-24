if (!global.setImmediate) { //pre Node v0.10
  global.setImmediate = process.nextTick
}

function noop() {};

function BatchFlow(collection) {
  this.collection = collection;
  this.keys = null;
  this.eachCallback = null;
  this.errorCallback = function(err){ throw err; };
  this.limit = 1; //default to sequential mode
  this.finished = 0; //for progress too
  this.total = 0;
}

BatchFlow.prototype.each = function(callback) {
  var self = this;
  this.eachCallback = function(){
    try {
      callback.apply(self, arguments);
    } catch (err) {
      this.errorCallback(err);
    }
  }
  return this;
}

BatchFlow.prototype.error = function(callback) {
  this.errorCallback = callback;
  return this;
}

BatchFlow.prototype.end = function(endCallback) {
  var self = this
    , running = 0
    , started = 0
    , isArray = this.collection instanceof Array
    , results = []

  this.keys = Object.keys(this.collection); //this allows outside modules to directly modify keys and collection.
  this.total = this.keys.length;
  endCallback = endCallback || noop;

  if (this.total === 0) 
    return endCallback([]);

  function handleClientResult(err,result) {
    self.finished += 1;
    if (err instanceof Error) {
      self.errorCallback(err);
    } else
      result = err; //not an error, but the result

    if (result)
      results.push(result);
  }

  function fireNext(idx, callback) {
    //after process.nextTick was added to doneCallback below in 0.3.2, this line might be able to be removed, tests pass with and without it
    //if (running + self.finished >= self.total) return //this is critical to fix a regression bug, fireNext may get fired more times than needed

    running += 1;
    started += 1;
    var key = isArray ? parseInt(self.keys[idx], 10) : self.keys[idx];
    self.eachCallback(key, self.collection[self.keys[idx]], callback);
  }

  function doneCallback(err, result) {
    setImmediate(function() {
      handleClientResult(err, result)
      running -= 1;

      if (self.finished < self.total) {
        if (started < self.total && running < self.limit) {
          fireNext(started, doneCallback)
        }
      } 
      else if (self.finished === self.total) {
        endCallback(results);
      }
    })
  }

  var max = self.limit > self.total ? self.total : self.limit;
  for (var i = 0; i < max; ++i) {
    //this is fired sequentially, but sometimes what's in the each callback is sync and fireNext is called again
    //in doneCallback before we even get to the next 'i' in this iteration thus causing fireNext to trigger more times than necessary
    fireNext(i, doneCallback) 
  }

  return this;
};

BatchFlow.prototype.parallel = function(limit) {
  this.limit = limit || Math.pow(2,53); //2^53 is the largest integer
  return this;
}

BatchFlow.prototype.sequential = function() {
  this.limit = 1;
  return this;
};

BatchFlow.prototype.seq = BatchFlow.prototype.sequential;
BatchFlow.prototype.series = BatchFlow.prototype.sequential;
BatchFlow.prototype.par = BatchFlow.prototype.parallel;

module.exports = function batch(collection) {
  return new BatchFlow(collection);
}




