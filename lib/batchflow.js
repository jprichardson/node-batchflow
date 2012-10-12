//A lot of duplicated code in here. It needs to be refactored.


function BatchFlow(collection) {
  this.collection = collection;
  this.isSequential = true;
  this.results = [];
  this.doneCallback = null;
  this.eachCallback = null;
  this.errorCallback = function(err){ throw err; };
  this.current = 0;
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
};

BatchFlow.prototype.error = function(callback) {
    this.errorCallback = callback;
    return this;
}

BatchFlow.prototype.end = function(endCallback) {
    var self = this;
    setup.apply(this);

        if (self.keys.length === 0) {
            endCallback(self.results);
            return;
        }

        if (this.isSequential) {
            this.doneCallback = function(err, result) {
                if (err instanceof Error) {
                    self.errorCallback(err);
                    return;
                } 
                else { //not an error
                    result = err;
                }

                if (result) {
                    self.results.push(result);
                }


                self.current += 1;
                if (self.current < self.keys.length) {
                    var keyp = self.keys[self.current];
                    if (self.isArray) keyp = parseInt(keyp, 10);
                    self.eachCallback(keyp, self.collection[self.keys[self.current]], self.doneCallback);
                } else {
                    endCallback(self.results);
                }
            }

            var key = self.keys[0]
            if (self.isArray)
              key = parseInt(self.keys[0],10)
            self.eachCallback(key, self.collection[self.keys[0]], self.doneCallback);
        } else {
            this.doneCallback = function(err, result) {
                if (err instanceof Error) {
                    self.errorCallback(err);
                    return;
                } 
                else { //not an error
                    result = err;
                }

                if (result) {
                    self.results.push(result);
                }

                self.pending -= 1;

                if (self.pending === 0) {
                    endCallback(self.results);
                }
            }

            for (var i = 0; i < this.keys.length; ++i) {
                var key = this.keys[i]; 
                if (self.isArray) key = parseInt(key, 10)
                self.eachCallback(key, self.collection[self.keys[i]], self.doneCallback);
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

//PRIVATE METHODS

function setup() {
  this.keys = Object.keys(this.collection);
  this.pending = this.keys.length;
}


