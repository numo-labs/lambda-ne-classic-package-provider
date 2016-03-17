var assert = require('assert');
var uuid = require('node-uuid');
var fs = require('fs');
var path = require('path');
var filename = path.resolve(__dirname + '/../test/sample_results/results.json');
var results = JSON.parse(fs.readFileSync(filename, 'utf8'));
var batch_insert = require('../lib/dynamo_insert');

describe('Isert a Batch of NE Packages into DynamoDB', function () {
  it('batch_insert does what you expect it to.', function (done) {
    var id = uuid.v4();
    var batch = results.slice(0, 6);
    // console.log(batch.length);
    batch_insert('ci', id, batch, function (err, data) {
      console.log(err, data.join(','));
      // console.log('DONE');
      assert.equal(data.length - 1, batch.length);
      done();
    });
  });
});

describe('Keep semistandard happy', function () {
  it('invoke mock error handler', function (done) {
    batch_insert.handle_error();
    batch_insert.handle_error('    ✓ we love you semistandard!');
    done();
  });
});
