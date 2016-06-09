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
var all_hotels = require(dir + 'all_hotels.json');

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

  it('map_hotels_by_hotel_id returns empty if no hotels supplied', function (done) {
    var result = mapper.map_hotels_by_hotel_id();
    assert.deepEqual(result, {}, 'no hotels');
    done();
  });
});

describe('Large Hotel Images', function () {
  it('map_large_hotel_images returns default image if large unavailable', function (done) {
    all_hotels.forEach(function (hotel) {
      var images = mapper.map_large_hotel_images(hotel);
      if (images.length < 1) {
        var img_url = 'http://images1.spies.dk/images/SiteID11/SitePage/hotelbillede_mangler_975_350.jpg';
        assert.equal(images[0].uri, img_url);
      } else {
        assert(images.length > 0);
      }
    });
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
    assert.equal(result.type, 'package'); // https://git.io/vrx7l (issues/75)
    fs.writeFileSync(__dirname + '/sample_results/formatted_packages.json',
      JSON.stringify(result, null, 2)); // save sample result for reference
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

describe('Format result for client (reduce amount of data sent)', function () {
  it('minimiseBandwidth reduces the amount of data sent to the client', function (done) {
    // var result = mapper.map_ne_result_to_graphql(sample_packages_result.result, sample_hotels_result.result);
    var item = sample_packages_result.result[0];
    item.url = '/123456/' + item.id; // by default results don't have url
    var min = mapper.minimiseBandwidth(item);
    // console.log(JSON.stringify(min, null, 2));
    assert.equal(item.type, min.type);
    assert.equal(item.id, min.id);
    assert.equal(item.url, min.url);
    assert.equal(item.url, min.url);
    assert.equal(min.packageOffer.hotel.images.small.length, 1, 'only one small image returned to client');
    assert.deepEqual(min.packageOffer.hotel.place, item.packageOffer.hotel.place);
    assert.equal(min.packageOffer.hotel.concept, item.packageOffer.hotel.concept);
    assert.equal(min.packageOffer.hotel.starRating, item.packageOffer.hotel.starRating);
    assert.deepEqual(item.packageOffer.flights, min.packageOffer.flights);
    assert.equal(item.packageOffer.price, min.packageOffer.price);
    assert.deepEqual(item.packageOffer.provider, min.packageOffer.provider);
    assert.equal(item.packageOffer.nights, min.packageOffer.nights);
    // save sample result
    fs.writeFileSync(__dirname + '/sample_results/minified_package.json',
      JSON.stringify(min, null, 2)); // save sample result for reference
    // outcome
    var itemLength = JSON.stringify(item).length;
    var minlength = JSON.stringify(min).length;
    assert(minlength < itemLength / 2);
    console.log('   > Saved:',
      Math.floor(((itemLength - minlength) / itemLength) * 100) + '% bandwidth!');
    done();
  });
});
