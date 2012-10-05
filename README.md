
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

//sequential
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

1. Is `sequential()` or `parallel()` too long? Fine. `series()` and `seq()` are aliases for `sequential()` and `par()` is an alias for `parallel()`.
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
  fs.readFile file, done
bf.error (err) ->
  console.log(err);
bf.end (results) ->
  console.log fr.toString() for fr in results
```

### Error Handling

What's that, you want error handling? Well, you might as well call me Burger King... have it your way.

```javascript
var a = {'f': '/tmp/file_DOES_NOT_exist_hopefully' + Math.random()};
batch(a).parallel().each(function(i, item, done) {
    fs.readFile(item, done);
}).error(function(err) {
    assert(err);
    done();
}).end(function() {
    assert(false); //<--- shouldn't get here
});


var a = ['/tmp/file_DOES_NOT_exist_hopefully' + Math.random()];
batch(a).series().each(function(i, item, done) {
    throw new Error('err');
}).error(function(err) {
    assert(err);
    done();
}).end(function() {
    assert(false); //<--- shouldn't get here
});

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


