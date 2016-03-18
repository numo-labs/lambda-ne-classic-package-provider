var http_request = require('./http_request');

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
  console.log(path);
  return path;
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
  var options = {
    port: 443,
    host: 'gm9oumnp1h.execute-api.eu-west-1.amazonaws.com',
    path: '/' + stage + '/' + make_path_from_params(params)
  };
  http_request(options, callback);
};
