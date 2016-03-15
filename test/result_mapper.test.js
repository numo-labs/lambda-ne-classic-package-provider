// var api_request = require('../lib/api_request');
var assert = require('assert');
var fs = require('fs');
var path = require('path');
var dir = path.resolve(__dirname + '/sample_results/') + '/';
// Sample Hotels API Query Result Saved by the api_request.test.js
var sample_hotels_result_filename = dir + 'NE_hotels_without_trips.json';
var sample_hotels_result = JSON.parse(fs.readFileSync(sample_hotels_result_filename, 'utf8'));
var sample_packages_result_filename = dir + 'NE_trips_with_hotels.json';
var sample_packages_result = JSON.parse(fs.readFileSync(sample_packages_result_filename, 'utf8'));

var mapper = require('../lib/result_mapper');

describe('Map the hotel results by their hotel id', function () {
  it('map_hotels_by_hotel_id transforms an NE Hotels API query array into an object', function (done) {
    var hotelId = '139891';
    var result = mapper.map_hotels_by_hotel_id(sample_hotels_result.result);
    assert.equal(result[hotelId].name, 'AC Iberia Las Palmas', 'Hotel name: ' + result[hotelId].name);
    done();
  });
});

describe('Map to extract relevant fields from hotel images', function () {
  it('map_hotels_by_hotel_id transforms an NE Hotels API query array into an object', function (done) {
    var hotelId = '139891';
    var hotels_map = mapper.map_hotels_by_hotel_id(sample_hotels_result.result);
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
    // console.log(sample_packages_result);
    var flights = sample_packages_result.result[0].flightInfo.outFlight; // list of flights
    var result = mapper.list_package_flights(flights);
    // console.log(result[0]);
    var expected_keys = [ 'number', 'departure', 'arrival', 'carrier' ];
    assert.deepEqual(Object.keys(result[0]), expected_keys);
    done();
  });
});

describe('Get Currency Code from Market ID', function () {
  it('get_currency_code returns currency code from market id', function (done) {
    var market = sample_packages_result.result[0].marketUnitCode;
    var result = mapper.get_currency_code(market);
    assert.equal(result, 'DKK');
    var default_currency = mapper.get_currency_code('Timbuktu');
    assert.equal(default_currency, 'EUR');
    done();
  });
});

describe('Map results and hotels', function () {
  it('map_ne_result_to_graphql map entire NE API result to GraphQL', function (done) {
    // console.log(sample_packages_result);
    var result = mapper.map_ne_result_to_graphql(sample_packages_result.result, sample_hotels_result);
    var expected_keys = [ 'id', 'name', 'images', 'starRating', 'place', 'flights', 'price', 'provider', 'nights' ];
    assert.deepEqual(Object.keys(result[0].packageOffer.hotel), expected_keys);
    done();
  });
});
