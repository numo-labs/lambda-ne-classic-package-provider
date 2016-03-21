var parse_sns = require('../lib/parse_sns');
var assert = require('assert');

// yes this is how the SNS message arrives ...
var sns = {'Message': '{\"data\":{\"context\":{\"market\":\"dk\",\"language\":\"en-EN\",\"userId\":\"12345\"},\"query\":{\"passengers\":[{\"birthday\":\"1986-07-14\"},{\"birthday\":\"1986-07-14\"},{\"birthday\":\"2015-07-14\"}]}},\"id\":\"bd3c5c00-efa5-11e5-9ef8-c535434e66f5\"}'};
// var sns = JSON.parse(JSON.parse(sns.Message).default);
// console.log(JSON.stringify(sns, null, 2));

describe('parse_sns', function () {
  it('get number of children & adults from passengers array', function (done) {
    var params = parse_sns(sns.Message);
    assert.ok(params.adults === 2, 'Two Adults');
    // console.log(params);
    done();
  });
  it('extracts the bucketId from the SNS message', function (done) {
    var params = parse_sns(sns.Message);
    console.log(params);
    assert.ok(params.id === 'bd3c5c00-efa5-11e5-9ef8-c535434e66f5', 'Id extracted');
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
    var BORN_TOMORROW = D.getFullYear() + '-' + (D.getMonth() + 1) + '-' + (D.getDate() + 1);
    console.log('Tomorrow is:', BORN_TOMORROW);
    assert(parse_sns.get_age(BORN_TOMORROW) === -1);
    done();
  });
});