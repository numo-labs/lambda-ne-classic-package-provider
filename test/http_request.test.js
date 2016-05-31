var http_request = require('../lib/http_request');
var assert = require('assert');
var AwsHelper = require('aws-lambda-helper');

describe('http_request', function () {
  before(function (done) {
    AwsHelper.init({
      invokedFunctionArn: 'arn:aws:lambda:eu-west-1:123456789:function:mylambda:ci'
    });
    done();
  });

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

  it('make GET request to Valid NON-JSON url (error branch check)', function (done) {
    var options = {
      'host': 'github.com',
      'port': 443,
      'path': '/numo-labs'
    };
    http_request(options, function (e) {
      assert(e.toString().indexOf('Unexpected token <') > -1, 'ENOTFOUND');
      done();
    });
  });
});
