var _ = { result: require('lodash.result') }; // see: https://git.io/vaRhs

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

// see: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort
function sort_by_priority_code_descending (a, b) {
  return (a.packageOffer.priorityCode < b.packageOffer.priorityCode)
  ? 1 : ((b.packageOffer.priorityCode < a.packageOffer.priorityCode) ? -1 : 0);
}

function map_ne_result_to_graphql (trip_results, hotels) {
  var hotels_map = map_hotels_by_hotel_id(hotels.result);

  return trip_results.map(function (result) {
    var hotel = _.result(hotels_map, result.wvHotelPartId);
    return {
      'packageOffer': {
        'priorityCode': result.priorityCode, // used for sorting display priority
        'hotel': {
          'id': _.result(hotel, 'id'),
          'name': _.result(hotel, 'name'),
          'images': map_hotel_images(hotel.images),
          'starRating': _.result(hotel, 'rating.guestRating'),
          'place': {
            'name': _.result(hotel, 'geographical.resortName'),
            'country': _.result(hotel, 'geographical.countryName'),
            'region': _.result(hotel, 'geographical.areaName')
          },
          'flights': {
            'outbound': list_package_flights(result.flightInfo.outFlight),
            'inbound': list_package_flights(result.flightInfo.homeFlight)
          },
          'price': {
            'total': result.price,
            'perPerson': result.paxPrice,
            'currency': get_currency_code(result.marketUnitCode)
          },
          'provider': {
            'id': 'lambda-searcher',
            'reference': result.tripId
          },
          'nights': result.hotelDuration
        }
      }
    };
  }).sort(sort_by_priority_code_descending); // return sorted results
}

module.exports = {
  map_hotels_by_hotel_id: map_hotels_by_hotel_id,
  map_hotel_images: map_hotel_images,
  get_currency_code: get_currency_code,
  list_package_flights: list_package_flights,
  map_ne_result_to_graphql: map_ne_result_to_graphql
};
