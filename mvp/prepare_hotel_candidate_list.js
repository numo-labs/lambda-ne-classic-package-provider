var start = Date.now();
var http_request = require('../lib/http_request');
var fs = require('fs');
var path = require('path');
var assert = require('assert');
var hotels_path = path.resolve(__dirname + '/hotels') + '/';

function api_request (path, callback) {
  var options = {
    headers: {
      'Authorization': '6bf31b1ba54c63c35854a1454b2f8e43'
    },
    port: 443,
    host: 'partnerapi.thomascook.se',
    path: path
  };
  http_request(options, callback);
}

// see: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort
function sort_by_guest_rating_decending (a, b) {
  return (a.rating.guestRating < b.rating.guestRating)
  ? 1 : ((b.rating.guestRating < a.rating.guestRating) ? -1 : 0);
}

var base = '/sd/hotels/';
// the first digit in the path is "Skip" and the second is "Take"
// so 31/30 means skip the first 31 results and take the next 30
// var range = ['0/100', '101/100', '201/100', '301/100']; // use this one to test
var range = ['0/1000', '1001/1000', '2001/1000', '3001/1000']; // all the hotels!
var count = range.length;
var all_hotels = []; // ALL the hotels are temporarily stored in this array

range.forEach(function (batch) { // parallel requests
  api_request(base + batch, function (err, res) {
    assert(!err);
    res.Result.sort(sort_by_guest_rating_decending).forEach(function (item) {
      all_hotels.push(item);
    });
    // var filename = hotels_path + path.replace('/','-') + '.json';
    // fs.writeFileSync(filename, JSON.stringify(sorted, null, 2));
    console.log('Count:', all_hotels.length);
    if (--count === 0) { // once all requests are done

      var all_hotels_file = hotels_path + 'all_hotels.json'; // ALL The Hotels!
      fs.writeFileSync(all_hotels_file, JSON.stringify(all_hotels, null, 2));

      var candidate_list = all_hotels.sort(sort_by_guest_rating_decending)
        // .slice(0, 1000) // limit the number in the candidate_list (optional)
        .map(function (item) { return item.wvId; });

      var filename = __dirname + '/candidate_list.csv';
      console.log('candidate_list:', filename);
      fs.writeFileSync(filename, candidate_list.join(','));

      var end = Date.now();
      console.log('done. results:', all_hotels.length);
      console.log('Time taken: ' + (end - start) + ' ms');
    }
  });
});
