var AwsHelper = require('aws-lambda-helper');
var api_request = require('./lib/api_request');

// split result into records and insert into DynamoDB
// var DOC = require('dynamodb-doc');
// var dynamo = new DOC.DynamoDB();
// function insert_results_into_dyanmodb (bucketId, results) {
//
// };

exports.handler = function (event, context) {
  AwsHelper.init(context); // used to extract the version (ci/prod) from Arn
  // console.log('Received event:', JSON.stringify(event, null, 2));
  console.log(' - - - - - - - - - - - - - - - - - - - - - - - - ');
  var params = JSON.parse(event.Records[0].Sns.Message);
  params.stage = AwsHelper.version;
  console.log('From SNS:', params);
  // var bucketId = params.bucketId; // save for later
  delete params.bucketId;         // don't send bucketId to api
  api_request(params, function (err, res) {
    console.log(err, res);
    // if(err) {
    //   context.fail()
    // }
    context.succeed(res.totalHits);
  });
};
