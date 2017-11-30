# retriable-promise

Add retry logic to a Promise-returning function.

[![npm Version][npm-badge]][npm]
[![Build Status][build-badge]][build-status]
[![Test Coverage][coverage-badge]][coverage-result]
[![Dependency Status][dep-badge]][dep-status]

__Features__

- __Composable.__ By wrapping your existing functions, retry logic is easily
  integrated into your applications.
- __Simple.__ The API surface area is minimal but powerful.
- __Tiny.__ 0 external dependencies. < 30 LOC.
- __Flexible.__ Works with Bluebird, jQuery, RSVP, and pretty much every other
  Promise library out there.

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

// Create a new function that wraps your existing function with retry logic.
const fetchTweetsWithRetries = retriable(api.fetchTweets, {
  // Retry 3 times, delayed 0/500/1000 ms respectively
  retries: [0, 500, 1000],

  // Only when the status code is 429 Too Many Requests
  when(err) {
    return err.statusCode === 429;
  }
});

fetchTweetsWithRetries(/* any args to original function */)
  .then(/* on success */)
  .catch(/* on failure */);
```

## Why Another Retry Library?

An npm search brings up half a dozen retry libraries, if not more.
[promise-retry](https://www.npmjs.com/package/promise-retry) has hundreds of
thousands of downloads. Why not use one of those? Well, for me, I wanted
something more lightweight. In my experience, the retry logic I typically add
is finite and well understood. Most often, it's retry up to three times, with
some form of linear or exponential backoff. This doesn't require any sort of
algorithms to work out how and when the retries should be invoked. With such a
small number, it's trivial to figure out how long to wait and list out the
delays manually. This concept is simple, but deceivingly capable, as you have
the flexibility to devise _any_ discrete series of timeouts. This is what
primarily drove the API I came up with. Secondarily, I needed a
jQuery-compatible solution that could easily decorate existing functions and
methods.

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
