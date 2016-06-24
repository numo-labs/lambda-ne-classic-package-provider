var AwsHelper = require('aws-lambda-helper');

/**
 * get_age computes the age in years for a given date of birth
 * @param {String} date_of_birth_string - e.g: '1986-07-14'
 * see: // http://stackoverflow.com/a/7091965/1148249
 */
function get_age (date_of_birth_string) {
  var today = new Date();
  var birth_date = new Date(date_of_birth_string);
  var age = today.getFullYear() - birth_date.getFullYear();
  var m = today.getMonth() - birth_date.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth_date.getDate())) {
    age--;
  }
  return age;
}

/**
 * extract_search_params extracts the parameters from SNS Message
 * this will be extended as new parameters are added. see tests for format!
 */
function extract_search_params (sns_message_raw) {
  var msg = JSON.parse(sns_message_raw);
  var obj = {
    adults: 0,
    children: 0,
    searchId: msg.context.searchId, // github.com/numo-labs/lambda-search-request-handler/pull/57/
    id: msg.context.connectionId,
    userId: msg.context.userId
  };
  if (msg.query && msg.query.passengers && Array.isArray(msg.query.passengers)) {
    msg.query.passengers.forEach(function (p) {
      if (get_age(p.birthday) > 18) {
        obj.adults++;
      } else {
        obj.children++;
      }
    }); // use msg.data.content instead of msg.data.query as requested by Jimmy :-)
  }
  if (msg.content && msg.content.hotels && msg.content.hotels.length > 0) {
    AwsHelper.log.info({ query: msg.query }, 'Query from SNS');
    obj.hotelIds = msg.content.hotels.map(function (h) {
      return h.split('.')[2]; // e.g: hotel:NE.wvHotelPartId.197915
    }).join(',');
    // AwsHelper.log.info({ hotels: obj.hotelIds }, 'Hotel ids');
  }
  // travelPeriod.departureBetween
  if (msg.query.travelPeriod && msg.query.travelPeriod.departureBetween) {
    obj.departureDate = msg.query.travelPeriod.departureBetween[0];
  }
  // departureAirports
  if (msg.query.departureAirports && msg.query.departureAirports[0].indexOf('.') > -1) {
    obj.departureCode = msg.query.departureAirports[0].split('.')[1];
  }
  // number of nights
  if (msg.query.travelPeriod && msg.query.travelPeriod.nights) {
    obj.duration = msg.query.travelPeriod.nights[0];
  }
  return obj;
}

module.exports = extract_search_params;
module.exports.get_age = get_age;
