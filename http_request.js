var http = require('http');
module.exports = function request (options, callback) {
  var req = http.request(options, function (res) {
    options.method = options.method || 'GET';
    res.setEncoding('utf8');
    var resStr = '';
    res.on('data', function (chunk) {
      resStr += chunk;
    }).on('end', function () {
      var response = JSON.parse(resStr);
      return callback(null, response);
    });
  });
  req.on('error', function (e) {
    console.log('>>>> Problem with http request: ' + e.message);
    return callback(e);
  });
  req.end();
};
