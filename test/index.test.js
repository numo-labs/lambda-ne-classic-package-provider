var handler = require('../index').handler;
var assert = require('assert');

var CONTEXT = {
  functionName: 'LambdaTest',
  functionVersion: '1',
  invokedFunctionArn: 'arn:aws:lambda:eu-west-1:655240711487:function:LambdaTest:$LATEST'
};

var SNS_MESSAGE = {
  'bucketId': '12345',
  'adults': '2',
  'children': '3'
};

var EVENT = {
  'Records': [
    {
      'Sns': {
        'Message': JSON.stringify(SNS_MESSAGE)
      }
    }
  ]
};
console.log(' - - - - - - - - - - - - - - - - - - - - TEST SNS MESSAGE:');
console.log(JSON.stringify(EVENT, null, 2));
console.log(' - - - - - - - - - - - - - - - - - - - - - - - - - - - - -');

describe('Search request handler $LATEST', function () {
  it('invoke the lambda function handler', function (done) {
    CONTEXT.succeed = function () {
      console.log(' - - - - - - - - - - - - - - - - - - - - - - - - ');
      // console.log(arguments); // the argument to context.succeed
      assert(parseInt(arguments[0], 10) > 1);
      done();
    };
    handler(EVENT, CONTEXT);
  });
});

describe('Search request handler CI', function () {
  it('invoke the lambda function handler', function (done) {
    CONTEXT.invokedFunctionArn = 'arn:aws:lambda:eu-west-1:12345:function:LambdaTest:ci';
    CONTEXT.succeed = function () {
      console.log(' - - - - - - - - - - - - - - - - - - - - - - - - ');
      // console.log(arguments); // the argument to context.succeed
      assert(parseInt(arguments[0], 10) > 1);
      done();
    };
    handler(EVENT, CONTEXT);
  });
});
