require('env2')('.env');
var AwsHelper = require('aws-lambda-helper');
var http_request = require('./http_request');
var mapper = require('./result_mapper');
var STAGE = 'ci'; // re-assigned if necessary
var HOTEL_INFO_CACHE = {}; // use lambda memory to serve requests even faster
var assert = require('assert');
var EventEmitter = require('events');
var A = require('async');

/**
 * make_path_from_params constructs the string that is used to request
 * data from the nordics API.
 * @param {Object} params - the parameters for the search
 * e.g: {adults:2, children:1, allInclusive: 'true'}
 */
function make_path_from_params (params) {
  var path = (params.path || 'trips') + '?'; // default to trips if unset
  delete params.path;  // ensure we don't send un-recognised params to NE API.
  delete params.searchId; // delete the params that the API does not recognise
  delete params.connectionId; // don't worry, this is a clone of the sns message
  delete params.userId; // so the params will still be sent back to client
  Object.keys(params).forEach(function (k, i) {
    path += k + '=' + params[k] + '&';
  });
  return path;
}

function make_options (params) {
  return {
    host: process.env.API_GATEWAY_ENDPOINT,
    port: 443,
    path: '/' + STAGE + '/' + make_path_from_params(params)
  };
}

// sort by cheapest paxPrice
function sort_by_price_asc (a, b) { // as a user I want to see cheapest holidays
  return (a.paxPrice < b.paxPrice)
  ? 1 : ((b.paxPrice < a.paxPrice) ? -1 : 0);
}

/**
 * get_hotel_info does exactly what it's name suggests; gets hotel info
 * from the NE API. the twist is that it first checks the Lambda's
 * HOTEL_INFO_CACHE and only does the http_request if it's not cached.
 * @param {Number} hid - the hotel id
 * @param {Function} callback - called once we have a result
 */
function get_hotel_info (hid, callback) {
  if (hid && HOTEL_INFO_CACHE[hid]) {
    return callback(null, HOTEL_INFO_CACHE[hid]);
  } else {
    var params = {hotelIds: hid, path: 'hotels'};
    var options = make_options(params);
    http_request(options, function (err, data) {
      if (err) {
        AwsHelper.log.info({ err: err }, 'Error retrieving hotel info from API');
        return callback(err, data);
      } else {
        HOTEL_INFO_CACHE[hid] = data.result; // cache for next time
        return callback(err, data.result);
      }
    });
  }
}

/**
 * api_request makes an https request to the API Gateway "Outbound" endpoint
 * which in turn makes the request to the NE "Classic" API (V2)
 * the reason for using the API Gateway is response Caching.
 * @param {Object} params - the parameters for the search
 * e.g: {adults:2, children:1, allInclusive: 'true'}
 * @param {Function} callback - the function to call when results returned
 * standard node params. e.g: function callback (err, response) { ... }
 */
module.exports = function api_request (params, callback) {
  var ee = new EventEmitter();
  process.nextTick(callApi);
  return ee;

  function callApi () {
    STAGE = (params.stage === '$LATEST' || !params.stage) ? 'ci' : params.stage;
    var body = JSON.parse(JSON.stringify(params));

    if (!params.hotelIds || params.hotelIds && params.hotelIds.length === 0) {
      return callback(new Error('No hotel ids provided'));
    }

    // split the requests for packages into One API Request Per hotelId (parallel requests)
    var hids = params.hotelIds.split(',');
    AwsHelper.log.info({ hotels: hids.length }, 'Number of Hotel IDs to get packages for');

    var totalHits = 0;
    A.mapLimit(
      hids,
      10,
      function iteratee (hid, done) {
        var _params = JSON.parse(JSON.stringify(params));
        _params.hotelIds = hid;
        var options = make_options(_params);
        var startedAt = Date.now();
        var req = 'https://' + options.host + options.path;
        http_request(options, function (err, data) {
          if (!err && data.result && Array.isArray(data.result) && data.result.length > 0) {
            var pkg = [data.result.sort(sort_by_price_asc)[0]]; // get cheapest package
            AwsHelper.log.trace({ delta: Date.now() - startedAt }, 'Amount of time to fetch packages');
            var startedAt2 = Date.now();
            get_hotel_info(hid, function (err, hotel_info) {
              /* istanbul ignore if */
              if (err) {
                AwsHelper.log.trace({get_hotel_info_error: err, hotelId: hid, request: req, date: new Date()}, 'Error fetching hotels');
                AwsHelper.log.warn({ err: err, hotelId: hid, request: req }, 'Unable to get hotel info');
                return done(null, null);
              }

              AwsHelper.log.trace({ delta: Date.now() - startedAt2 }, 'Amount of time to fetch hotel info');

              // format one package result at a time:
              var records = mapper.map_ne_result_to_graphql(pkg, hotel_info);
              body.items = records;
              AwsHelper.log.trace({'api_request': req, 'hits': data.totalHits, 'date': new Date()}, 'Api request: ' + data.hotelHits + ' hits');
              ee.emit('result', body);
              totalHits += data.totalHits;

              return done(null, records[0]);
            });
          } else {
            AwsHelper.log.trace({'api_request_error': err, 'hotelId': hid, request: req, date: new Date()}, 'Api request error');
            return done(null, null);
          }
        });
      },
      function (_err, results) {
        assert(!_err); // err is ALWAYS null (never callback with actual error)
        AwsHelper.log.info({ 'results': totalHits }, 'Package Results');
        results = results.filter(function (a) { return a !== null; });
        return callback(_err, { result: results, totalHits: totalHits });
      }
    );
  }
};

module.exports.get_hotel_info = get_hotel_info;
module.exports.make_path_from_params = make_path_from_params;
