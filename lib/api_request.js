var http_request = require('./http_request');

function make_path_from_params (params) {
  var path = 'trips?';
  Object.keys(params).forEach(function (k, i) {
    path += k + '=' + params[k] + '&';
  });
  console.log(path);
  return path;
}

module.exports = function api_request (params, callback) {
  var options = {
    port: 443,
    headers: {
      'Authorization': '6bf31b1ba54c63c35854a1454b2f8e43'
    },
    host: 'gm9oumnp1h.execute-api.eu-west-1.amazonaws.com',
    path: '/ci/' + make_path_from_params(params)
  };
  http_request(options, callback);
};
