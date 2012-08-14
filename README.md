Node.js - batchflow
===================

Batch process collections in parallel or sequentially.


Why?
----

I really got tired of writing the following patterns over and over again:

**Sequential:**
```javascript
var files = [... list of files ...];
function again(x) {
	if (x < files.length) {
		fs.readFile(files[x], function(err, data) {
			//... do something with data ...
			again(x + 1);
		});
	} else {
		console.log('Done.');
	}
}

again(0);
```

or..

**Parallel:**
```javascript
var files = [... list of files ...];
var pending = 0;
files.forEach(function(file, i) {
	pending += 1;
	fs.readFile(file, function(err, data) {
		//... do something with data ....
		
		pending -= 1;
		if (pending === 0 && i === files.length -1) {
			console.log('Done.');
		}
	});
});
```

That's ugly. For more complicated examples it requires a bit more thinking.

Why don't I use the wonderful library [async][1]? Well, `async` tries to do way too much. I also suffer from a server case of NIH syndrome. Kidding, or else I'd rewrite Express.js. Or, am I? Muahahhaa. `async` syntax is also very ugly and not CoffeeScript friendly.




Installation
------------

    npm install batchflow



Examples
--------

### Arrays

Let's rewrite the previous sequential example:

**Sequential:**
```javascript
var batch = require('batchflow');

var files = [... list of files ...];
batch(files).sequential()
.each(function(i, item, done) {
	fs.readFile(item, function(err, data) {
		//do something with data
		done(someResult);
	});
}).end(function(results) {
	//analyze results
});
```

How about the parallel example?

**Parallel:**
 ```javascript
var batch = require('batchflow');

var files = [... list of files ...];
batch(files).parallel()
.each(function(i, item, done) {
	fs.readFile(item, function(err, data) {
		//do something with data
		done(someResult); //<---- yes, you must still call done in parallel, this way we can know when to trigger `end()`.
	});
}).end(function(results) {
	//analyze results
});
```

What's that, your data is not stored in an array? Oh, you say it's stored in an object? That's OK too...

### Objects

**Sequential:**
```javascript
var batch = require('batchflow');

var files = {'file1': 'path'.... 'filen': 'pathn'}
batch(files).sequential()
.each(function(key, val, done) {
	fs.readFile(val, function(err, data) {
		//do something with data
		done(someResult);
	});
}).end(function(results) {
	//analyze results
});
```

How about the parallel example?

**Parallel:**
 ```javascript
var batch = require('batchflow');

var files = {'file1': 'path'.... 'filen': 'pathn'}
batch(files).parallel()
.each(function(key, val, done) {
	fs.readFile(val, function(err, data) {
		//do something with data
		done(someResult);
	});
}).end(function(results) {
	//analyze results
});
```

### Misc

1. Is `sequential()` or `parallel()` too long? Fine. Type `seq()` or `par()`.
2. You don't like the fluent API? That's OK too:

Non-fluent API BatchFlow

```javascript
var batch = require('batchflow');
var bf = batch(files);
bf.isSequential = true;

bf.each(function(i, file, done) {
	done(someResult);
});
 
bf.end(function(results) {
	//blah blah
});
```

### CoffeeScript

```coffee
batch = require('batchflow')
files = [... list of files ...]
bf = batch(files).seq().each (i, file, done) ->
  fs.readFile file, (err, data) -> done(data)
bf.end (results)
  console.log fr.toString() for fr in results
```



License
-------

(MIT License)

Copyright 2012, JP  <jprichardson@gmail.com>



[1]: https://github.com/caolan/async/
