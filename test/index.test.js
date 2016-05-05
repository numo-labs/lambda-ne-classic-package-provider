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
        'Message': '{\"data\":{\"context\":{\"market\":\"dk\",\"language\":\"en-EN\",\"userId\":\"8aeb3560-0b92-11e6-9605-eb677966096c\"},\"query\":{\"passengers\":[{\"birthday\":\"1986-07-14\"},{\"birthday\":\"1986-07-14\"},{\"birthday\":\"2012-07-14\"},{\"birthday\":\"2015-07-14\"}],\"hotels\":[\"hotel:NE.wvHotelPartId.186356\",\"hotel:NE.wvHotelPartId.197915\",\"hotel:NE.wvHotelPartId.197941\"]}},\"id\":\"12345\"}'
      }
    }
  ]
};

console.log(' - - - - - - - - - - - - - - - - - - - - TEST SNS MESSAGE:');
console.log(JSON.stringify(EVENT, null, 2));
console.log(' - - - - - - - - - - - - - - - - - - - - - - - - - - - - -');

describe('Search request handler ', function () {
  it('invoke the lambda function handler $LATEST', function (done) {
    CONTEXT.succeed = function () {
      // console.log(' - - - - - - - - - - - - - - - - - - - - - - - - ');
      // console.log(arguments); // the argument to context.succeed
      assert(arguments[0].packageOffer);
      done();
    };
    handler(EVENT, CONTEXT);
  });

  it('invoke the lambda function handler CI', function (done) {
    CONTEXT.invokedFunctionArn = 'arn:aws:lambda:eu-west-1:12345:function:LambdaTest:ci';
    CONTEXT.succeed = function () {
      console.log(' - - - - - - - - - - - - - - - - - - - - - - - - ');
      console.log(JSON.stringify(arguments[0], null, 2)); // the argument to context.succeed
      assert(arguments[0].packageOffer);
      done();
    };
    handler(EVENT, CONTEXT);
  });
});
