var AWS = require('aws-sdk');
AWS.config.update({region: 'eu-west-1'});
var DOC = require('dynamodb-doc');
var dynamo = new DOC.DynamoDB();
var SUBKEY;
var AwsHelper = require('aws-lambda-helper');

/**
 * insert uses dynamodb-doc (aws) module to insert the records
 * @param {String} env - the environment  e.g: ci or prod
 * @param {String} key - the bucketId for the search received in the SNS message
 * @param {String} record_str - String-ified JSON
 * @param {Function} callback - the function to call when results returned
 * as this is an *internal* callback we only send back the record (no error).
 */
function insert (env, key, record_str, callback) {
  SUBKEY++; // avoid duplicate key error!
  var item = {
    key: key.toString(),
    sortKey: SUBKEY.toString(),
    value: record_str
  };

  var next = function (err, data) { // local callback called once doc inserted
    handle_error(err);
    LIST.push(item.sortKey);
    callback(err, item);
  };
  dynamo.putItem({TableName: 'numo-insp-searchBuckets-' + env, Item: item}, next);
}

var LIST = []; // YES! its a GLOBAL!! :-O but its scoped to this module.
/**
 * batch_insert inserts records in a loop.
 * (the "standard" AWS batch inserter was throwing way too many errors...
 * we could re-investigate this when we decide to store more results)
 * @param {String} env - the environment  e.g: ci or prod
 * @param {String} key - the bucketId for the search received in the SNS message
 * @param {Array of Objects} results - an Array of Search Result Objects
 * note: results have already been converted to GraphQL Schema by result_mapper.
 * @param {Function} callback - the function to call when results returned
 * standard node params. e.g: function callback (err, response) { ... }
 */
module.exports = function batch_insert (env, id, results, callback) {
  LIST = []; // reset the LIST for each batch of inserts
  SUBKEY = Date.now();
  // var batches = Math.ceil(results / 30);
  var count = 0;
  var limit = results.length - 1;
  for (var i = limit; i > -1; i--) { // like using async.waterfall but faster.
    insert(env, id + '.package', JSON.stringify(results[i]), function (item) {
      if (count++ === limit) { // only insert the LIST of packages at the end!
        insert(env, id + '.packages', LIST.join(','), function (item) {
          callback(null, LIST);
        });
      }
    });
  }
};

var ERROR_COUNT = 0; // so we don't flood Kibana with identical errors
/**
 * Log DynamoDB Errors to Cloudwatch/Kibana
 */
function handle_error (err) {
  if (err && ERROR_COUNT++ < 5) {
    AwsHelper.log.error({ err: err }, 'DynamoDB Error');
    // console.log(err);
  } else {
    // do nothing
  }
}

module.exports.handle_error = handle_error;
