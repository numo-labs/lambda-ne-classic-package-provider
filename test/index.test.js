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
      assert(arguments[0] > 0);
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
