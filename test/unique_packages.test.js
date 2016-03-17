var assert = require('assert');
var fs = require('fs');
var path = require('path');
var dir = path.resolve(__dirname + '/sample_results/') + '/';
// Sample Hotels API Query Result Saved by the api_request.test.js
var filename = dir + 'NE_trips_without_hotels.json';
var sample_packages_result = JSON.parse(fs.readFileSync(filename, 'utf8'));

var unique_packages = require('../lib/unique_packages');

describe('Functional test for priorityCode sorting', function () {
  it('sort_by_priority_code_descending branch test', function (done) {
    var pkg = [
      { priorityCode: 1 },
      { priorityCode: 10 },
      { priorityCode: 5 },
      { priorityCode: 100 },
      { priorityCode: -1 }
    ];

    var results = pkg.sort(unique_packages.sort_by_priority_code_descending);
    console.log(results);
    assert.equal(results[0].priorityCode, 100);
    assert.equal(results[4].priorityCode, -1);
    done();
  });
});

describe('Select One Package for Each Hotel/Resort', function () {
  it('unique_packages gets unique packages from a set of results', function (done) {
    var results = unique_packages(sample_packages_result.result.sort()); // random
    console.log(results[0].priorityCode + ' > ' + results[results.length - 1].priorityCode);
    assert(results[0].priorityCode > results[results.length - 1].priorityCode);
    done();
  });
});
