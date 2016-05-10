require('env2')('.env');
var http_request = require('./http_request');
var AwsHelper = require('aws-lambda-helper');

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
  AwsHelper.log.info({ path: path }, 'Generated path');
  return path;
}

function make_options (stage, params) {
  return {
    host: process.env.API_GATEWAY_ENDPOINT,
    port: 443,
    path: '/' + stage + '/' + make_path_from_params(params)
  };
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
  // var stage = (params.stage || 'ci') + '/'; // extracted from sns topic
  delete params.stage; // don't need this anymore and NE API does not like it.

  // split the requests for packages into one request per hotelId
  if (params.hotelIds && params.hotelIds.length > 1) {
    var hids = params.hotelIds.split(',');
    var countdown = hids.length;
    var results = {totalHits: 0, result: []}; // collect all package results
    hids.forEach(function (hid) { // send *many* queryies to API Gateway Cache
      var _params = JSON.parse(JSON.stringify(params)); // clone
      _params.hotelIds = hid;
      var options = make_options(stage, _params);
      http_request(options, function (err, data) {
        countdown--;
        // console.log(err, data.result.length);
        if (!err && data.result && data.result.length > 0) {
          data.result.forEach(function (item) {
            results.result.push(item);
          });
          results.totalHits += data.totalHits;
        }
        if (countdown === 0) {
          return callback(err, results);
        }
      });
    });
  } else { // otherwise only one api request is required
    var options = make_options(stage, params);
    return http_request(options, callback);
  }
};
