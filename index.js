var AwsHelper = require('aws-lambda-helper');
var api_request = require('./lib/api_request');
var fs = require('fs');
var path = require('path');
var filename = path.resolve(__dirname + '/mvp/candidate_list.csv');
var candidate_list = fs.readFileSync(filename, 'utf8').split(',').slice(0, 500);
var uniq = require('lodash.uniq'); // https://lodash.com/docs#uniq

// console.log('First 10 Hotel Ids:', candidate_list.slice(0, 10));

// var DOC = require('dynamodb-doc');
// var dynamo = new DOC.DynamoDB();

// split result into records and insert into DynamoDB
// function insert_results_into_dyanmodb (bucketId, results) {
//
// };

function get_30_random_hotels_from_candidate_list () {
  return candidate_list.sort(function () { return 0.5 - Math.random(); }).slice(0, 30);
} // see: http://stackoverflow.com/a/7158691/1148249 or ex: https://repl.it/BwtM

exports.handler = function (event, context) {
  AwsHelper.init(context); // used to extract the version (ci/prod) from Arn
  // console.log('Received event:', JSON.stringify(event, null, 2));
  console.log(' - - - - - - - - - - - - - - - - - - - - - - - - ');
  var params = JSON.parse(event.Records[0].Sns.Message);
  params.hotelIds = get_30_random_hotels_from_candidate_list(); //
  params.stage = AwsHelper.version;
  console.log('From SNS:', params);
  // var bucketId = params.bucketId; // save for later
  delete params.bucketId;         // don't send bucketId to api
  api_request(params, function (err, response) {
    console.log(err, response.result[0]);
    var hotelIds = uniq(response.result.map(function (item) {
      return item.wvHotelPartId;
    })).join(',');
    var hotel_params = {
      path: 'hotels',
      stage: params.stage,
      hotelIds: hotelIds
    };
    api_request(hotel_params, function (err, hotel_response) {
      console.log(err, hotel_response.result[0]);
      context.succeed(response.totalHits);
    });
  });
};
