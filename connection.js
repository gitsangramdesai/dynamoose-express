const dynamoose = require('dynamoose');

// const ddb = new dynamoose.aws.ddb.DynamoDB({
//     "credentials": {
//         "accessKeyId": process.env.AWS_ACCESS_KEY_ID,
//         "secretAccessKey": process.env.AWS_SECRET_ACCESS_KEY
//     },
//     "region": "us-east-1"
// });

dynamoose.aws.ddb.local("http://localhost:8000")
module.exports = dynamoose