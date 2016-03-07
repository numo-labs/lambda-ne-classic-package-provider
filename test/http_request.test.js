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

  it('attempt to make request without a callback (failure test)', function (done) {
    var options = { host: 'google.com', path: '/amaze' };
    try {
      http_request(options);
    } catch (e) {
      // console.log(e);
      assert(e.toString().indexOf('please supply a callback') > -1);
      done();
    }
  });

  it('attempt to make request without options object (failure test)', function (done) {
    var options;
    try {
      http_request(options);
    } catch (e) {
      // console.log(e);
      assert(e.toString().indexOf('http_request requires valid http request options') > -1);
      done();
    }
  });

  it('make GET request to invalid url (error branch check)', function (done) {
    var options = {
      'host': 'example',
      'path': '/thiswillfail'
    };
    http_request(options, function (e, res) {
      assert.equal(e.code, 'ENOTFOUND');
      done();
    });
  });
});
