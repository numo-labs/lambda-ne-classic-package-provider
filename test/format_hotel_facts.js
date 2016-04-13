var format_hotel_facts = require('../lib/format_hotel_facts');
var assert = require('assert');

describe('format_hotel_facts', function () {
  it('exit early if hotel does not have facts object', function (done) {
    var ne_hotel = 
    assert.ok(params.adults === 2, 'Two Adults');
    done();
  });

  it('extracts the bucketId from the SNS message', function (done) {
    var params = parse_sns(sns.Message);
    console.log(params);
    assert.ok(params.id === 'bd3c5c00-efa5-11e5-9ef8-c535434e66f5', 'Id extracted');
    done();
  });
});
