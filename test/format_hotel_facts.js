var format_hotel_facts = require('../lib/format_hotel_facts');
var assert = require('assert');
var all_hotels = require('./sample_results/all_hotels.json');

describe('format_hotel_facts', function () {
  it('exit early if hotel does not have facts object', function (done) {
    var ne_hotel = {};
    var amenities = format_hotel_facts(ne_hotel);
    assert.deepEqual(amenities, {}, 'No Amenities');
    done();
  });

  it('process all_hotels to exercise all code branches', function (done) {
    var amenities = {};
    all_hotels.forEach(function (h) {
      var am = format_hotel_facts(h); // over-write
      Object.keys(am).forEach(function (k) {
        amenities[k] = amenities[k] || 1; // initialise to 1
        amenities[k] = am[k] ? amenities[k] + 1 : amenities[k]; // increment
      });
    });
    console.log('> Frequency of ocurrence for NE Amenities:\n', amenities);
    assert.ok(amenities.wifi > 300);
    done();
  });

  it('check how many hotels dont have ANY amenities', function (done) {
    var count = 0;
    all_hotels.forEach(function (h) {
      count = !h.facts ? count + 1 : count; // count how many hotels don't have facts
    });
    console.log(count + ' out of ' + all_hotels.length + ' Hotels do NOT have any facts (4Niki)');
    assert.ok(count === 0);
    done();
  });
});
