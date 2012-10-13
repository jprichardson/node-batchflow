//A lot of duplicated code in here. It needs to be refactored.


function BatchFlow(collection) {
  this.collection = collection;
  this.isSequential = true;
  this.results = [];
  this.doneCallback = null;
  this.eachCallback = null;
  this.errorCallback = function(err){ throw err; };
  this.pending = 0;
  this.isArray = collection instanceof Array;
  this.keys = []; //only if this.isArray === false
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
  var self = this;
  this.keys = Object.keys(this.collection);
  this.pending = this.keys.length;

  if (self.keys.length === 0) 
    return endCallback([]);

  function handleClientResult(err,result) {
    self.pending -= 1;
    if (err instanceof Error) {
      self.errorCallback(err);
    } else
      result = err; //not an error, but the result

    if (result)
      self.results.push(result);
  }

  function fireNext(idx, callback) {
    var key = self.isArray ? parseInt(self.keys[idx], 10) : self.keys[idx];
    self.eachCallback(key, self.collection[self.keys[idx]], callback);
  }

  if (this.isSequential) {
    this.doneCallback = function(err, result) {
      handleClientResult(err, result)
      var idx = self.keys.length - self.pending;
      if (idx < self.keys.length) {
        fireNext(idx, self.doneCallback)
      } else {
        endCallback(self.results);
      }
    }

    fireNext(0, self.doneCallback)
  
  } else { //parallel
    this.doneCallback = function(err, result) {
      handleClientResult(err, result)
      if (self.pending === 0) {
        endCallback(self.results);
      }
    }

    for (var i = 0; i < this.keys.length; ++i) {
      fireNext(i, this.doneCallback)
    }
  }

  return this;
};

BatchFlow.prototype.parallel = function() {
  this.isSequential = false;
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




