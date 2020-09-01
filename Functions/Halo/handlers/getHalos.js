'use strict';
var AWS = require('aws-sdk');
const { request } = require('http');

const validQueryParams = new Set(['id', 'initiator', 'recipient', 'subreddit']);

AWS.config.update({
    'region': 'us-east-2',
    'accessKeyId': process.env.KEY_ID, 
    'secretAccessKey': process.env.SECRET_KEY_ID
});

const docClient = new AWS.DynamoDB.DocumentClient();

exports.getHalosHandler = async (request, context, callback) => {
  if (!validateRequest(request)) {
    return 'Invalid Request';
  }

  var queryParams = request.queryStringParameters;
  var data = {};

  if (queryParams.id) {
    var dbParams = {
      TableName : 'Halo',
      KeyConditionExpression: '#id = :id',
      ExpressionAttributeNames: {
        '#id': 'id'
      },
      ExpressionAttributeValues: {
        ':id': request.queryStringParameters.id
      }
    };
    
    try {
      console.log(`Querying with params: ${JSON.stringify(dbParams)}`);
      data = await docClient.query(dbParams).promise();
      console.log(`Query result: ${JSON.stringify(data)}`);
    } catch (e) {
      console.error('Unable to query. Error:', JSON.stringify(e, null, 2));
      return 'Error';
    }
  } else {
    var dbParams = {
      TableName: 'Halo',
      ExpressionAttributeNames: {},
      ExpressionAttributeValues: {}
    }

    var filterExpression = '';

    Object.keys(queryParams).forEach((key, index) => {
      if (index) {
        filterExpression += ' and ';
      }

      filterExpression += `#${key} = :${key}`;
      dbParams.ExpressionAttributeNames[`#${key}`] = key;
      dbParams.ExpressionAttributeValues[`:${key}`] = queryParams[key];
    });

    dbParams.FilterExpression = filterExpression

    try {
      console.log(`Scanning with params: ${JSON.stringify(dbParams)}`);
      data = await docClient.scan(dbParams).promise();
      console.log(`Scan result: ${JSON.stringify(data)}`);
    } catch (e) {
      console.error('Unable to scan. Error:', JSON.stringify(e, null, 2));
      return 'Error';
    }
  }
  
  return {
    statusCode: 200,
    headers: {},
    body: JSON.stringify(data.Items),
    isBase64Encoded: false
  };
};

function validateRequest(request) {
  if (!request.queryStringParameters || Object.keys(request.queryStringParameters).length === 0) {
    return true;
  }

  for (key in Object.keys(request.queryStringParameters)) {
    if (!validQueryParams.has(key)) {
      console.log(`Query param ${key} is not valid.`);
      return false;
    }
  }

  return true;
}