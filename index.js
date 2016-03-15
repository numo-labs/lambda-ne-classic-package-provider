var AwsHelper = require('aws-lambda-helper');
var api_request = require('./lib/api_request');

// var DOC = require('dynamodb-doc');
// var dynamo = new DOC.DynamoDB();

// split result into records and insert into DynamoDB
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
  api_request(params, function (err, response) {
    console.log(err, response.result[0]);
    // if(err) {
    //   context.fail()
    // }
    context.succeed(response.totalHits);
  });
};
