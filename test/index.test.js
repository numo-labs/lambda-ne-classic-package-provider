var handler = require('../index').handler;
var assert = require('assert');

var CONTEXT = {
  functionName: 'LambdaTest',
  functionVersion: '1',
  invokedFunctionArn: 'arn:aws:lambda:eu-west-1:655240711487:function:LambdaTest:ci'
};

var SNS_MESSAGE = {
  'bucketId': '12345',
  // 'hotelIds': '139891,10002,99281',
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

describe('Search request handler', function () {
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
