var AWS = require('aws-sdk');
AWS.config.update({region: 'eu-west-1'});
var DOC = require('dynamodb-doc');
var dynamo = new DOC.DynamoDB();

function insert (env, key, record_str, callback) {
  var subkey = Date.now();
  var item = {
    key: key.toString(),
    sortKey: subkey.toString(),
    value: record_str
  };

  var next = function (err, data) {
    handle_error(err);
    LIST.push(item.sortKey);
    callback(item);
  };
  dynamo.putItem({TableName: 'numo-insp-searchBuckets-' + env, Item: item}, next);
}

var LIST = []; // YES! its a GLOBAL!! :-O but its scoped to this module.

module.exports = function batch_insert (env, id, results, callback) {
  LIST = []; // reset the LIST for each batch of inserts
  var count = 0;
  var limit = results.length - 1;
  for (var i = limit; i > -1; i--) {
    insert(env, id + '.package', JSON.stringify(results[i]), function (item) {
      if (count++ === limit) { // only insert the LIST of packages at the end!
        insert(env, id + '.packages', LIST.join(','), function (item) {
          callback(null, LIST);
        });
      }
    });
  }
};

function handle_error (err) { // this is for semistandard ...
  if (err) {
    console.log(err);
  } else {
    // do nothing
  }
}

module.exports.handle_error = handle_error;
