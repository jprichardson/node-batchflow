
Node.js - batchflow
===================

[![build status](https://secure.travis-ci.org/jprichardson/node-batchflow.png)](http://travis-ci.org/jprichardson/node-batchflow)

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

Why don't I use the wonderful library [async][1]? Well, `async` tries to do way too much. I also suffer from a severe case of NIH syndrome. Kidding, or else I'd rewrite Express.js. Or, am I? Muahahhaa. `async` syntax is also very ugly and not CoffeeScript friendly.




Installation
------------

    npm install batchflow



Examples
--------

### 50 Foot Overview

Simple Sequential Example:

```javascript
var a = [
        function(finished) { setTimeout(function(){finished(1)}, 1); }, //executes in 1 ms
        function(finished) { setTimeout(function(){finished(2)}, 20); }, //executes in 20 ms
        function(finished) { setTimeout(function(){finished(3)}, 2); } //executes in 2 ms
    ];

//sequential
batch(a).sequential()
.each(function(i, item, done) {
  item(done);
}).end(function(results) {
  for (var i = 0; i < results.length; ++i) {
    console.log(results[i]);
  }
});

/*
  1
  2
  3
*/
```

Simple Parallel Example:

```javascript
//parallel
batch(a).parallel()
.each(function(i, item, done) {
  item(done);
}).end(function(results) {
  for (var i = 0; i < results.length; ++i) {
    console.log(results[i]);
  }
});

/*
  1
  3
  2
*/
```

### Arrays

Let's rewrite the previous file patterns mentioned in **Why?** into a sequential example:

**Sequential:**

```javascript
var batch = require('batchflow');

var files = [... list of files ...];
batch(files).sequential()
.each(function(i, item, next) {
	fs.readFile(item, function(err, data) {
		//do something with data
		next(someResult);
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
		done(someResult); //<---- yes, you must still call done() in parallel, this way we can know when to trigger `end()`.
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
.each(function(key, val, next) {
	fs.readFile(val, function(err, data) {
		//do something with data
		next(someResult);
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

1. Is `sequential()` or `parallel()` too long? Fine. `series()` and `seq()` are aliases for `sequential()`. `par()` is an alias for `parallel()`.
2. You don't like the fluent API? That's OK too:

Non-fluent API BatchFlow

```javascript
var batch = require('batchflow');
var bf = batch(files);
bf.sequential()

bf.each(function(i, file, next) {
	next(someResult);
});
 
bf.end(function(results) {
	//blah blah
});
```


### CoffeeScript Friendly

```coffee
batch = require('batchflow')
files = [... list of files ...]
bf = batch(files).seq().each (i, file, done) ->
  fs.readFile file, done
bf.error (err) ->
  console.log(err);
bf.end (results) ->
  console.log fr.toString() for fr in results
```


### Error Handling

What's that, you want error handling? Well, you might as well call me Burger King... have it your way.

Note that before version `0.3`, it would exit prematurely if an error happened. This was a boneheaded
design decision. After `0.3`, it'll keep happily processing even if an error occured.

Catch an error in the callback parameter...

```javascript
var a = {'f': '/tmp/file_DOES_NOT_exist_hopefully' + Math.random()};
batch(a).parallel().each(function(i, item, done) {
  fs.readFile(item, done);
}).error(function(err) {
  console.error(err);
}).end(function(fileData) {
  //do something with file data
});
```

Catch an error in the function...

```javascript
var a = ['/tmp/file_DOES_NOT_exist_hopefully' + Math.random()];
batch(a).series().each(function(i, item, done) {
  throw new Error('err');
}).error(function(err) {
  console.error(err);
}).end(function() {
  //do something
});

```


### Limits

You can set a limit to how many items can be processed in parallel. In fact, `sequential` mode is the same as having the `limit` set to `1` and calling `parallel`. In other words: `batch(myArray).sequential() ....` is the same as `batch(myArray).parallel(1)`.

To set the limit, just pass the limit as a parameter to `parallel()`. The **default is 2^53** which is the max integer size in JavaScript.

Example:

```javascript
batch(myArray).parallel(8)
.each(function(i, item, done){
  // ... code here ... 
}).end(function(results){
  // ... code here ...
})
```


### Difference between done() and next()

So you noticed that in all of the examples where I was calling `sequential()` the third parameter is named `next` and in the examples where I was calling `parallel()` the third parameter is named `done`?  This is really just a matter of convention. It could be named `fruitypebbles`. But in sequential processing, it makes sense for it to be `next` because you want to process the next one. However, in parallel processing, you want to alert the system that the callback is `done`.

Sequential...

```javascript
batch(myArray).sequential()
.each(function(i, item, next) {
  // ... code here ...
}).end();
```

Parallel...

```javascript
batch(myArray).parallel()
.each(function(i, item, done) {
  // ... code here ...
}).end();
```


### Progress

You can keep track of progress by accessing the `finished` field.

Compute percentage by this formula: `(this.finished / this.total) * 100.0`.

Example:

```javascript
var myar = {w: 'hi', b: 'hello', c: 'hola', z: 'gutentag'}
batch(myar).sequential()
.each(function(i, item, next) {
  console.log(this.finished) //the number finished.
  console.log(this.total) //4
  console.log((this.finished / this.total) * 100.0) //{percent complete}
})
.end();
```


Author
------

`node-batchflow` was written by [JP Richardson][aboutjp]. You should follow him on Twitter [@jprichardson][twitter]. Also read his coding blog [Procbits][procbits]. If you write software with others, you should checkout [Gitpilot][gitpilot] to make collaboration with Git simple.



License
-------

(MIT License)

Copyright 2012, JP  <jprichardson@gmail.com>



[1]: https://github.com/caolan/async/

[aboutjp]: http://about.me/jprichardson
[twitter]: http://twitter.com/jprichardson
[procbits]: http://procbits.com
[gitpilot]: http://gitpilot.com


