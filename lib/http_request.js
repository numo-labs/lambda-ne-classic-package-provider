/**
 * simple_http_request is a bare-bones http request using node.js core http
 * see: https://nodejs.org/api/http.html#http_http_request_options_callback
 * the NPM request module is 3.6 Megabytes and offers v. little benefit...
 * These 8 lines achieve the same in less than 1kb. less code. faster responses.
 */
module.exports = function http_request (options, callback) {
  require('https').request(options, function (res) {
    res.setEncoding('utf8');
    var resStr = '';
    res.on('data', function (chunk) {
      resStr += chunk;
    }).on('end', function () {
      return callback(null, JSON.parse(resStr)); // return response as object
    });
  }).on('error', function (e) {
    return callback(e);
  }).end(); // end the request
};
