
var http = require('http'); // no SSL on localhost

/**
 * http_request is a bare-bones http request using node.js core http module
 * see: https://nodejs.org/api/http.html#http_http_request_options_callback
 * the NPM request module is 3.6 Megabytes and offers v. little benefit
 */
module.exports = function http_request(options, callback) {
  // check valid http request options are set
  if(!options || !options.host || !options.path){
    var msg = "http_request requires valid http request options."
    throw "ERROR: " + __filename + ":13 \n" + msg;
  }
  // check for existence of a callback function
  if(!callback || typeof callback !== 'function') {
    var cmsg = "please supply a callback as second parameter!"
    throw "ERROR: " + __filename + ":18 \n" + cmsg;
  }
  var req = http.request(options, function(res) {
    res.setEncoding('utf8');
    var resStr = '';
    res.on('data', function (chunk) {
      resStr += chunk;
    }).on('end', function () {
        return callback(null, JSON.parse(resStr)); // return response as object
    });
  })
  // if you have a better suggestion for error handling please submit an issue!
  req.on('error', function(e) {
    console.log('>> Problem with http request: ' + e.message);
    return callback(e);
  });
  // write to request body if passed to options
  if (options.body) {
    req.write(JSON.stringify(options.body));
  }
  req.end();
}
