/*eslint handle-callback-err: 0 */

var handler = require('../index').handler;
var assert = require('assert');

var CONTEXT = {
  functionName: 'LambdaTest',
  functionVersion: '1',
  invokedFunctionArn: 'arn:aws:lambda:eu-west-1:655240711487:function:LambdaTest:$LATEST'
};

var real_event = require('./fixtures/sample_sns_event.json');
var COUNT = 0;
describe('Thailand End-to-End Test', function () {
  it('test for thailand', function (done) {
    CONTEXT.invokedFunctionArn = 'arn:aws:lambda:eu-west-1:12345:function:LambdaTest:ci';
    var callback = function (err, result) {
      // console.log(' - - - - - - - - - - - - - - - - - - - - - - - - ');
      // console.log(JSON.stringify(arguments[0], null, 2)); // the argument to context.succeed
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
      // console.log(' - - - - - - - - - - - - - - - - - - - - - - - - ');
      // console.log(JSON.stringify(arguments[0], null, 2)); // the argument to context.succeed
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
      // console.log(' - - - - - - - - - - - - - - - - - - - - - - - - ');
      // console.log(JSON.stringify(arguments[0], null, 2)); // the argument to context.succeed
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
      // console.log(' - - - - - - - - - - - - - - - - - - - - - - - - ');
      // console.log(JSON.stringify(arguments[0], null, 2)); // the argument to context.succeed
      COUNT = arguments[1];
      assert(COUNT > 1);
      console.log('Took:', Date.now() - start, 'ms - the bottleneck is dynamodb ...');
      done();
    };
    handler(complete_event, CONTEXT, callback);
  });
});

var FAKE_HOTELS_EVENT = {
  'Records': [
    {
      'Sns': { // CONTAINS FAKE HOTELS
        'Message': '{\"data\":{\"content\":{\"hotels\":[\"hotel:ne.wvid.1234\",\"hotel:ne.wvid.2345\"]},\"context\":{\"market\":\"dk\",\"language\":\"en-EN\",\"userId\":\"testuser123\",\"connectionId\":\"98765\"},\"query\":{\"passengers\":[{\"birthday\":\"1986-07-14\"},{\"birthday\":\"1986-07-14\"}],\"hotels\":[\"hotel:NE.wvHotelPartId.1234\",\"hotel:NE.wvHotelPartId.2345\"]}},\"id\":\"12345\"}'
      }
    }
  ]
};

describe('Exercise Error Handler (No Packages Found)', function () {
  it('Exercise the "no packages" error handler in index.js', function (done) {
    var callback = function (err, result) {
      console.log(' - - - - - - - - - - - - - - - - - - - - - - - - ');
      console.log(err); // the argument to context.succeed
      assert(err, 'No packages found');
      done();
    };
    handler(FAKE_HOTELS_EVENT, CONTEXT, callback);
  });
});
