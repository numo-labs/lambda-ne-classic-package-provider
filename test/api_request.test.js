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

  it('GET NE trips (without specifying hotels)', function (done) {
    var params = { // leave "path" and "stage" unset
      adults: 2,
      children: 3,
      allInclusive: 'true', // yes these values are strings not boolean!
      lmsOnly: 'true',
      searchId: 12345,
      id: 67890,
      userId: 'test'
    };
    api_request(params, function (err, json) {
      console.log(err);
      console.log(' - - - - - - - - - - - - - - - ');
      var sample_filename = dir + 'NE_trips_without_hotels.json';
      fs.writeFileSync(sample_filename, JSON.stringify(json, null, 2));
      // console.log(JSON.stringify(json.result[0], null, 2));
      // console.log('Result Count:', json.result.length);
      assert(json.result.length > 0);
      assert(json.totalHits > 0);
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
      assert(!err);
      var sample_filename = dir + 'NE_trips_with_hotels.json';
      fs.writeFileSync(sample_filename, JSON.stringify(json, null, 2));
      // console.log(JSON.stringify(json.result[0], null, 2));
      // console.log('Result Count:', json.result.length);
      assert(json.result.length > 0);
      assert(json.totalHits > 0);
      // console.log(JSON.stringify(json, null, 2));
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
      assert(!err);
      var sample_filename = dir + 'NE_trips_with_hotels.json';
      fs.writeFileSync(sample_filename, JSON.stringify(json, null, 2));
      // console.log(JSON.stringify(json.result[0], null, 2));
      // console.log('Result Count:', json.result.length);
      assert(json.result.length > 0);
      assert(json.totalHits > 0);
      // console.log(JSON.stringify(json, null, 2));
      done();
    });
  });

  it('Give api_request invalid params to force error branch', function (done) {
    var params = { // leave "path" and "stage" unset
      path: 'failure',
      unrecognised: 'this-will-fail'
    };
    api_request(params, function (err, json) {
      assert(err.toString().indexOf('TypeError') > -1);
      done();
    });
  });

  // it.only('Give api_request invalid params to force error (With Hotel IDs)', function (done) {
  //   var params = { // leave "path" and "stage" unset
  //     path: 'hotels',
  //     unrecognised: 'this-will-fail',
  //     hotelIds: '12345'
  //   };
  //   api_request(params, function (err, json) {
  //     console.log(' - - - - - - - - - - - - - - - ');
  //     console.log(err, json);
  //     console.log(' - - - - - - - - - - - - - - - ');
  //     assert(err.toString().indexOf('TypeError') > -1);
  //     done();
  //   });
  // });

  // it('GET NE hotels (fetch additional info)', function (done) {
  //   var params = {
  //     path: 'hotels',
  //     stage: '$LATEST', // there is no 'prod' API Gateway endpoint for now.
  //     hotelIds: '139891,122133,14044,121633,109622,107706,10567,10564,10617,10573,11276',
  //     adults: 2,
  //     allInclusive: 'true', // yes these values are strings not boolean!
  //     lmsOnly: 'true'
  //   };
  //   api_request(params, function (err, json) {
  //     assert(!err);
  //     var sample_filename = dir + 'NE_hotels_without_trips.json';
  //     fs.writeFileSync(sample_filename, JSON.stringify(json, null, 2));
  //     // console.log(JSON.stringify(json.result[0], null, 2));
  //     // console.log('Result Count:', json.result.length);
  //     assert(json.result.length > 0);
  //     done();
  //   });
  // });
});
