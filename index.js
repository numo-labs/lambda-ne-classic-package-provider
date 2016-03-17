var AwsHelper = require('aws-lambda-helper');
var api_request = require('./lib/api_request');
var unique_packages = require('./lib/unique_packages');
var mapper = require('./lib/result_mapper');
var batch_insert = require('./lib/dynamo_insert');
// var fs = require('fs');

exports.handler = function (event, context) {
  AwsHelper.init(context); // used to extract the version (ci/prod) from Arn
  // console.log('Received event:', JSON.stringify(event, null, 2));
  var params = JSON.parse(event.Records[0].Sns.Message);
  // params.hotelIds = candidate_list.slice(0, 30);
  params.stage = AwsHelper.version;
  console.log(' - - - - - - - - - - - - - - - - - - - - - - - - ');
  console.log('From SNS:', params);
  var bucketId = params.bucketId; // save for later
  delete params.bucketId;         // don't send bucketId to NE api
  api_request(params, function (err, response) {
    console.log(err, 'Package Results:', response.result.length);
    var results = unique_packages(response.result);
    var packages = results.splice(0, 30); // TODO: implement batching ALL results

    var hotel_params = {
      path: 'hotels',
      stage: params.stage,
      hotelIds: packages.map(function (i) { return i.wvHotelPartId; }).join(',')
    };

    api_request(hotel_params, function (err, hotel_response) {
      console.log(err, 'Hotel Results:', hotel_response.result.length);
      // console.log('HOTEL Count:', hotel_params.hotelIds.split(',').length);
      // console.log('Packages Count:', packages.length);

      var records = mapper.map_ne_result_to_graphql(packages, hotel_response);
      batch_insert(AwsHelper.version, bucketId, records, function (err, data) {
        console.log(err, 'Records inserted:', data.join(','));
        // fs.writeFileSync(__dirname + '/test/sample_results/results.json', JSON.stringify(records, null, 2));
        context.succeed(response.totalHits);
      });
    });
  });
};
