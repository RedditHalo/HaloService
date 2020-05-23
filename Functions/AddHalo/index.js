'use strict';
const snoowrap = require('snoowrap');


var AWS = require("aws-sdk");

let aswconfig = {
    "region": "us-east-2",
    // "endpoint": "https://dynamodb.us-east-2.amazonaws.com",
    "accessKeyId": process.env.KEY_ID, 
    "secretAccessKey": process.env.SECRET_KEY_ID
}
AWS.config.update(aswconfig);


var dynamodb = new AWS.DynamoDB();

const reddit = new snoowrap({
    userAgent: process.env.USER_AGENT,
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    username: process.env.USERNAME,
    password: process.env.PASSWORD
});


// Create the DynamoDB service object
var docClient = new AWS.DynamoDB.DocumentClient();



exports.handler = async (body, context, callback) => {

    if (!validateRequest(body)) {
        return "Invalid body.";
    }

    const commentId = body.commentId;
    const comment = await reddit.getComment(commentId).fetch();
    const parent = await getParent(comment);
   
    var params = {
        TableName:"Halo",
        Item:{
            "initiator": comment.author.name,
            "recipient": parent.author.name,
            "commentId": commentId,
            "subreddit": comment.subreddit.display_name,
            "id": Math.round(Math.random()*100000).toString()
        }
    };
    
    console.log("Adding a new item...");
    docClient.put(params, function(err, data) {
        if (err) {
            console.error("Unable to add item. Error JSON:", JSON.stringify(err, null, 2));
        } else {
            console.log("Added item:", JSON.stringify(data, null, 2));
        }
    });
 

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