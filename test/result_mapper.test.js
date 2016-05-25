// var api_request = require('../lib/api_request');
var assert = require('assert');
var fs = require('fs');
var path = require('path');
var dir = path.resolve(__dirname + '/sample_results/') + '/';
// Sample Hotels API Query Result Saved by the api_request.test.js
var sample_hotels_result_filename = dir + 'NE_hotels_without_trips.json';
var sample_hotels_result = require(sample_hotels_result_filename);
var HID = sample_hotels_result[0].wvId;

var sample_packages_result_filename = dir + 'NE_trips_with_hotels.json';
var sample_packages_result = require(sample_packages_result_filename);

var mapper = require('../lib/result_mapper');

describe('Map the hotel results by their hotel id', function () {
  it('map_hotels_by_hotel_id transforms an NE Hotels API query array into an object', function (done) {
    var hotelId = HID;
    var name = sample_hotels_result[0].name;
    var result = mapper.map_hotels_by_hotel_id(sample_hotels_result);
    // console.log(result[hotelId]);
    assert.equal(result[hotelId].name, name, 'Hotel name: ' + result[hotelId].name);
    done();
  });
});

describe('Map to extract relevant fields from hotel images', function () {
  it('map_hotels_by_hotel_id transforms an NE Hotels API query array into an object', function (done) {
    var hotelId = HID;
    var hotels_map = mapper.map_hotels_by_hotel_id(sample_hotels_result);
    // console.log(hotels_map[hotelId]);
    var result = mapper.map_hotel_images(hotels_map[hotelId].images);
    // console.log(result[0]);
    assert.equal(result[0].uri, hotels_map[hotelId].images[0].url);
    assert.equal(result.length, hotels_map[hotelId].images.length);
    var expected_keys = [ 'type', 'displaySequence', 'primary', 'uri' ];
    assert.deepEqual(Object.keys(result[0]), expected_keys);
    done();
  });
});

describe('Transform NE API Flight details to Standard Format', function () {
  it('list_package_flights transforms an NE flight details to array of flights', function (done) {
    var flights = sample_packages_result.result[0].packageOffer.flights; // list of flights
    var expected_keys = ['outbound', 'inbound'];
    assert.deepEqual(Object.keys(flights), expected_keys);
    done();
  });
});

describe('Get Currency Code from Market ID', function () {
  it('get_currency_code returns currency code from market id', function (done) {
    var result = mapper.get_currency_code('SD');
    assert.equal(result, 'DKK');
    var default_currency = mapper.get_currency_code('Timbuktu');
    assert.equal(default_currency, 'EUR');
    done();
  });
});

describe('Map results and hotels', function () {
  it('map_ne_result_to_graphql maps entire NE API result to GraphQL', function (done) {
    var result = sample_packages_result.result[0];
    assert(Object.keys(result.packageOffer.hotel).length > 5);
    fs.writeFileSync(__dirname + '/sample_results/formatted_packages.json',
      JSON.stringify(result, null, 2));
    done();
  });
});

var sample_packages_without_hotels = dir + 'NE_trips_without_hotels.json';
var sample_packages_result_without = require(sample_packages_without_hotels);

describe('Simulate Failure Where a hotels API does not return hotel detail', function () {
  it('map_ne_result_to_graphql returns early when no hotel details found', function (done) {
    var result = mapper.map_ne_result_to_graphql(sample_packages_result_without.result, sample_hotels_result);
    assert.equal(result.length, 0);
    done();
  });
});

describe('Use NE Product SKU as provider.reference', function () {
  it('SKU is made from destinationCode + hotelCode', function (done) {
    // var result = mapper.map_ne_result_to_graphql(sample_packages_result.result, sample_hotels_result.result);
    var result = sample_packages_result.result[0];

    var id = sample_packages_result.result[0].id;
    // console.log(pkg);
    // var ref = pkg.destinationCode + pkg.hotelCode;
    assert.equal(result.packageOffer.provider.reference, id);
    done();
  });
});
