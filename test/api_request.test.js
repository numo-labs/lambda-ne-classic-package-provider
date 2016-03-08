var api_request = require('../lib/api_request');
var assert = require('assert');

describe('api_request', function () {
  it('call the nordics classic API', function (done) {
    var params = {
      adults: 2,
      children: 3,
      allInclusive: 'true', // yes these values are strings not boolean!
      lmsOnly: 'true'
    };
    api_request(params, function (err, json) {
      assert(!err);
      console.log(json.result[0]);
      console.log('Result Count:', json.result.length);
      assert(json.result.length > 10);
      assert(json.totalHits > 10);
      done();
    });
  });
});
