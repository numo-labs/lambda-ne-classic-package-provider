var assert = require('assert');
var fs = require('fs');
var path = require('path');
var dir = path.resolve(__dirname + '/sample_results/') + '/';
// Sample Hotels API Query Result Saved by the api_request.test.js
var filename = dir + 'NE_trips_without_hotels.json';
var sample_packages_result = JSON.parse(fs.readFileSync(filename, 'utf8'));

var unique_packages = require('../lib/unique_packages');

describe('Select One Package for Each Hotel/Resort', function () {
  it('unique_packages gets unique packages from a set of results', function (done) {
    var results = unique_packages(sample_packages_result.result);
    console.log(results[0].priorityCode + ' > ' + results[50].priorityCode);
    assert(results[0].priorityCode > results[50].priorityCode);
    done();
  });
});
