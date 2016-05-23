require('env2')('.env');
var assert = require('assert');
var AwsHelper = require('aws-lambda-helper');
var http_request = require('./http_request');
var mapper = require('./result_mapper');
var STAGE = 'ci'; // re-assigned if necessary
var HOTEL_INFO_CACHE = {}; // use the lambda memory to server requests *even* faster
var PACKAGE_CACHE = {}; // temporarily cache package info while we are running the request

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
  delete params.id; // don't worry, this is a clone of the original sns message
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

// we don't *care* if an Individual API requests fails
function handle_error_silently (err) {
  return;
}

/**
 * get_hotel_info does exactly what it's name suggests; gets hotel info
 * from the NE API. the twist is that it first checks the Lambda's 
 * HOTEL_INFO_CACHE and only does the http_request if it's not cached.
 * @param {Number} hid - the hotel id
 * @param {Function} callback - called once we have a result
 */
function get_hotel_info (hid, callback) {
  if(hid && HOTEL_INFO_CACHE[hid]) {
    return callback(null, HOTEL_INFO_CACHE[hid]);
  } else {
    var params = {hotelIds: hid, path: 'hotels'};
    var options = make_options(params);
    http_request(options, function (err, data) {
      assert(!err); // we've never had an error so far ...
      HOTEL_INFO_CACHE[hid] = data.result; // cache for next time
      return callback(err, data.result);
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
  STAGE = (params.stage === '$LATEST' || !params.stage) ? 'ci' : params.stage;
  var log = [];
  // split the requests for packages into One API Request Per hotelId (parallel requests)
  if (params.hotelIds && params.hotelIds.length > 0) {
    var hids = params.hotelIds.split(',');
    var countdown = hids.length;
    var results = {totalHits: 0, result: []}; // collect all package results
    hids.forEach(function (hid, index) { // parallel queryies to API Gateway Cache
      var _params = JSON.parse(JSON.stringify(params)); // clone to avoid mutation
      _params.hotelIds = hid;
      var options = make_options(_params);

      http_request(options, function (err, data) {
        if(err) {
          log.push({'api_request_error': err, 'hotelId': hid});
        }
        var req = 'https://' + options.host + options.path;
        log.push({'api_request': req, 'hits': data.totalHits});
        // only proceed if there is a Package result for the Hotel
        if (!err && data.result && data.result.length > 0) {
          var packages = [data.result.sort(sort_by_price_asc)[0]]; // take cheapest package
          // CACHE the hotel info so we don't have to waste API requests
          get_hotel_info(hid, function (err, hotel_info) {
            var records = mapper.map_ne_result_to_graphql(packages, hotel_info);
            // console.log(records[0]);
            // push the record back to the client
            var body = JSON.parse(JSON.stringify(params));
            body.items = records;
            AwsHelper.pushResultToClient(body, function (err, result) {
              assert(!err); // if we aren't able to push results to the client, give up!
            });
            results.result.push(records[0]);
            results.totalHits += data.totalHits;
            if (--countdown === 0) {
              AwsHelper.log.info({ 'results': log }, 'Package Results');
              return callback(err, results);
            }
          }) 
        }
        else {
          if (--countdown === 0) {
            AwsHelper.log.info({ 'results': log }, 'Package Results');
            return callback(err, results);
          }
        }
      });
    });
  }  else { // otherwise only one api request is required
    AwsHelper.log.info({ 'message': 'No Hotel Ids Supplied in SNS Message'  });
    var options = make_options(params);
    return http_request(options, function (err, data) {
      AwsHelper.log.info({ err: err, packages: data.result.length }, 'No Hotels Package results');
      console.log(data.result.length);
      return callback(err, data);
    });
  } 
};

module.exports.make_path_from_params = make_path_from_params;
