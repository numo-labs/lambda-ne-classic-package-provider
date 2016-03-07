var AWS = require('aws-sdk');
AWS.config.region = 'eu-west-1';
var sns = new AWS.SNS();
var params = {
  Name: 'package-search-request' /* required */
};
sns.createTopic(params, function(err, data) {
  if (err) console.log(err, err.stack); // an error occurred
  else     console.log(data);           // successful response
});
