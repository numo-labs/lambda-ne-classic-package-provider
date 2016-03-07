var handler = require('../index').handler;
var assert = require('assert');

var CONTEXT = {
  functionName: 'LambdaTest',
  functionVersion: '1',
  invokedFunctionArn: 'arn:aws:lambda:eu-west-1:655240711487:function:LambdaTest:ci'
};

var EVENT = {
  "Records": [
    {
      "Sns": {
        "Message": "Take me somewhere sunny!"
      }
    }
  ]
 }

describe('Search request handler', function () {
  it('invoke the lambda function handler', function (done) {
    CONTEXT.succeed = function() {
      assert.equal(arguments[0], EVENT.Records[0].Sns.Message);
      done();
    }
    handler(EVENT, CONTEXT);
  });
});
