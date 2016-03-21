function get_age (dateString) { // http://stackoverflow.com/a/7091965/1148249
  var today = new Date();
  var birthDate = new Date(dateString);
  var age = today.getFullYear() - birthDate.getFullYear();
  var m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

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
