var api_request = require('../lib/api_request');
var assert = require('assert');

describe('api_request', function () {
  it('GET NE trips', function (done) {
    var params = { // leave "path" and "stage" unset
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

  it('GET NE hotels', function (done) {
    var params = {
      path: 'hotels',
      stage: 'ci', // there is no 'prod' API Gateway endpoint for now.
      hotelIds: '139891,10002,99281',
      adults: 2,
      allInclusive: 'true', // yes these values are strings not boolean!
      lmsOnly: 'true'
    };
    api_request(params, function (err, json) {
      assert(!err);
      console.log(json.result[0]);
      console.log('Result Count:', json.result.length);
      assert(json.result.length > 1);
      done();
    });
  });
});
