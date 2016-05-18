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
    CONTEXT.succeed = function () {
      // console.log(' - - - - - - - - - - - - - - - - - - - - - - - - ');
      // console.log(JSON.stringify(arguments[0], null, 2)); // the argument to context.succeed
      COUNT = arguments[0];
      assert(COUNT > 0);
      done();
    };
    handler(real_event, CONTEXT);
  });
  it('Test CACHE for thailand', function (done) {
    var start = Date.now();
    CONTEXT.invokedFunctionArn = 'arn:aws:lambda:eu-west-1:12345:function:LambdaTest:ci';
    CONTEXT.succeed = function () {
      // console.log(' - - - - - - - - - - - - - - - - - - - - - - - - ');
      // console.log(JSON.stringify(arguments[0], null, 2)); // the argument to context.succeed
      assert.equal(COUNT, arguments[0]);
      console.log('Took:', Date.now() - start, 'ms');
      done();
    };
    handler(real_event, CONTEXT);
  });
});

var complete_event = require('./fixtures/complete_sns_event.json');
describe('Spain End-to-End Test with Departure Date and Airport!', function () {
  it('Test Spain Complete', function (done) {
    CONTEXT.invokedFunctionArn = 'arn:aws:lambda:eu-west-1:655240711487:function:LambdaTest:$LATEST';
    CONTEXT.succeed = function () {
      // console.log(' - - - - - - - - - - - - - - - - - - - - - - - - ');
      // console.log(JSON.stringify(arguments[0], null, 2)); // the argument to context.succeed
      COUNT = arguments[0];
      assert(COUNT > 0);
      done();
    };
    handler(complete_event, CONTEXT);
  });
  it('Complete Cache Hit', function (done) {
    var start = Date.now();
    CONTEXT.invokedFunctionArn = 'arn:aws:lambda:eu-west-1:655240711487:function:LambdaTest:$LATEST';
    CONTEXT.succeed = function () {
      // console.log(' - - - - - - - - - - - - - - - - - - - - - - - - ');
      // console.log(JSON.stringify(arguments[0], null, 2)); // the argument to context.succeed
      COUNT = arguments[0];
      assert(COUNT > 0);
      console.log('Took:', Date.now() - start, 'ms - the bottleneck is dynamodb ...');
      done();
    };
    handler(complete_event, CONTEXT);
  });
});

var FAKE_HOTELS_EVENT = {
  'Records': [
    {
      'Sns': { // CONTAINS FAKE HOTELS
        'Message': '{\"data\":{\"context\":{\"market\":\"dk\",\"language\":\"en-EN\",\"userId\":\"123456\"},\"query\":{\"passengers\":[{\"birthday\":\"1986-07-14\"},{\"birthday\":\"1986-07-14\"}],\"hotels\":[\"hotel:NE.wvHotelPartId.1234\",\"hotel:NE.wvHotelPartId.2345\"]}},\"id\":\"12345\"}'
      }
    }
  ]
};

describe.only('Exercise Error Handler (No Packages Found)', function () {
  it('Exercise the "no packages" error handler in index.js', function (done) {
    CONTEXT.fail = function (err) {
      // console.log(' - - - - - - - - - - - - - - - - - - - - - - - - ');
      // console.log(err); // the argument to context.succeed
      assert(err, 'No packages found');
      done();
    };
    handler(FAKE_HOTELS_EVENT, CONTEXT);
  });
});
