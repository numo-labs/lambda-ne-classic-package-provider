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
    var hotelIds = response.result.map(function (item) {
      return item.wvHotelPartId;
    }).join(',');
    var hids = hotelIds.split(',').slice(0,31);
    console.log(hids.join(','));
    var hotel_params = {
      path: 'hotels',
      stage: params.stage,
      hotelIds: hids
    };
    // api_request(hotel_params, function (err, hotel_response) {
      // console.log(err, hotel_response.result[0]);
      context.succeed(response.totalHits);
    // });
    // if(err) {
    //   context.fail()
    // }
  });
};
