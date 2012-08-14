
function BatchFlow(collection) {
    this.collection = collection;
    this.isSequential = true;
    this.results = [];
    this.pending = this.collection.length;
    this.doneCallback = null;
    this.eachCallback = null;
    this.current = 0;
    this.isArray = collection instanceof Array;
    this.keys = []; //only if this.isArray === false

    /*if (!this.isArray) {
        for (var key in collection) {
            this.keys.push(key);
            this.pending += 1;
        }
    } else {
        
    }*/

}

BatchFlow.prototype.each = function(callback) {
    this.eachCallback = callback;
    return this;
};

BatchFlow.prototype.end = function(endCallback) {
    var self = this;

    if (this.isArray) {
        if (this.isSequential) {
            function again(x) {
                self.eachCallback(x, self.collection[x], self.doneCallback);
                self.current += 1;
            }

            this.doneCallback = function(result) {
                self.results.push(result);
                if (self.current < self.collection.length) {
                    again(self.current);
                } else {
                    endCallback(self.results);
                }
            }

            again(this.current); //this.current = 0 
        } else {
            this.doneCallback = function(result) {
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
    } /*else {
        if (this.isSequential) {
             function again(x) {
                self.eachCallback(self.keys[x], self.collection[self.keys[x]], self.doneCallback);
                self.current += 1;
            }

            this.doneCallback = function(result) {
                self.results.push(result);
                if (self.current < self.keys.length) {
                    again(self.current);
                } else {
                    endCallback(self.results);
                }
            }

            again(this.current); //this.current = 0 
        } else {

        }

    }*/

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


function batch(collection) {
    var bf = new BatchFlow(collection);
    return bf;
}

module.exports = batch;

