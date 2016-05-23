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
  console.log(params);
  console.log(' - - - - - - - - - - - - - - - - - - - - - - - - ');
  api_request(params, function (err, response) { // get packages from NE API
    if (err || response.result.length === 0) {
      AwsHelper.log.info('No packages found');
      return context.fail('No packages found');
    }
    AwsHelper.log.info({ err: err, packages: response.result.length }, 'Package results');
    // var packages = response.result;

    // batch_insert(stage, bucketId, response.result, function (err, data) {
      AwsHelper.log.info({ err: err, records: response.result.length }, 'DynamoDB records');
      return context.succeed(response.result.length);
    // });
  });
};
