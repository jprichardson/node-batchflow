//A lot of duplicated code in here. It needs to be refactored.


function BatchFlow(collection) {
  this.collection = collection;
  this.isSequential = true;
  this.doneCallback = null;
  this.eachCallback = null;
  this.errorCallback = function(err){ throw err; };
  this.limit = 0;
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
    , pending = keys.length
    , isArray = this.collection instanceof Array
    , results = []


  if (keys.length === 0) 
    return endCallback([]);

  function handleClientResult(err,result) {
    pending -= 1;
    if (err instanceof Error) {
      self.errorCallback(err);
    } else
      result = err; //not an error, but the result

    if (result)
      results.push(result);
  }

  function fireNext(idx, callback) {
    var key = isArray ? parseInt(keys[idx], 10) : keys[idx];
    self.eachCallback(key, self.collection[keys[idx]], callback);
  }

  if (this.isSequential) {
    this.doneCallback = function(err, result) {
      handleClientResult(err, result)
      var idx = keys.length - pending;
      if (idx < keys.length) {
        fireNext(idx, self.doneCallback)
      } else {
        endCallback(results);
      }
    }

    fireNext(0, self.doneCallback)
  
  } else { //parallel
    this.doneCallback = function(err, result) {
      handleClientResult(err, result)
      if (pending === 0) {
        endCallback(results);
      }
    }

    for (var i = 0; i < keys.length; ++i) {
      fireNext(i, this.doneCallback)
    }
  }

  return this;
};

BatchFlow.prototype.parallel = function(limit) {
  this.isSequential = false;
  this.limit = limit || 0;
  return this;
}

BatchFlow.prototype.sequential = function() {
  this.isSequential = true;
  return this;
};

BatchFlow.prototype.seq = BatchFlow.prototype.sequential;
BatchFlow.prototype.series = BatchFlow.prototype.sequential;
BatchFlow.prototype.par = BatchFlow.prototype.parallel;

module.exports = function batch(collection) {
  return new BatchFlow(collection);
}




