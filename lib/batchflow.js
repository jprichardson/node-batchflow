//A lot of duplicated code in here. It needs to be refactored.


function BatchFlow(collection) {
    this.collection = collection;
    this.isSequential = true;
    this.results = [];
    this.doneCallback = null;
    this.eachCallback = null;
    this.errorCallback = function(){};
    this.current = 0;
    this.pending = 0;
    this.isArray = collection instanceof Array;
    this.keys = []; //only if this.isArray === false

    if (!this.isArray) {
        for (var key in collection) {
            if (collection.hasOwnProperty(key)) {
                this.keys.push(key);
                this.pending += 1;
            }
        }
    } else {
        this.pending = this.collection.length;
    }

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

    if (this.isArray) {
        if (this.isSequential) {
            function againA(x) {
                self.eachCallback(x, self.collection[x], self.doneCallback);
                self.current += 1;
            }

            this.doneCallback = function(err, result) {
                if (err instanceof Error) {
                    self.errorCallback(err);
                    return;
                } 
                else { //not an error
                    result = err;
                }
 

                self.results.push(result);
                if (self.current < self.collection.length) {
                    againA(self.current);
                } else {
                    endCallback(self.results);
                }
            }

            againA(this.current); //this.current = 0 
        } else {
            this.doneCallback = function(err, result) {
                if (err instanceof Error) {
                    self.errorCallback(err);
                    return;
                } 
                else { //not an error
                    result = err;
                }

                self.results.push(result);
                self.pending -= 1;

                if (self.pending === 0) {
                    endCallback(self.results);
                }
            }

            for (var i = 0; i < this.collection.length; ++i) {
                self.eachCallback(i, this.collection[i], self.doneCallback);
            }
        }
    } else {
        if (this.isSequential) {
             function againO(x) {
                self.eachCallback(self.keys[x], self.collection[self.keys[x]], self.doneCallback);
                self.current += 1;
            }

            this.doneCallback = function(err, result) {
                if (err instanceof Error) {
                    self.errorCallback(err);
                    return;
                } 
                else { //not an error
                    result = err;
                }

                self.results.push(result);
                if (self.current < self.keys.length) {
                    againO(self.current);
                } else {
                    endCallback(self.results);
                }
            }

            againO(this.current); //this.current = 0 
        } else {
            this.doneCallback = function(err, result) {
                if (err instanceof Error) {
                    self.errorCallback(err);
                    return;
                } 
                else { //not an error
                    result = err;
                }

                self.results.push(result);
                self.pending -= 1;

                if (self.pending === 0) {
                    endCallback(self.results);
                }
            }

            for (var i = 0; i < this.keys.length; ++i) {
                self.eachCallback(this.keys[i], self.collection[self.keys[i]], self.doneCallback);
            }
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

function batch(collection) {
    var bf = new BatchFlow(collection);
    return bf;
}

module.exports = batch;

