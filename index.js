var AwsHelper = require('aws-lambda-helper');
var parse_sns = require('./lib/parse_sns');
var api_request = require('./lib/api_request');
var batch_insert = require('./lib/dynamo_insert');

/**
 * handler receives an SNS message with search parameters and makes requests
 * to the ThomasCook Nordics "Classsic" Packages API. Once we get results
 * they are converted into the format required by GraphQL and inserted into
 * DynamoDB for retrieval by by the lambda-dynamo-search-result-retriever
 */
exports.handler = function (event, context, callback) {
  AwsHelper.init(context, event); // used to extract the version (ci/prod) from Arn
  AwsHelper.Logger('lambda-ne-classic-package-provider');
  AwsHelper.log.info({ event: event }, 'Received event'); // debug sns
  var params = parse_sns(event.Records[0].Sns.Message);
  var stage = AwsHelper.version; // get environment e.g: ci or prod
  params.stage = stage = (stage === '$LATEST' || !stage) ? 'ci' : stage;
  params.bucketId = params.id;
  var bucketId = params.id; // we need the bucketId to insert the results

  api_request(params, function (err, response) { // get packages from NE API
    if (err || !response.result || response.result.length === 0) {
      AwsHelper.log.info({err: err, params: params}, 'ZERO NE Classic Packages Found');

      var body = JSON.parse(JSON.stringify(params));
      body.items = [];
      AwsHelper.pushResultToClient(body, function () {
        return callback(new Error('No packages found'));
      });
    }
    AwsHelper.log.info({ err: err, packages: response.result.length },
                       'Package results');
    batch_insert(stage, bucketId, response.result, function (err, data) {
      AwsHelper.log.info({ err: err, records: response.result.length },
                         'DynamoDB records');
      return callback(err, response.result.length);
    });
  }).on('result', function (body) {
    // AwsHelper.pushResultToClient requires that each item has a url defined
    body.items = body.items.map(function (item) { // so update the list of items
      item.url = bucketId + '/' + item.id;       // to include an item.url
      return item;
    });
    AwsHelper.pushResultToClient(body, function (err, result) {
      AwsHelper.log.trace({ err: err }, 'Sending Packages to Client via WebSocket Server');
    });
  });
};
