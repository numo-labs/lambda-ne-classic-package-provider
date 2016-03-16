var http_request = require('./http_request');

function make_path_from_params (params) {
  var path = (params.path || 'trips') + '?'; // default to trips if unset
  delete params.path;  // ensure you don't add it as a url query param.
  delete params.stage; // don't pass stage to api_request as a query parm.
  Object.keys(params).forEach(function (k, i) {
    path += k + '=' + params[k] + '&';
  });
  console.log(path);
  return path;
}

module.exports = function api_request (params, callback) {
  var stage = '/' + (params.stage || 'ci') + '/'; // extracted from sns topic
  var options = {
    // headers: {
    //   'Authorization': '6bf31b1ba54c63c35854a1454b2f8e43'
    // },
    port: 443,
    host: 'gm9oumnp1h.execute-api.eu-west-1.amazonaws.com',
    path: stage + make_path_from_params(params)
  };
  http_request(options, callback);
};
