import express from "express";
import cors from "cors";

import {publicRouter} from "../route/public-api.js";
import {errorMiddleware} from "../middleware/error-middleware.js";

export const web = express();

web.use(cors());

web.use(express.json());

web.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "https://admin.synchronice.id");
    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept"
    );
    next();
});

function socketConnectionRequest(req, res, next) {
    const headers = {
        'Access-Control-Allow-Origin': 'https://admin.synchronice.id', // To tell client, it is allowed to access this resource from any origin
        'Cache-Control': 'no-cache', // To tell client, it is not a cacheable response
        'Content-Type': 'text/event-stream', // To tell client, it is event stream
        'Connection': 'keep-alive', // To tell client, not to close connection
    };
    res.writeHead(200, headers);
    res.write('data: Connection Established, We\'ll now start receiving messages from the server.\n')
    socket = res
    console.log('New connection established')
}

function publishMessageToConnectedSockets(data) {
    socket.write(`data: ${data}\n`);
}

web.get('/socket-connection-request', socketConnectionRequest);
web.post('/send-message-to-client', (req, res, next) => {
    publishMessageToConnectedSockets(`Sukses terus Saptakarya at ${new Date()}`)
    res.sendStatus(200)
});

web.use(publicRouter); 

web.use(errorMiddleware);
