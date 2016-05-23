var AwsHelper = require('aws-lambda-helper');
var api_request = require('./lib/api_request');
var batch_insert = require('./lib/dynamo_insert');
var parse_sns = require('./lib/parse_sns');
/**
 * handler receives an SNS message with search parameters and makes requests
 * to the ThomasCook Nordics "Classsic" Packages API. Once we get results
 * they are converted into the format required by GraphQL and inserted into
 * DynamoDB for retrieval by by the lambda-dynamo-search-result-retriever
 */
exports.handler = function (event, context) {
  AwsHelper.init(context, event); // used to extract the version (ci/prod) from Arn
  AwsHelper.Logger('lambda-ne-classic-package-provider');
  AwsHelper.log.info({ event: event }, 'Received event'); // debug sns
  var params = parse_sns(event.Records[0].Sns.Message);
  var stage = AwsHelper.version; // get environment e.g: ci or prod
  params.stage = stage = (stage === '$LATEST' || !stage) ? 'ci' : stage;
  var bucketId = params.id; // we need the bucketId to insert the results
  delete params.id;         // don't send bucketId to NE api

  api_request(params, function (err, response) { // get packages from NE API
    if (err || response.result.length === 0) {\\
      AwsHelper.log.info('No packages found');
      return context.fail('No packages found');
    }
    AwsHelper.log.info({ err: err, packages: response.result.length }, 'Package results');
    var packages = response.result;

    var hotel_params = {
      path: 'hotels',
      stage: params.stage, // always need the stage (environment e.g: ci/prod)
      hotelIds: packages.map(function (i) { return i.wvHotelPartId; }).join(',')
    };

    api_request(hotel_params, function (err, hotel_response) { // get hotel info
      AwsHelper.log.info({ err: err, hotels: hotel_response.result.length }, 'Hotel results');
      var records = mapper.map_ne_result_to_graphql(packages, hotel_response.result);

      var message = JSON.parse(event.Records[0].Sns.Message);
      var body = {
        id: message.data.context.connectionId,
        searchId: message.id,
        userId: message.data.context.userId,
        items: records
      }

      batch_insert(stage, bucketId, records, function (err, data) {
        AwsHelper.log.info({ err: err, records: records.length }, 'DynamoDB records');
          // during dev we write results to disk for debug - keep commented in prod.
          // require('fs').writeFileSync(__dirname + '/test/sample_results/results.json',
          //   JSON.stringify(records, null, 2));
        return context.succeed(records.length);
      });
    });
  });
  // }
};
