var handler = require('../index').handler;
var assert = require('assert');

var CONTEXT = {
  functionName: 'LambdaTest',
  functionVersion: '1',
  invokedFunctionArn: 'arn:aws:lambda:eu-west-1:655240711487:function:LambdaTest:$LATEST'
};

var EVENT = {
  'Records': [
    {
      'Sns': {
        'Message': '{\"data\":{\"context\":{\"market\":\"dk\",\"language\":\"en-EN\",\"userId\":\"12345\"},\"query\":{\"passengers\":[{\"birthday\":\"1986-07-14\"},{\"birthday\":\"1986-07-14\"},{\"birthday\":\"2012-07-14\"},{\"birthday\":\"2015-07-14\"}]}},\"id\":\"12345\"}'
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
