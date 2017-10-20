var test = require('tape')
var BluebirdPromise = require('bluebird')
var retriable = require('..')

function resolve (value) {
  return { type: 'resolve', value }
}

function reject (value) {
  return { type: 'reject', value }
}

function createCallback (results, P = Promise) {
  var cb = function () {
    var result = results.shift()
    var args = Array.prototype.slice.call(arguments)
    cb.calls.push(args)
    return result.type === 'resolve'
      ? P.resolve(result.value)
      : P.reject(result.value)
  }
  cb.calls = []
  return cb
}

test('when promise resolves on initial attempt', function (t) {
  t.plan(2)
  var cb = createCallback([resolve(true)])
  var wrapped = retriable(cb, {
    retries: [0, 0, 0]
  })
  wrapped('dummy-arg').then(function (result) {
    t.equal(result, true, 'resolves with expected result')
    t.deepEqual(cb.calls, [['dummy-arg']], 'retries zero times')
  })
})

test('when a retry attempt succeeds', function (t) {
  t.plan(2)
  var cb = createCallback([reject(false), resolve(true)])
  var wrapped = retriable(cb, {
    retries: [0, 0, 0]
  })
  wrapped('dummy-arg').then(function (result) {
    t.equal(result, true, 'resolves with expected result')
    t.deepEqual(cb.calls, [['dummy-arg'], ['dummy-arg']], 'retries expected number of times')
  })
})

test('when no retry attempts succeed', function (t) {
  t.plan(2)
  var cb = createCallback([reject(false), reject(false), reject(false), reject(false)])
  var wrapped = retriable(cb, {
    retries: [0, 0, 0]
  })
  wrapped('dummy-arg').catch(function (result) {
    t.equal(result, false, 'rejects with expected result')
    t.deepEqual(cb.calls, [['dummy-arg'], ['dummy-arg'], ['dummy-arg'], ['dummy-arg']],
      'retries expected number of times')
  })
})

test('when promise rejects and does not pass "when" test', function (t) {
  t.plan(2)
  var cb = createCallback([reject(false)])
  var wrapped = retriable(cb, {
    retries: [0, 0, 0],
    when: function (err) {
      return err === 'retriable-error'
    }
  })
  wrapped('dummy-arg').catch(function (result) {
    t.equal(result, false, 'rejects with expected result')
    t.deepEqual(cb.calls, [['dummy-arg']], 'retries zero times')
  })
})

test('supports alternative Promise implementations', function (t) {
  t.plan(3)
  var cb = createCallback([reject(false), resolve(true)], BluebirdPromise)
  var wrapped = retriable(cb, {
    retries: [0, 0, 0],
    Promise: BluebirdPromise
  })
  var p = wrapped('dummy-arg').then(function (result) {
    t.equal(result, true, 'resolves with expected result')
    t.deepEqual(cb.calls, [['dummy-arg'], ['dummy-arg']], 'retries expected number of times')
  })
  t.ok(p instanceof BluebirdPromise, 'returns desired Promise instance')
})
