# retriable-promise

Add retry logic to a Promise-returning function.

[![npm Version][npm-badge]][npm]
[![Build Status][build-badge]][build-status]
[![Test Coverage][coverage-badge]][coverage-result]
[![Dependency Status][dep-badge]][dep-status]

## Installation

Install using [npm][]:

    $ npm install retriable-promise

## Usage

__retriable-promise__ exports a function that accepts a Promise-returning
function and an options object, returning a new function that decorates the
given one with retry logic:

    retriable(func, options) → Function

```js
const retriable = require('retriable-promise');
const api = require('./my-api-module');

const fetchStuffWithRetries = retriable(api.fetchStuff, {
  // Retry 3 times, delayed 0/500/1000 ms respectively
  retries: [0, 500, 1000],

  // Only when the status code is 429
  when(err) {
    return err.statusCode === 429;
  }
});

fetchStuffWithRetries(/* any args to original function */)
  .then(/* on success */)
  .catch(/* on failure */);
```

## Available Options

#### `options.retries` (Array, required)

An array of integers, representing the delay (in ms) to wait before invoking
each retry attempt. For example, passing `{ wait: [1000, 1000, 1000] }` would
configure the returning function to retry up to 3 times, waiting 1 second
before each subsequent attempt.

#### `options.when` (Function)

By default, retries will be invoked for all Promise rejections. In order to
refine which failures are retriable, specify a `when` function that receives
the Promise rejection value as an argument and returns `true` or `false`
depending on whether a retry should be made.

#### `options.Promise` (Function)

The particular Promise implementation can be overridden by specifying
`options.Promise`, which defaults to the native ES2015 `Promise`. Note that if
this option is specified, the given function should conform to the native
Promise constructor API, i.e., it is expected to take a callback function that
itself receives `resolve` and `reject` callbacks and returns an appropriate
promise instance.

## License

MIT

[build-badge]: https://img.shields.io/travis/jimf/retriable-promise/master.svg
[build-status]: https://travis-ci.org/jimf/retriable-promise
[npm-badge]: https://img.shields.io/npm/v/retriable-promise.svg
[npm]: https://www.npmjs.org/package/retriable-promise
[coverage-badge]: https://img.shields.io/coveralls/jimf/retriable-promise.svg
[coverage-result]: https://coveralls.io/r/jimf/retriable-promise
[dep-badge]: https://img.shields.io/david/jimf/retriable-promise.svg
[dep-status]: https://david-dm.org/jimf/retriable-promise
