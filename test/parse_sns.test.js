require('env2')('.env');
var AwsHelper = require('aws-lambda-helper');
AwsHelper.init({
  invokedFunctionArn: 'arn:aws:lambda:eu-west-1:123456789:function:mylambda:ci'
});
var parse_sns = require('../lib/parse_sns');
var assert = require('assert');

var sns = require('./fixtures/sns_event_two_hotels.json').Records[0].Sns;
var sns_no_hotels = require('./fixtures/zero_hotels_sns_event.json').Records[0].Sns;

describe('parse_sns', function () {
  it('get number of children & adults from passengers array', function (done) {
    var params = parse_sns(sns.Message);
    assert.ok(params.adults === 2, 'Two Adults');
    // console.log(params);
    done();
  });
  it('extracts the bucketId from the SNS message', function (done) {
    var params = parse_sns(sns.Message);
    // console.log(params);
    assert.ok(params.searchId === 'bd3c5c00-efa5-11e5-9ef8-c535434e66f5', 'Id extracted');
    done();
  });
  it('extracts the connection id from the SNS message and writes to the id property', function (done) {
    var params = parse_sns(sns.Message);
    // console.log(params);
    assert.ok(params.id === 'connection-abc123', 'Id extracted');
    done();
  });
  it('Parse SNS without hotels', function (done) {
    var params = parse_sns(sns_no_hotels.Message);
    assert.ok(params.searchId === '12345', 'Id extracted');
    done();
  });
});

describe('get_age', function () {
  it('gets the age in years of a passenger given her birth date', function (done) {
    var DOB = '1986-07-14'; // Jimmy's test!
    assert(parse_sns.get_age(DOB) === 29);
    done();
  });
  it('gets the age of a newborn (born today!)', function (done) {
    var D = new Date();
    var NEW_BORN = D.getFullYear() + '-' + D.getMonth() + '-' + D.getDate();
    assert(parse_sns.get_age(NEW_BORN) === 0);
    done();
  });
  it('compute age of person born in the *future*!', function (done) {
    var D = new Date();
    D.setDate(D.getDate() + 1); // tomorrow is now + 1 day
    var BORN_TOMORROW = D.getFullYear() + '-' + (D.getMonth() + 1) + '-' + (D.getDate());
    console.log('    ✓ Tomorrow is:', BORN_TOMORROW);
    assert(parse_sns.get_age(BORN_TOMORROW) === -1);
    done();
  });
});

var sns_event_no_passengers = require('./fixtures/sns_event_no_passengers.json').Records[0].Sns;
// console.log(sns_event_no_passengers);
describe('Ensure parse does not explode if no passengers list', function () {
  it('regression test for issue 87', function (done) {
    var parsed = parse_sns(sns_event_no_passengers.Message);
    // console.log(parsed);
    assert.equal(parsed.adults, 0);
    assert.equal(parsed.children, 0);
    done();
  });
});

var complete_event = require('./fixtures/complete_sns_event.json');
// console.log(complete_event.Records[0].Sns.Message);
describe('Parse Complete SNS Message', function () {
  it('Including departureDate, departureAirport & Nights!', function (done) {
    var sns_msg = complete_event.Records[0].Sns.Message;
    // console.log(typeof sns_msg);
    // console.log(JSON.stringify(sns_msg.query, null, 2));
    var parsed = parse_sns(sns_msg);
    // console.log('parsed', parsed);
    assert.equal(parsed.departureCode, 'CPH');
    assert.equal(parsed.duration, 7);
    // assert.equal(parsed.departureDate, '2016-10-26');
    done();
  });
});
