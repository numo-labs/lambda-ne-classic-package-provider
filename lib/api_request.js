require('env2')('.env');
var http_request = require('./http_request');
var AwsHelper = require('aws-lambda-helper');
var CACHE = {}; // use the lambda memory to server requests *even* faster

/**
 * make_path_from_params constructs the string that is used to request
 * data from the nordics API.
 * @param {Object} params - the parameters for the search
 * e.g: {adults:2, children:1, allInclusive: 'true'}
 */
function make_path_from_params (params) {
  var path = (params.path || 'trips') + '?'; // default to trips if unset
  delete params.path;  // ensure we don't send un-recognised params to NE API.
  Object.keys(params).forEach(function (k, i) {
    path += k + '=' + params[k] + '&';
  });
  return path;
}

function make_options (stage, params) {
  return {
    host: process.env.API_GATEWAY_ENDPOINT,
    port: 443,
    path: '/' + stage + '/' + make_path_from_params(params)
  };
}

// sort by cheapest paxPrice
function sort_by_price_asc (a, b) { // as a user I want to see cheapest holidays
  return (a.paxPrice < b.paxPrice)
  ? 1 : ((b.paxPrice < a.paxPrice) ? -1 : 0);
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
  var stage = (params.stage === '$LATEST' || !params.stage) ? 'ci' : params.stage;
  var log = [];
  // split the requests for packages into one request per hotelId
  if (params.hotelIds && params.hotelIds.length > 1) {
    var hids = params.hotelIds.split(',');
    var countdown = hids.length;
    var results = {totalHits: 0, result: []}; // collect all package results
    hids.forEach(function (hid) { // send *many* queryies to API Gateway Cache
      var _params = JSON.parse(JSON.stringify(params)); // clone
      _params.hotelIds = hid;
      var options = make_options(stage, _params);
      if (CACHE[options.path]) {
        var result = CACHE[options.path];
        results.result.push(result);
        log.push({'api_request_cache': options.path});
        results.totalHits += 1;
        if (--countdown === 0) {
          AwsHelper.log.info({ 'results': log }, 'Package Results');
          return callback(null, results);
        }
      } else {
        http_request(options, function (err, data) {
          var req = 'https://' + options.host + options.path;
          log.push({'api_request': req, 'hits': data.totalHits});
          // console.log(err, data.result.length);
          if (!err && data.result && data.result.length > 0) {
            var result = data.result.sort(sort_by_price_asc)[0];
            CACHE[options.path] = result; // save this for later ;-)
            results.result.push(result);
            results.totalHits += data.totalHits;
          }
          if (--countdown === 0) {
            AwsHelper.log.info({ 'results': log }, 'Package Results');
            return callback(err, results);
          }
        });
      }
    });
  } else { // otherwise only one api request is required
    var options = make_options(stage, params);
    return http_request(options, callback);
  }
};

module.exports.make_path_from_params = make_path_from_params;
