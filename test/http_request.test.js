var http_request = require('../lib/http_request');
var assert = require('assert');

describe('http_request', function () {
  it('issue a GET request to Guardian API (confirms internet accessible)', function (done) {
    var options = {
      'host': 'content.guardianapis.com',
      'path': '/search?api-key=test'
    };
    http_request(options, function (e, res) {
      assert.equal(res.response.pageSize, 10);
      done();
    });
  });

  it('make GET request to invalid url (error branch check)', function (done) {
    var options = {
      'host': 'example.jo',
      'path': '/thiswillfail'
    };
    http_request(options, function (e, res) {
      assert.equal(e.code, 'ENOTFOUND');
      done();
    });
  });
});
