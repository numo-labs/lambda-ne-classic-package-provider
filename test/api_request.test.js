var api_request = require('../lib/api_request');
var assert = require('assert');
var fs = require('fs');
var path = require('path');
var dir = path.resolve(__dirname + '/sample_results/') + '/';
// console.log('>>' + dir);

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
      var sample_filename = dir + 'NE_trips_without_hotels.json';
      fs.writeFileSync(sample_filename, JSON.stringify(json, null, 2));
      // console.log(JSON.stringify(json.result[0], null, 2));
      console.log('Result Count:', json.result.length);
      assert(json.result.length > 10);
      assert(json.totalHits > 10);
      done();
    });
  });

  it('GET NE trips with hotels', function (done) {
    var params = { // leave "path" and "stage" unset
      adults: 2,
      children: 3,
      allInclusive: 'true', // yes these values are strings not boolean!
      lmsOnly: 'true',
      hotelIds: '139891,10002,99281'
    };
    api_request(params, function (err, json) {
      assert(!err);
      var sample_filename = dir + 'NE_trips_with_hotels.json';
      fs.writeFileSync(sample_filename, JSON.stringify(json, null, 2));
      // console.log(JSON.stringify(json.result[0], null, 2));
      console.log('Result Count:', json.result.length);
      assert(json.result.length > 10);
      assert(json.totalHits > 10);
      done();
    });
  });

  it('GET NE hotels (fetch additional info)', function (done) {
    var params = {
      path: 'hotels',
      stage: '$LATEST', // there is no 'prod' API Gateway endpoint for now.
      hotelIds: '139891,10002,99281',
      adults: 2,
      allInclusive: 'true', // yes these values are strings not boolean!
      lmsOnly: 'true'
    };
    api_request(params, function (err, json) {
      assert(!err);
      var sample_filename = dir + 'NE_hotels_without_trips.json';
      fs.writeFileSync(sample_filename, JSON.stringify(json, null, 2));
      // console.log(JSON.stringify(json.result[0], null, 2));
      console.log('Result Count:', json.result.length);
      assert(json.result.length > 1);
      done();
    });
  });
});
