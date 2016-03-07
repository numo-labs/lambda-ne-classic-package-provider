var http_request = require('../lib/http_request');
var assert = require('assert');

describe('http_request', function () {
  it('issue a GET request to Guardian API (confirms internet accessible)', function (done) {
    // https://google.com/?#q=hello+world
    var options = {
      "host":"content.guardianapis.com",
      "path":"/search?api-key=test"
    };
    http_request(options, function(e, res){
      assert.equal(res.response.pageSize, 10);
      done();
    });
  });

  it('attempt to make request without options object', function (done) {
    // https://google.com/?#q=hello+world
    var options;
    try {
      http_request(options, function(e, res){
        console.log(e,res)
      });
    } catch (e) {
      console.log(e);
      done();
    }
  });
});
