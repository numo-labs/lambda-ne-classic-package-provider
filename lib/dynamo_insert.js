var AWS = require('aws-sdk');
AWS.config.update({region: 'eu-west-1'});
var DOC = require('dynamodb-doc');
var dynamo = new DOC.DynamoDB();
var uuid = require('node-uuid');

var fs = require('fs');
var path = require('path');
var filename = path.resolve(__dirname + '/../test/sample_results/results.json');
var results = JSON.parse(fs.readFileSync(filename, 'utf8'));

var list = [];

var id = uuid.v4();
var limit = 30;
var count = 0;
for (var i = limit; i > -1; i--) {
  console.log(results[i]);
  insert(id + '.package', JSON.stringify(results[i]), function (item) {
    if (count++ === limit) {
      console.log('DONE');
      console.log(list);
      insert(id + '.packages', list.join(','), function (item) {
        console.log(item.value);
      });
    }
  });
}

function insert (key, record_str, callback) {
  var subkey = Date.now();
  var item = {
    key: key,
    sortKey: subkey.toString(),
    value: record_str
  };

  var cb = function (err, data) {
    if (err) {
      console.log('ERROR:', err);
    } else {
      list.push(item.sortKey);
      callback(item);
    }
  };

  dynamo.putItem({TableName: 'numo-insp-searchBuckets-ci', Item: item}, cb);
}
