var api_request = require('../lib/api_request');
var assert = require('assert');
var fs = require('fs');
var path = require('path');
var dir = path.resolve(__dirname + '/sample_results/') + '/';
var AwsHelper = require('aws-lambda-helper');
// console.log('>>' + dir);

describe('api_request', function () {
  before(function (done) {
    AwsHelper.init({
      invokedFunctionArn: 'arn:aws:lambda:eu-west-1:123456789:function:mylambda:ci'
    });
    done();
  });

  it('Should not handle msgs that do not have hotelids', function (done) {
    var params = { // leave "path" and "stage" unset
      adults: 2,
      children: 3,
      allInclusive: 'true', // yes these values are strings not boolean!
      lmsOnly: 'true',
      hotelIds: '',
      searchId: 12345,
      id: 67890,
      userId: 'test'
    };
    api_request(params, function (err, json) {
      assert(err);
      assert.equal(err.message, 'No hotel ids provided');
      done();
    });
  });

  it('GET NE trips with hotels', function (done) {
    var params = { // leave "path" and "stage" unset
      adults: 2,
      children: 3,
      allInclusive: 'true', // yes these values are strings not boolean!
      lmsOnly: 'true',
      hotelIds: '139891,122133,14044,121633,109622,107706,10567,10564,10617,10573,11276',
      searchId: 12345,
      id: 67890,
      userId: 'test'
    };
    api_request(params, function (err, json) {
      assert.equal(err, null, 'No errors requesting results from API');
      var sample_filename = dir + 'NE_trips_with_hotels.json';
      fs.writeFileSync(sample_filename, JSON.stringify(json, null, 2));
      assert(json.result.length > 0);
      assert(json.totalHits > 0);
      done();
    });
  });

  it('GET NE trips with hotels (CACHE Test)', function (done) {
    var params = { // leave "path" and "stage" unset
      adults: 2,
      children: 3,
      allInclusive: 'true', // yes these values are strings not boolean!
      lmsOnly: 'true',
      hotelIds: '139891,122133,14044,121633,109622,107706,10567,10564,10617,10573,11276'
    };
    api_request(params, function (err, json) {
      assert.equal(err, null, 'No errors requesting results from API (CACHE)');
      assert(json.result.length > 0);
      assert(json.totalHits > 0);
      done();
    });
  });

  it('Force error by supplying invalid params to api_request', function (done) {
    var params = { // leave "path" and "stage" unset
      path: 'failure',
      unrecognised: 'this-will-fail'
    };
    api_request(params, function (err, json) {
      assert(err, 'should get an error');
      done();
    });
  });

  it('Force error by supplying invalid params to get_hotel_info', function (done) {
    api_request.get_hotel_info('fail', function (err, res) {
      assert(err.toString().indexOf('SyntaxError') > -1);
      done();
    });
  });

  it('GET NE hotel detail (fetch additional info)', function (done) {
    var hid = 139891;
    api_request.get_hotel_info(139891, function (err, json) {
      assert(!err);
      var sample_filename = dir + 'NE_hotels_without_trips.json';
      fs.writeFileSync(sample_filename, JSON.stringify(json, null, 2));
      assert.equal(json[0].wvId, hid);
      done();
    });
  });
});
