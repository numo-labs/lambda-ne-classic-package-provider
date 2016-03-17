var AwsHelper = require('aws-lambda-helper');
var api_request = require('./lib/api_request');
var fs = require('fs');
var path = require('path');
var filename = path.resolve(__dirname + '/mvp/candidate_list.csv');
var candidate_list = fs.readFileSync(filename, 'utf8').split(',').slice(0, 500);
var uniq = require('lodash.uniq'); // https://lodash.com/docs#uniq
var mapper = require('./lib/result_mapper');

exports.handler = function (event, context) {
  AwsHelper.init(context); // used to extract the version (ci/prod) from Arn
  // console.log('Received event:', JSON.stringify(event, null, 2));
  console.log(' - - - - - - - - - - - - - - - - - - - - - - - - ');
  var params = JSON.parse(event.Records[0].Sns.Message);
  // params.hotelIds = get_30_random_hotels_from_candidate_list(); //
  params.hotelIds = candidate_list.slice(0, 30);
  params.stage = AwsHelper.version;
  console.log('From SNS:', params);
  // var bucketId = params.bucketId; // save for later
  delete params.bucketId;         // don't send bucketId to api
  api_request(params, function (err, response) {
    console.log(err, response.result[0]);
    var hotelIds = uniq(response.result.map(function (item) {
      return item.wvHotelPartId;
    })).join(','); // this restricts the hotel details we need to look up.

    var hotel_params = {
      path: 'hotels',
      stage: params.stage,
      hotelIds: hotelIds
    };

    api_request(hotel_params, function (err, hotel_response) {
      console.log(err, hotel_response.result[0]);
      console.log('HOTEL Count:', hotelIds.split(',').length);
      console.log('Packages Count:', response.totalHits);

      var records = mapper.map_ne_result_to_graphql(response.result, hotel_response);
      fs.writeFileSync(__dirname + '/test/sample_results/results.json', JSON.stringify(records, null, 2));
      context.succeed(response.totalHits);
    });
  });
};
