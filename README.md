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

## Todo:

We have not yet setup the IAM role to ensure the API is *only* accessible by a
subset of users/lambdas, this is a security enhancement we will need
to apply *before* rolling out.



Read:
+ http://docs.aws.amazon.com/apigateway/latest/developerguide/getting-started-aws-proxy.html
+ http://docs.aws.amazon.com/apigateway/latest/developerguide/request-response-data-mappings.html


geography:ne.{spainen-code}
