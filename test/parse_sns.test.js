var AwsHelper = require('aws-lambda-helper');
AwsHelper.init({
  invokedFunctionArn: 'arn:aws:lambda:eu-west-1:123456789:function:mylambda:ci'
});
var parse_sns = require('../lib/parse_sns');
var assert = require('assert');

// yes this is how the SNS message arrives ...
var sns = {'Message': '{\"context\":{\"searchId\":\"bd3c5c00-efa5-11e5-9ef8-c535434e66f5\",\"connectionId\":\"connection-abc123\",\"market\":\"dk\",\"language\":\"en-EN\",\"userId\":\"12345\"},\"query\":{\"passengers\":[{\"birthday\":\"1986-07-14\"},{\"birthday\":\"1986-07-14\"},{\"birthday\":\"2015-07-14\"}],\"hotels\":[\"hotel:NE.wvHotelPartId.197915\",\"hotel:NE.wvHotelPartId.197941\"]}}'};
var sns_no_hotels = {'Message': '{\"context\":{\"searchId\":\"123456\",\"market\":\"dk\",\"language\":\"en-EN\",\"userId\":\"12345\"},\"query\":{\"passengers\":[{\"birthday\":\"1986-07-14\"},{\"birthday\":\"1986-07-14\"},{\"birthday\":\"2015-07-14\"}]}}'};
// console.log('sns.Message:', JSON.stringify(JSON.parse(sns_no_hotels.Message), null, 2));

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
    // console.log(params);
    assert.ok(params.searchId === '123456', 'Id extracted');
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
    assert.equal(parsed.hotelDuration, 8);
    // assert.equal(parsed.departureDate, '2016-10-26');
    done();
  });
});
