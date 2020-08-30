'use strict';
const snoowrap = require('snoowrap');
var AWS = require("aws-sdk");

AWS.config.update({
  "region": "us-east-2",
  "accessKeyId": process.env.KEY_ID, 
  "secretAccessKey": process.env.SECRET_KEY_ID
});

const docClient = new AWS.DynamoDB.DocumentClient();
const reddit = new snoowrap({
  userAgent: process.env.USER_AGENT,
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  username: process.env.USERNAME,
  password: process.env.PASSWORD
});

exports.addHaloHandler = async (request, context) => {
  console.log(`Handler add new halo with body ${request}`);
  const body = JSON.parse(request.body);
  if (!validateRequest(body)) {
    console.log(`Invalid body: ${JSON.stringify(body)}`);
      return "Invalid body.";
  }

  console.log(`snoowrap configured with ${JSON.stringify(process.env)}`);

  const id = Math.round(Math.random()*100000).toString()
  const commentId = body.commentId;

  console.log(`Getting comment with id: ${commentId}`);
  const comment = await reddit.getComment(commentId).fetch();
  const parent = await getParent(comment);

  console.log(`Got comment: ${JSON.stringify(comment)} with parent: ${JSON.stringify(parent)}`);
 
  var params = {
      TableName:"Halo",
      Item:{
          "initiator": comment.author.name,
          "recipient": parent.author.name,
          "commentId": commentId,
          "subreddit": comment.subreddit.display_name,
          "id": id
      }
  };
  
  console.log(`Adding a new item with id ${id}`);
  docClient.put(params, function(err, data) {
      if (err) {
          console.error("Unable to add item. Error JSON:", JSON.stringify(err, null, 2));
      } else {
          console.log("Added item:", JSON.stringify(data, null, 2));
      }
  });

  await replyToComment(comment);
  
  var response = {
    statusCode: 200,
    headers: {},
    body: JSON.stringify(true),
    isBase64Encoded: false
  };

  return response;
};

async function getParent(comment) {
  const parentId = comment.parent_id;

  if (parentId.includes('t1_')) {
      return await reddit.getComment(parentId).fetch();
  } else if (parentId.includes('t3_')) {
      return await reddit.getSubmission(parentId).fetch();
  } else {
      return null;
  }
}

function validateRequest(body) {
  const {
      commentId
  } = body;

  if (commentId === null || commentId === undefined) {
      return false;
  }

  return true;
}

async function replyToComment(comment) {
  await comment.reply("Please check your messages for instructitons on how to fulfill this halo!");
}