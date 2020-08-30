'use strict';
var AWS = require("aws-sdk");

AWS.config.update({
    "region": "us-east-2",
    "accessKeyId": process.env.KEY_ID, 
    "secretAccessKey": process.env.SECRET_KEY_ID
});

const docClient = new AWS.DynamoDB.DocumentClient();

exports.getHalosHandler = async (request, context, callback) => {
  var params = {
      TableName : "Halo",
      KeyConditionExpression: "#id = :id",
      ExpressionAttributeNames:{
          "#id": "id"
      },
      ExpressionAttributeValues: {
          ":id": request.queryStringParameters.id
      }
  }

  try {
    const data = await docClient.query(params).promise();
    console.log("Query succeeded.");
    console.log(`Result: ${data}`)

    return {
      statusCode: 200,
      headers: {},
      body: JSON.stringify(data.Items),
      isBase64Encoded: false
    };
  } catch (e) {
    console.error("Unable to query. Error:", JSON.stringify(e, null, 2));
    return "Error";
  }
};