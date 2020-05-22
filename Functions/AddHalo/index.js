'use strict';
const snoowrap = require('snoowrap');
var AWS = require("aws-sdk");

var dynamodb = new AWS.DynamoDB();

const reddit = new snoowrap({
    userAgent: process.env.USER_AGENT,
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    username: process.env.USERNAME,
    password: process.env.PASSWORD
});

exports.handler = async (event, context, callback) => {
    //var request = JSON.parse(event.body);
    var request = event.body

    if (!validateRequest(request)) {
        return "Invalid body.";
    }

    console.log(request.commentId)

    const commentId = request.commentId;
    const comment = await reddit.getComment(commentId).fetch();
    const parent = await getParent(comment);


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