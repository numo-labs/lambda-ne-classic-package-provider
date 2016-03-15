## Lambda Northern Europe (NE) Classic Package (Holiday) Provider

A lambda function that listens to an SNS topic,
makes a call to the Nordics' Price and Availability ("*Price & Avail*")
cache API and adds the results to a corresponding (DynamoDB) search bucket.

## API Gateway *Reverse Proxy*

In order to use the caching features of the AWS API Gateway
to cache requests made to the Nordics API, we need to create
an API Gateway endpoint.

Instead of directly calling the NE API endpoint, we use the following setup:

![lambda-api-gateway-reverse-proxy](https://cloud.githubusercontent.com/assets/194400/13613013/2a9d58ec-e562-11e5-81ca-27483c8b8c6c.png)

This meant that we had to create an API Gateway endpoint to serve as the
reverse-proxy.


Our "*internal*" API is available on:
+ https://gm9oumnp1h.execute-api.eu-west-1.amazonaws.com/ci/trips or
+ https://gm9oumnp1h.execute-api.eu-west-1.amazonaws.com/ci/hotels

This re-routes to:
+ http://partnerapi.thomascook.se/sd/trips and
+ http://partnerapi.thomascook.se/sd/hotels *respectively*

at present this is pointing to the *Denmark* (`sd`) endpoint for our MVP,
but when we roll-out to more markets it will be 5 minutes of API Gateway setup
(*per NE region*) and roughly 20 mins to *map* the URL query parameters for
other regions.



## *Sample* NE Classic API Request & Response:

### List of Trips for a 2 adults & 3 children

When we request a list of ***trips*** with the following parameters:
```js
{
  adults: 2,
  children: 3
}
```

This translates to the following API Path:
```sh
/trips?adults=2&children=3
```

Sample response (*just one trip*):
```sh
{
  "type": "UpdateTripInfo",
  "marketUnitCode": "SD",
  "departureCode": "BLL",
  "destinationCode": "LPA",
  "departureDate": "2016-08-24T00:00:00",
  "vitsSerialNumber": "31",
  "vitsClassCode": "E",
  "hotelCode": "ALTA",
  "hotelDuration": 21,
  "duration": 22,
  "roomTypeCode": "A22CLL",
  "flightAllotment": 4,
  "hotelProductCode": "GA",
  "price": 34845,
  "numberOfAdults": 2,
  "numberOfChildren": 3,
  "paxPrice": 7549,
  "discountPrice": 0,
  "discountTotal": 0,
  "numberOfRooms": 2,
  "priorityCode": 68,
  "wvHotelPartId": 10861,
  "preloadedPriceId": 315593779,
  "boardCode": "N ",
  "insertedDate": "2015-12-06T03:56:01.327",
  "tripId": 59724601,
  "flightInfo": {
    "outFlight": [
      {
        "destinationCode": "LPA",
        "departureStationCode": "BLL",
        "serialNumber": "31",
        "aircraftCode": "A321",
        "carrierCode": "DK",
        "flightTime": "0510",
        "departureStationName": "Billund",
        "destinationName": "Gran Canaria",
        "carrierName": "Thomas Cook Airlines",
        "classCode": "E",
        "className": "Economy Class",
        "airCraftName": "Airbus A321",
        "destinationCountryCode": "ES",
        "startTime": "0001-01-01T00:00:00",
        "departureTime": "2016-08-24T08:20:00",
        "arrivalTime": "2016-08-24T12:30:00",
        "checkinTime": "2016-08-24T07:20:00",
        "displayDepartureDateTime": "2016-08-24T08:20:00",
        "destinationCountryName": "Spanien",
        "departureCountryName": "Danmark"
      }
    ],
    "homeFlight": [
      {
        "destinationCode": "BLL",
        "departureStationCode": "LPA",
        "serialNumber": "31",
        "aircraftCode": "A321",
        "carrierCode": "DK",
        "flightTime": "0450",
        "departureStationName": "Gran Canaria",
        "destinationName": "Billund",
        "carrierName": "Thomas Cook Airlines",
        "classCode": "E",
        "className": "Economy Class",
        "airCraftName": "Airbus A321",
        "destinationCountryCode": "DK",
        "startTime": "0001-01-01T00:00:00",
        "departureTime": "2016-09-14T13:50:00",
        "arrivalTime": "2016-09-14T19:40:00",
        "checkinTime": "0001-01-01T00:00:00",
        "displayDepartureDateTime": "2016-09-14T13:50:00",
        "destinationCountryName": "Danmark",
        "departureCountryName": "Spanien"
      }
    ]
  },
  "roomTypeDescription": "2-værelses Club Room, lavt beliggende",
  "boardCodeDescription": "Ingen måltider",
  "available": true,
  "indexedDate": "2015-12-06T04:01:44.5825643+01:00",
  "tripUrl": "http://www.spies.dk/redir/BookRedirect.aspx?departureDate=2016-08-24&duration=22&departureCode=BLL&destinationCode=LPA&transportSerial=31&transportClass=E&hotelCode=ALTA&roomType=A22CLL",
  "isLastMinuteSale": false
}
```

### List of Hotels

Given a list of trips (*from the trips API endpoint*) we still need to lookup
the Hotel details in order to get the photos, ratings, location, etc.

So, imagine that you searched the `/trips` API endpoint for 2 adults and 3 children
(*see above for result sample*) you would then need to *extract* the HotelID
from the packages results and *then* make a request to the `/hotels` endpoint
to get the additional data. in the NE API the hotel has the key: `wvHotelPartId`
e.g: `"wvHotelPartId": 10861`

```sh
/hotels?hotelIds=10861
```

```json
{
  "wvId": 10861,
  "caId": 8857,
  "name": "Altamar",
  "description": "Altamar er verdens mest klassiske Spies-hotel. Her kan vi tilbyde særlige Simon Spies-suiter, som blandt andet er indrettet med festlige indslag fra Simon. Vi kan også tilbyde Spies Easy Travel, som gør din rejse nemmere.\n\nPå Altamar får du de perfekte rammer for familiens ferie sammen - intet mindre. Det er et efterspurgt og meget værdsat Family Garden, som ligger højt og roligt på en sydvendt bjergskråning lige uden for Puerto Rico med en storslået udsigt over havet. Her findes alt, hvad der skal til, for at hele familien får en dejlig og afslappet ferie: opvarmede pools i vinterhalvåret, en hyggelig restaurant samt lejligheder til op til 5 personer.",
  "rating": {
    "guestRating": 4.4,
    "doubledRating": 7
  },
  "geographical": {
    "countryId": 179,
    "countryName": "Spanien",
    "areaId": 108069,
    "areaName": "Gran Canaria",
    "resortId": 605,
    "resortName": "Puerto Rico"
  },
  "location": {
    "latitude": 27.7886658,
    "longitude": -15.7194166
  },
  "url": "http://www.spies.dk/de-kanariske-oer/puerto-rico/altamar",
  "concept": {
    "id": "familyGarden",
    "title": "Family Garden"
  },
  "images": [
    {
      "url": "http://images1.spies.dk/images/Hotel/LPAALTA1093_1_13.jpg?v=17",
      "description": "",
      "width": 696,
      "height": 307
    },
    {
      "url": "http://images1.spies.dk/images/Hotel/LPAALTA1093_2_30.jpg?v=47",
      "description": "Fra Altamar har du en fantastisk udsigt over Atlanterhavet",
      "width": 1280,
      "height": 853
    },
    {
      "url": "http://images1.spies.dk/images/Hotel/LPAALTA1093_3_15.jpg?v=17",
      "description": "",
      "width": 232,
      "height": 131
    },
    {
      "url": "http://images1.spies.dk/images/Hotel/LPAALTA1093_4_14.jpg?v=17",
      "description": "",
      "width": 380,
      "height": 215
    },
    {
      "url": "http://images1.spies.dk/images/Hotel/LPAALTA1093_5_32.jpg?v=17",
      "description": "",
      "width": 170,
      "height": 113
    },
    {
      "url": "http://images1.spies.dk/images/Hotel/LPAALTA1093_6_16.jpg?v=17",
      "description": "",
      "width": 210,
      "height": 118
    },
    {
      "url": "http://images1.spies.dk/images/Hotel/LPAALTA1093_7_20.jpg?v=17",
      "description": "",
      "width": 136,
      "height": 77
    },
    {
      "url": "http://images1.spies.dk/images/Hotel/LPAALTA1093_8_17.jpg?v=17",
      "description": "",
      "width": 210,
      "height": 196
    },
    {
      "url": "http://images1.spies.dk/images/Hotel/LPAALTA1093_10_51.jpg?v=22",
      "description": "Fra Altamar har du en fantastisk udsigt over Atlanterhavet",
      "width": 975,
      "height": 350
    },
    {
      "url": "http://images1.spies.dk/images/Hotel/LPAALTA1093_9_46.jpg?v=13",
      "description": "",
      "width": 209,
      "height": 117
    },
    {
      "url": "http://images1.spies.dk/images/Hotel/LPAALTA1150_2_30.jpg?v=22",
      "description": "2-værelses Club Room-lejlighed med stor balkon",
      "width": 1280,
      "height": 853
    },
    {
      "url": "http://images1.spies.dk/images/Hotel/LPAALTA1154_2_30.jpg?v=22",
      "description": "2-værelses Club Room-lejlighed med stor balkon",
      "width": 1280,
      "height": 853
    },
    {
      "url": "http://images1.spies.dk/images/Hotel/LPAALTA1164_2_30.jpg?v=1",
      "description": "",
      "width": 1280,
      "height": 853
    },
    {
      "url": "http://images1.spies.dk/images/Hotel/LPAALTA1105_2_30.jpg?v=47",
      "description": "1-værelses Simon Spies-suite til 2-3 personer",
      "width": 1280,
      "height": 853
    },
    {
      "url": "http://images1.spies.dk/images/Hotel/LPAALTA1107_2_30.jpg?v=47",
      "description": "1-værelses Simon Spies-suite til 2-3 personer",
      "width": 1280,
      "height": 853
    },
    {
      "url": "http://images1.spies.dk/images/Hotel/LPAALTA1110_2_29.jpg?v=29",
      "description": "1-værelses Simon Spies-suite til 2-3 personer",
      "width": 631,
      "height": 960
    },
    {
      "url": "http://images1.spies.dk/images/Hotel/LPAALTA1081_2_30.jpg?v=47",
      "description": "Legeplads til børnene",
      "width": 1280,
      "height": 853
    },
    {
      "url": "http://images1.spies.dk/images/Hotel/LPAALTA1136_2_29.jpg?v=29",
      "description": "På Family Garden Altamar trives alle børn",
      "width": 631,
      "height": 960
    },
    {
      "url": "http://images1.spies.dk/images/Hotel/LPAALTA1122_2_29.jpg?v=29",
      "description": "Carlos - en af de populære tjenere i restauranten",
      "width": 631,
      "height": 960
    },
    {
      "url": "http://images1.spies.dk/images/Hotel/LPAALTA1052_2_29.jpg?v=29",
      "description": "",
      "width": 631,
      "height": 960
    },
    {
      "url": "http://images1.spies.dk/images/Hotel/LPAALTA1119_2_30.jpg?v=47",
      "description": "",
      "width": 1280,
      "height": 853
    },
    {
      "url": "http://images1.spies.dk/images/Hotel/LPAALTA1160_2_30.jpg?v=16",
      "description": "",
      "width": 1280,
      "height": 853
    },
    {
      "url": "http://images1.spies.dk/images/Hotel/LPAALTA1132_2_29.jpg?v=29",
      "description": "",
      "width": 631,
      "height": 960
    },
    {
      "url": "http://images1.spies.dk/images/Hotel/LPAALTA1091_2_30.jpg?v=47",
      "description": "",
      "width": 1280,
      "height": 853
    },
    {
      "url": "http://images1.spies.dk/images/Hotel/LPAALTA1089_2_30.jpg?v=47",
      "description": "",
      "width": 1280,
      "height": 853
    },
    {
      "url": "http://images1.spies.dk/images/Hotel/LPAALTA1087_2_30.jpg?v=47",
      "description": "2-værelses Club Room-lejlighed oven for poolområdet, type C",
      "width": 1280,
      "height": 853
    },
    {
      "url": "http://images1.spies.dk/images/Hotel/LPAALTA1163_2_30.jpg?v=16",
      "description": "",
      "width": 1280,
      "height": 853
    },
    {
      "url": "http://images1.spies.dk/images/Hotel/LPAALTA1127_2_30.jpg?v=47",
      "description": "",
      "width": 1280,
      "height": 853
    },
    {
      "url": "http://images1.spies.dk/images/Hotel/LPAALTA1156_2_30.jpg?v=16",
      "description": "2-værelses Club Room med stor balkon (A22CLB)",
      "width": 1280,
      "height": 853
    },
    {
      "url": "http://images1.spies.dk/images/Hotel/LPAALTA1157_2_30.jpg?v=16",
      "description": "2-værelses Club Room med stor balkon (A22CLB)",
      "width": 1280,
      "height": 853
    },
    {
      "url": "http://images1.spies.dk/images/Hotel/LPAALTA1137_2_30.jpg?v=47",
      "description": "",
      "width": 1280,
      "height": 853
    },
    {
      "url": "http://images1.spies.dk/images/Hotel/LPAALTA1142_2_30.jpg?v=47",
      "description": "",
      "width": 1280,
      "height": 853
    },
    {
      "url": "http://images1.spies.dk/images/Hotel/LPAALTA1162_2_30.jpg?v=16",
      "description": "",
      "width": 1280,
      "height": 853
    },
    {
      "url": "http://images1.spies.dk/images/Hotel/LPAALTA1134_2_29.jpg?v=29",
      "description": "",
      "width": 631,
      "height": 960
    },
    {
      "url": "http://images1.spies.dk/images/Hotel/LPAALTA1158_2_30.jpg?v=16",
      "description": "",
      "width": 1280,
      "height": 853
    },
    {
      "url": "http://images1.spies.dk/images/Hotel/LPAALTA1159_2_29.jpg?v=10",
      "description": "",
      "width": 631,
      "height": 960
    },
    {
      "url": "http://images1.spies.dk/images/Hotel/LPAALTA1126_2_30.jpg?v=47",
      "description": "",
      "width": 1280,
      "height": 853
    },
    {
      "url": "http://images1.spies.dk/images/Hotel/LPAALTA1085_2_30.jpg?v=47",
      "description": "",
      "width": 1280,
      "height": 853
    },
    {
      "url": "http://images1.spies.dk/images/Hotel/LPAALTA1092_2_30.jpg?v=47",
      "description": "",
      "width": 1280,
      "height": 853
    },
    {
      "url": "http://images1.spies.dk/images/Hotel/LPAALTA9997_2_30.jpg?v=29",
      "description": "Oversigt over lejlighedernes placering på hotelområdet",
      "width": 1280,
      "height": 853
    },
    {
      "url": "http://images1.spies.dk/images/Hotel/LPAALTA1144_2_29.jpg?v=29",
      "description": "Theodoro - hotellets direktør",
      "width": 631,
      "height": 960
    },
    {
      "url": "http://images1.spies.dk/images/Hotel/LPAALTA1146_2_29.jpg?v=29",
      "description": "José - receptionschef",
      "width": 631,
      "height": 960
    },
    {
      "url": "http://images1.spies.dk/images/Hotel/LPAALTA1161_2_30.jpg?v=16",
      "description": "",
      "width": 1280,
      "height": 853
    },
    {
      "url": "http://images1.spies.dk/images/Hotel/LPAALTA9998_2_30.jpg?v=2",
      "description": "",
      "width": 1280,
      "height": 853
    }
  ],
  "facts": [
    {
      "id": "OutdoorPool",
      "name": "Pool",
      "value": "2 stk."
    },
    {
      "id": "DistanceToBeach",
      "name": "Nærmeste strand",
      "value": "1,5 km"
    },
    {
      "id": "DistanceToCenter",
      "name": "Nærmeste centrum",
      "value": "500 m"
    },
    {
      "id": "Bar",
      "name": "Bar",
      "value": "Ja"
    },
    {
      "id": "ChildrenPool",
      "name": "Børnepool",
      "value": "Ja"
    },
    {
      "id": "Elevator",
      "name": "Elevator",
      "value": "(kabelelevatorer som til tider kan være forstyrrende)"
    },
    {
      "id": "PoolBar",
      "name": "Poolbar",
      "value": "Ja"
    },
    {
      "id": 130,
      "name": "Restaurant",
      "value": "1"
    },
    {
      "id": "MiniMarket",
      "name": "Minimarked",
      "value": "Ja"
    },
    {
      "id": "CleaningDaysPerWeek",
      "name": "Rengøring (antal dage pr. uge)",
      "value": "5"
    },
    {
      "id": "Internet",
      "name": "Internet",
      "value": "Mod betaling"
    },
    {
      "id": "WaterSlide",
      "name": "Vandrutsjebane",
      "value": "Nej"
    },
    {
      "id": "LolloAndBernie",
      "name": "Lollo och Bernie",
      "value": false
    },
    {
      "id": "IsAdultHotel",
      "name": "Adult hotel",
      "value": false
    },
    {
      "id": "AllInclusive",
      "name": "All Inclusive",
      "value": false
    }
  ],
  "hotelProduct": {
    "id": 43,
    "key": "FamilyGarden"
  },
  "interestProducts": [
    {
      "id": 61,
      "key": "AllTypesOfInclusive"
    },
    {
      "id": 85,
      "key": "AllChildrensClub"
    }
  ],
  "importUpdateId": "2016-03-15T10:25:06.315Z"
}
```


## Todo:

We have not yet setup the IAM role to ensure the API is *only* accessible by a
subset of users/lambdas, this is a security enhancement we will need
to apply *before* rolling out.

> see: https://tc-jira.atlassian.net/browse/ISEARCH-208


Read:
+ http://docs.aws.amazon.com/apigateway/latest/developerguide/getting-started-aws-proxy.html
+ http://docs.aws.amazon.com/apigateway/latest/developerguide/request-response-data-mappings.html

geography:ne.{spainen-code}
