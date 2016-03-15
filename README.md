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
revers-proxy.

This is documented in:

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

API Path:
```sh
trips?adults=2&children=3&allInclusive=true&lmsOnly=true&hotelIds=139891,10002,99281
```
Response:
```sh
{ port: 443,
  host: 'gm9oumnp1h.execute-api.eu-west-1.amazonaws.com',
  path: '/ci/trips?adults=2&children=3&allInclusive=true&lmsOnly=true&hotelIds=139891,10002,99281&' }
{ type: 'UpdateTripInfo',
  marketUnitCode: 'SD',
  departureCode: 'BLL',
  destinationCode: 'LPA',
  departureDate: '2016-04-07T00:00:00',
  vitsSerialNumber: '41',
  vitsClassCode: 'E',
  hotelCode: 'GLOR',
  hotelDuration: 14,
  duration: 15,
  roomTypeCode: 'A12SEX',
  flightAllotment: 10,
  hotelProductCode: 'FE',
  price: 47795,
  numberOfAdults: 2,
  numberOfChildren: 3,
  paxPrice: 10049,
  discountPrice: -400,
  discountTotal: -2000,
  numberOfRooms: 2,
  priorityCode: 285,
  wvHotelPartId: 99281,
  preloadedPriceId: 279232859,
  boardCode: 'BB',
  insertedDate: '2015-12-02T05:46:26.183',
  tripId: 55482508,
  flightInfo: { outFlight: [ [Object] ], homeFlight: [ [Object] ] },
  roomTypeDescription: '1-vær. lejlighed, havudsigt, ekstra opredning muligt',
  boardCodeDescription: 'Morgenmadsbuffet',
  available: true,
  indexedDate: '2015-12-02T05:51:53.952818+01:00',
  tripUrl: 'http://www.spies.dk/redir/BookRedirect.aspx?departureDate=2016-04-07&duration=15&departureCode=BLL&destinationCode=LPA&transportSerial=41&transportClass=E&hotelCode=GLOR&roomType=A12SEX',
  isLastMinuteSale: false }
```


## Todo:

We have not yet setup the IAM role to ensure the API is *only* accessible by a
subset of users/lambdas, this is a security enhancement we will need
to apply *before* rolling out.







Read:
+ http://docs.aws.amazon.com/apigateway/latest/developerguide/getting-started-aws-proxy.html
+ http://docs.aws.amazon.com/apigateway/latest/developerguide/request-response-data-mappings.html

geography:ne.{spainen-code}
