var _ = { result: require('lodash.result') }; // see: https://git.io/vaRhs
var format_hotel_facts = require('./format_hotel_facts');
var path = require('path');
var img_map = require(path.resolve('./lib/ne-hotel-images-map.json'));
// console.log(' - - - - - - - - - - - - - - - - - imgs:');
// console.log(img_map['197915']);
// console.log(' - - - - - - - - - - - - - - - - - ');

function map_hotels_by_hotel_id (hotels) {
  return hotels.reduce(function (obj, hotel) {
    obj[hotel.wvId] = hotel;
    return obj;
  }, {});
}

function map_hotel_images (images) {
  return images.map(function (image) {
    return {
      'type': 'image/jpeg',
      'displaySequence': null,
      'primary': null,
      'uri': image.url
    };
  });
}
// see: https://github.com/numo-labs/lambda-ne-hotel-images
function map_large_hotel_images (hotel) {
  // console.log(hotel);
  var id = hotel.wvId;
  var images = img_map[id]['1280'] || img_map[id]['696'];
  return images.map(function (url) {
    return {
      'type': 'image/jpeg',
      'displaySequence': null,
      'primary': null,
      'uri': url
    };
  });
}

function list_package_flights (flights) {
  return flights.map(function (flight) {
    return {
      'number': 'na', // the NE API does not return a flight number!! :-(
      'departure': {
        'localDateTime': flight.departureTime,
        'airport': {
          'code': flight.departureStationCode,
          'name': flight.departureStationName
        }
      },
      'arrival': {
        'localDateTime': flight.arrivalTime,
        'airport': {
          'code': flight.destinationCode
        }
      },
      'carrier': {
        'code': flight.carrierCode
      }
    };
  });
}

function get_currency_code (market) {
  var currency;
  switch (market) {
    case 'SD':
      currency = 'DKK';
      break;
    default:
      currency = 'EUR';
  }
  return currency;
}

/**
 * map_ne_result_to_graphql does what its name suggests: maps NE API Search
 * results to the GraphQL SearchResults Schema so the results have the same
 * "shape" (fields/structure) as what the client expects.
 * @param {Object} trip_results - the trip results from NE API.
 * @param {Object} hotels_results - the hotel info result (images, rating, etc.)
 * please see readme for examples of both these params.
 */
function map_ne_result_to_graphql (trip_results, hotels_results) {
  var hotels_map = map_hotels_by_hotel_id(hotels_results);

  return trip_results.map(function (result) {
    var hotel = _.result(hotels_map, result.wvHotelPartId);
    if (!hotel) return; // return early if no hotel details for package
    // console.log(hotel);
    return {
      'packageOffer': {
        // priority code is not in the graphql schema...
        'priorityCode': result.priorityCode, // used for sorting display priority
        'hotel': {
          'id': _.result(hotel, 'id'),
          'name': _.result(hotel, 'name'),
          'images': {
            'small': map_hotel_images(_.result(hotel, 'images')),
            'large': map_large_hotel_images(hotel)
          },
          'starRating': _.result(hotel, 'rating.guestRating'),
          'place': {
            'name': _.result(hotel, 'geographical.resortName'),
            'country': _.result(hotel, 'geographical.countryName'),
            'region': _.result(hotel, 'geographical.areaName')
          },
          'description': hotel.description // ISEARCH-270
        },
        'flights': {
          'outbound': list_package_flights(result.flightInfo.outFlight),
          'inbound': list_package_flights(result.flightInfo.homeFlight)
        },
        'price': {
          'total': result.price,
          'perPerson': result.paxPrice,
          'currency': get_currency_code(result.marketUnitCode),
          'discountPrice': result.discountPrice // issues/32
        },
        'provider': {
          'id': 'lambda-searcher',
          'reference': result.destinationCode + result.hotelCode, // ISEARCH-248
          'deepLink': result.tripUrl // link to book the trip!
        },
        'nights': result.hotelDuration,
        'amenities': format_hotel_facts(hotel)
      }
    };
  }).filter(function (e) { return e !== undefined; });
}

module.exports = {
  map_hotels_by_hotel_id: map_hotels_by_hotel_id,
  map_hotel_images: map_hotel_images,
  get_currency_code: get_currency_code,
  list_package_flights: list_package_flights,
  map_ne_result_to_graphql: map_ne_result_to_graphql
};
