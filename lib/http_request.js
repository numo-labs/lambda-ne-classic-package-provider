/**
 * http_request is a bare-bones http request using node.js core http module
 * see: https://nodejs.org/api/http.html#http_http_request_options_callback
 * the NPM request module is 3.6 Megabytes and offers v. little benefit
 * this is 16 lines and uses 1kb - less code. faster responses.
 */
module.exports = function http_request (options, callback) {
  // check valid http request options are set
  if (!options || !options.host || !options.path) {
    var msg = 'http_request requires valid http request options.';
    throw new Error('ERROR: ' + __filename + ':13 \n' + msg);
  }
  // check for existence of a callback function
  if (!callback || typeof callback !== 'function') {
    var cmsg = 'please supply a callback as second parameter!';
    throw new Error('ERROR: ' + __filename + ':18 \n' + cmsg);
  }
  var req = require('https').request(options, function (res) {
    res.setEncoding('utf8');
    var resStr = '';
    res.on('data', function (chunk) {
      resStr += chunk;
    }).on('end', function () {
      return callback(null, JSON.parse(resStr)); // return response as object
    });
  });
  req.on('error', function (e) {
    return callback(e);
  });
  req.end();
};
