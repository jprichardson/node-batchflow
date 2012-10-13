
function noop() {};

function BatchFlow(collection) {
  this.collection = collection;
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
    , keys = Object.keys(this.collection)
    , running = 0
    , started = 0
    , isArray = this.collection instanceof Array
    , results = []

  this.total = keys.length;
  endCallback = endCallback || noop;

  if (keys.length === 0) 
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
    running += 1;
    started += 1
    var key = isArray ? parseInt(keys[idx], 10) : keys[idx];
    self.eachCallback(key, self.collection[keys[idx]], callback);
  }

  function doneCallback(err, result) {
    handleClientResult(err, result)
    running -= 1;

    if (self.finished < keys.length) {
      if (started < keys.length && running < self.limit) {
        fireNext(started, doneCallback)
      }
    } else if (self.finished === keys.length) {
      endCallback(results);
    }
  }

  var max = self.limit > keys.length ? keys.length : self.limit;
  for (var i = 0; i < max; ++i) {
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




