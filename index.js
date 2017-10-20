function T () { return true }

/**
 * Decorate a Promise-returning function to add retry behavior.
 *
 * @param {function} fn A Promise-returning function
 * @param {object} opts Configuration options
 * @param {number[]} opts.retries Array of retry delay timeouts (in ms)
 * @param {function} [opts.when] Predicate function that returns whether failure should retry
 * @param {function} [opts.Promise] Promise implementation (defaults to native)
 * @return {function}
 */
module.exports = function retriable (fn, opts) {
  return function () {
    var args = arguments
    var retries = opts.retries.slice(0)
    var when = opts.when || T
    var P = opts.Promise || Promise

    return new P(function (resolve, reject) {
      function fail (err) {
        if (when(err) && retries.length > 0) {
          setTimeout(run, retries.shift())
        } else {
          reject(err)
        }
      }

      function run () {
        fn.apply(null, args)
          .then(resolve)
          .catch(fail)
      }

      run()
    })
  }
}
