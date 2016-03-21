/**
 * get_age computes the age in years for a given date of birth
 * @param {String} date_of_birth_string - e.g: '1986-07-14'
 * see: // http://stackoverflow.com/a/7091965/1148249
 */
function get_age (date_of_birth_string) {
  var today = new Date();
  var birth_date = new Date(date_of_birth_string);
  var age = today.getFullYear() - birth_date.getFullYear();
  var m = today.getMonth() - birth_date.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth_date.getDate())) {
    age--;
  }
  return age;
}

/**
 * extract_search_params extracts the parameters from SNS Message
 * this will be extended as new parameters are added. see tests for format!
 */
function extract_search_params (sns_message_raw) {
  var msg = JSON.parse(sns_message_raw);
  var obj = { adults: 0, children: 0 };
  msg.data.query.passengers.forEach(function (p) {
    if (get_age(p.birthday) > 18) {
      obj.adults++;
    } else {
      obj.children++;
    }
  });
  return obj;
}

module.exports = extract_search_params;
module.exports.get_age = get_age;
