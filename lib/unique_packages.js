// sort by cheapest paxPrice
function sort_by_price (a, b) { // as a user I want to see cheapest holidays...?
  return (a.paxPrice < b.paxPrice)
  ? 1 : ((b.paxPrice < a.paxPrice) ? -1 : 0);
}

// see: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort
function sort_by_priority_code_descending (a, b) {
  return (a.priorityCode < b.priorityCode)
  ? 1 : ((b.priorityCode < a.priorityCode) ? -1 : 0);
}

/**
 * The *purpose* of this little function is to return a list of packages.
 * We only want *one* package/trip per hotel/resort to avoid having the same
 * hotel/resort featured multiple times in the search results.
 * also, I'm assuming that people want to see the cheapest option for each...
 * @param {Array of Objects} package_list - packages returned by NE /trips API
 */
module.exports = function filter_unique_packages (package_list) {
  var unique_packages = {}; // temporarly store the packages in an object
  package_list.sort(sort_by_price).forEach(function (pkg) {
    unique_packages[pkg.wvHotelPartId] = pkg; // fastest de-dupe
  });
  delete unique_packages['-1']; // remove the hotel with id '-1' from list!
  return Object.keys(unique_packages).map(function (id) {
    return unique_packages[id];
  }).sort(sort_by_priority_code_descending);
};
