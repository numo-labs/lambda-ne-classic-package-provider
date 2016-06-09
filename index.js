var AwsHelper = require('aws-lambda-helper');
var parse_sns = require('./lib/parse_sns');
var api_request = require('./lib/api_request');
var mapper = require('./lib/result_mapper');
/**
 * handler receives an SNS message with search parameters and makes requests
 * to the ThomasCook Nordics "Classsic" Packages API. Once we get results
 * they are converted into the format required by GraphQL and inserted into
 * DynamoDB for retrieval by by the lambda-dynamo-search-result-retriever
 */
exports.handler = function (event, context, callback) {
  context.callbackWaitsForEmptyEventLoop = false;

  AwsHelper.init(context, event); // to extract the version (ci/prod) from Arn
  AwsHelper.Logger('lambda-ne-classic-package-provider');
  AwsHelper.log.info({ event: event }, 'Received event'); // debug sns
  var params = parse_sns(event.Records[0].Sns.Message);
  var stage = AwsHelper.version; // get environment e.g: ci or prod
  params.stage = stage = (stage === '$LATEST' || !stage) ? 'ci' : stage;

  var resultsReturned = 0;
  if (!params.hotelIds || params.hotelIds && params.hotelIds.length === 0) {
    return callback(new Error('No hotel ids provided'));
  } else if (params.hotelIds && params.hotelIds.length > 0) {
    var hids = params.hotelIds.split(',').length;
    AwsHelper.log.info({ hotels: hids },
                       'Number of Hotel IDs to get packages for');

    setInterval(function () {
      if (context.getRemainingTimeInMillis() < 1000) {
        AwsHelper.log.info({ count: hids - resultsReturned },
                           'Hotels still remaining just before we time out');
      }
    }, 500).unref();
  }

  api_request(params, function (err, response) { // get packages from NE API
    var body = JSON.parse(JSON.stringify(params));
    delete body.hotelIds; // don't need hotelIds again https://git.io/voIAS
    body.items = []; // send an empty array to the client so it knows wazzup!
    body.searchComplete = true;
    AwsHelper.pushResultToClient(body, () => {
      AwsHelper.log.info({ err: err, packages: response.result.length },
        'Package search complete');
    });
    if (err || !response.result || response.result.length === 0) {
      return callback(new Error('No packages found'));
    } else {
      return callback(err, response.result.length);
    }
  }).on('result', function (body) {
    resultsReturned++;
    body.items = body.items.map(function (item) { // so update the list of items
      item.url = params.searchId + '/' + item.id; // to include an item.url
      return item;
    });

    AwsHelper.saveRecordToS3(body, function (err, data) {
      AwsHelper.log.trace({ err: err }, 'Saved Package to S3');
      delete body.hotelIds; // don't need hotelIds again https://git.io/voIAS
      body.items = body.items.map(mapper.minimiseBandwidth); // minimal fields
      body.searchComplete = false;
      AwsHelper.pushToSNSTopic(body, function (err, result) {
        AwsHelper.log.trace({ err: err },
          'Sending Packages to Client via WebSocket Server');
      });
    });
  });
};
