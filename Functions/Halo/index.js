'use strict';
var { getHalosHandler } = require('./handlers/getHalos');
var { addHaloHandler } = require('./handlers/addHalo')

exports.handler = async (request, context, callback) => {
    console.log(`body: ${JSON.stringify(request)}, context: ${JSON.stringify(context)}`);
    switch (request.path + request.httpMethod) {
        case "/POST":
            console.log("/POST called, calling addHaloHandler")
            return await addHaloHandler(request, context, callback);
        case "/GET":
            console.log("/GET called, calling getHalosHandler")
            return await getHalosHandler(request, context, callback);
        default: return;
    }
}