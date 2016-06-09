/*eslint handle-callback-err: 0 */
require('env2')('.env');
var handler = require('../index').handler;
var assert = require('assert');

var CONTEXT = {
  functionName: 'LambdaTest',
  functionVersion: '1',
  invokedFunctionArn: 'arn:aws:lambda:eu-west-1:655240711487:function:LambdaTest:$LATEST',
  getRemainingTimeInMillis: function () {
    return 60 * 1000;
  }
};

var real_event = require('./fixtures/sample_sns_event.json');
var COUNT = 0;
describe('Thailand End-to-End Test', function () {
  it('test for thailand', function (done) {
    CONTEXT.invokedFunctionArn = 'arn:aws:lambda:eu-west-1:12345:function:LambdaTest:ci';
    var callback = function (err, result) {
      COUNT = arguments[1];
      assert(COUNT > 1);
      done();
    };
    handler(real_event, CONTEXT, callback);
  });
  it('Test CACHE for thailand', function (done) {
    var start = Date.now();
    CONTEXT.invokedFunctionArn = 'arn:aws:lambda:eu-west-1:12345:function:LambdaTest:ci';
    var callback = function (err, result) {
      assert(arguments[1] > 1);
      console.log('Took:', Date.now() - start, 'ms');
      done();
    };
    handler(real_event, CONTEXT, callback);
  });
});

var complete_event = require('./fixtures/complete_sns_event.json');
describe('Spain End-to-End Test with Departure Date and Airport!', function () {
  it('Test Spain Complete', function (done) {
    CONTEXT.invokedFunctionArn = 'arn:aws:lambda:eu-west-1:655240711487:function:LambdaTest:$LATEST';
    var callback = function (err, result) {
      COUNT = arguments[1];
      assert(COUNT > 1);
      done();
    };
    handler(complete_event, CONTEXT, callback);
  });
  it('Complete Cache Hit', function (done) {
    var start = Date.now();
    CONTEXT.invokedFunctionArn = 'arn:aws:lambda:eu-west-1:655240711487:function:LambdaTest:$LATEST';
    var callback = function (err, result) {
      COUNT = arguments[1];
      assert(COUNT > 1);
      console.log('Took:', Date.now() - start, 'ms to complete.');
      done();
    };
    handler(complete_event, CONTEXT, callback);
  });
});

var EMPTY_FAKE_HOTELS_EVENT = require('./fixtures/fake_hotels_sns_event_empty.json');

describe('Exercise Error Handler (No Packages Found)', function () {
  it('Exercise the "no packages" error handler in index.js', function (done) {
    var callback = function (err, result) {
      assert(err, 'No packages found');
      done();
    };
    handler(EMPTY_FAKE_HOTELS_EVENT, CONTEXT, callback);
  });
});

var FAKE_HOTELS_EVENT = require('./fixtures/fake_hotels_sns_event.json');

describe('Exercise Error Handler (No Packages Found)', function () {
  it('Exercise the "no packages" error handler in index.js', function (done) {
    var callback = function (err, result) {
      assert(err, 'No packages found');
      done();
    };
    handler(FAKE_HOTELS_EVENT, CONTEXT, callback);
  });
});
