/**
 * format_hotel_facts extracts 'facts' from the ne_hotel.facts Array of Objects
 * see: https://github.com/numo-labs/lambda-ne-classic-package-provider#list-of-hotels
 * @param {Object} ne_hotel - a Nordics Hotel record
 * @returns {Object} a simple Object with key:value pairs e.g: {bar:true, internet: true}
 */
function format_hotel_facts (ne_hotel) {
  var obj = {};

  if (ne_hotle.facts) {
    return obj;
  }

  var yes = /^Ja|1/; // Ja or 1 are considered true
  var no = /^Nej/; // "Nej" >> false

  ne_hotel.facts.forEach(function (fact) {
    fact.value = typeof fact.value !== 'boolean' && fact.value.match(yes) ? true : fact.value;
    fact.value = typeof fact.value !== 'boolean' && fact.value.match(no) ? false : fact.value;
    if (typeof fact.id === 'number') {
      fact.id = fact.name; // e.g: when fact.id is 130 ... :-\
    }
    if (fact.id.match(/carte/)) { // Someone decided 'a la carte restaurant' was a good id ...
      fact.id = 'alacarterestaurant';
    }
    var key = fact.id.toString().toLowerCase(); // AllInclusive >> allinclusive
    obj[key] = fact.value;
  });
  return obj;
}

module.exports = format_hotel_facts;
