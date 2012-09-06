0.1.0 / 2012-09-06
------------------
* Errors would not throw or show up if generated in `each` method and no error handler was set. 
* Fixed bug from `0.0.4` that would still cause an empty collection to execute at least one `each()`. 

0.0.4 / 2012-09-05
------------------
* Fixed bug that would execute `each()` on an empty collection.

0.0.3 / 2012-08-15
------------------
* Fixed bug when array or object contained any synchronous data.

0.0.2 / 2012-08-14
------------------
* Added `error` method.
* Made `series()` an alias for `sequential()`.

0.0.1 / 2012-08-14
------------------
* Initial release.
