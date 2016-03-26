var AwsHelper = require('aws-lambda-helper');
var api_request = require('./lib/api_request');
var unique_packages = require('./lib/unique_packages');
var mapper = require('./lib/result_mapper');
var batch_insert = require('./lib/dynamo_insert');
var parse_sns = require('./lib/parse_sns');
/**
 * handler receives an SNS message with search parameters and makes requests
 * to the ThomasCook Nordics "Classsic" Packages API. Once we get results
 * they are converted into the format required by GraphQL and inserted into
 * DynamoDB for retrieval by by the lambda-dynamo-search-result-retriever
 */
exports.handler = function (event, context) {
  AwsHelper.init(context); // used to extract the version (ci/prod) from Arn
  console.log('Received event:', JSON.stringify(event, null, 2)); // debug SNS
  var params = parse_sns(event.Records[0].Sns.Message);
  var stage = AwsHelper.version; // get environment e.g: ci or prod
  params.stage = stage = (stage === '$LATEST' || !stage) ? 'ci' : stage;
  var bucketId = params.id; // we need the bucketId to insert the results
  delete params.id;         // don't send bucketId to NE api
  api_request(params, function (err, response) { // get packages from NE API
    console.log(err, 'Package Results:', response.result.length);

    var results = unique_packages(response.result); // one package per hotel
    console.log('Number of unique packages: ' + results.length);

    var packages = results.splice(0, 30); // limit to the first 30 results
    // console.log(results.map(function (i) { return i.wvHotelPartId; }).join(','));
    var hotel_params = {
      path: 'hotels',
      stage: params.stage, // always need the stage (environment e.g: ci/prod)
      hotelIds: packages.map(function (i) { return i.wvHotelPartId; }).join(',')
    };

    api_request(hotel_params, function (err, hotel_response) { // get hotel info
      console.log(err, 'Hotel Results:', hotel_response.result.length);
      var records = mapper.map_ne_result_to_graphql(packages, hotel_response.result);
      batch_insert(stage, bucketId, records, function (err, data) {
        console.log(err, 'Records inserted into DynamoDB:', records.length);
          // during dev we write results to disk for debug - remove these lines in prod.
          // require('fs').writeFileSync(__dirname + '/test/sample_results/results.json',
          //   JSON.stringify(records, null, 2));
        context.succeed(records.length);
      });
    });
  });
};
