require('env2')('.env');
var AwsHelper = require('aws-lambda-helper');
var http_request = require('./http_request');
var mapper = require('./result_mapper');
var STAGE = 'ci'; // re-assigned if necessary
var HOTEL_INFO_CACHE = {}; // use the lambda memory to server requests *even* faster

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
      AwsHelper.log.info({ err: err }, 'Error retrieving hotel info from API');
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
  var body = JSON.parse(JSON.stringify(params));
  // split the requests for packages into One API Request Per hotelId (parallel requests)
  if (params.hotelIds && params.hotelIds.length > 0) {
    var hids = params.hotelIds.split(',');
    var countdown = hids.length;
    var results = {totalHits: 0, result: []}; // collect all package results
    hids.forEach(function (hid, index) { // parallel queryies to API Gateway Cache
      var _params = JSON.parse(JSON.stringify(params)); // clone to avoid mutation
      _params.hotelIds = hid;
      var options = make_options(_params);
      var req = 'https://' + options.host + options.path;

      http_request(options, function (err, data) {
        // console.log(req);
        // console.log(' - - - - - - - - - - - - - ');
        if (err) {
          log.push({'api_request_error': err, 'hotelId': hid, request: req});
        }
        // only proceed if there is a Package result for the Hotel
        if (!err && data.result && data.result.length > 0) {
          data.totalHits = data.totalHits;
          log.push({'api_request': req, 'hits': data.totalHits});
          var pkg = [data.result.sort(sort_by_price_asc)[0]]; // get cheapest package

          get_hotel_info(hid, function (err, hotel_info) {
            // format one package result at a time:
            var records = mapper.map_ne_result_to_graphql(pkg, hotel_info);
            body.items = records;
            // push records to client via Websockets
            AwsHelper.pushResultToClient(body, function (err, result) {
              AwsHelper.log.info({ err: err }, 'Packages Pushed to Client');
            });
            results.result.push(records[0]);
            results.totalHits += data.totalHits;
            if (--countdown === 0) {
              AwsHelper.log.info({ 'results': log }, 'Package Results');
              return callback(err, results);
            }
          });
        } else { // each result is sent to the client as it is received from API
          if (--countdown === 0) { // so there's no need to send them here
            AwsHelper.log.info({ 'results': log }, 'Package Results');
            return callback(err, results);
          }
        }
      });
    });
  } else { // otherwise only one api request is required
    AwsHelper.log.info({'message': 'No Hotel Ids Supplied in SNS Message'});
    var options = make_options(params);
    http_request(options, function (err, data) {
      if (err) {
        AwsHelper.log.info({ err: err, packages: data.result.length }, 'No Hotels Package results');
        // should we attempt to inform the client that there was an error?
        body.items = [];
        AwsHelper.pushToSocketServer(body, function (e, res) {
          return callback(err);
        });
      }
      var packages = {}; // the easy way to dedupe the packages
      data.result.sort(sort_by_price_asc).forEach(function (res) {
        packages[res.wvHotelPartId] = res;
      });
      var unique_packages = Object.keys(packages).slice(0, 30).map(function (hid) { return packages[hid]; });
      var countdown = unique_packages.length;
      var hotels = [];
      Object.keys(packages).slice(0, 30).forEach(function (hid) {
        get_hotel_info(hid, function (err, hotel_info) {
          AwsHelper.log.info({ err: err }, 'Error retrieving hotel info');
          // assert(!err);
          hotels.push(hotel_info[0]);
          if (--countdown === 0) {
            AwsHelper.log.info({ err: err, 'results': log }, 'Package Results');
            body.items = mapper.map_ne_result_to_graphql(unique_packages, hotels);
            AwsHelper.pushResultToClient(body, function (err, result) {
              AwsHelper.log.info({ err: err }, 'Error Seding Packages to WebSocket Server');
            });
            return callback(err, {result: body.items, totalHits: data.result.length});
          }
        });
      });
    });
  }
};

module.exports.make_path_from_params = make_path_from_params;
