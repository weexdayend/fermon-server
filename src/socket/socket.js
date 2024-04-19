var socket
function socketConnectionRequest(req, res, next) {
    const headers = {
        'Access-Control-Allow-Origin': '*', // To tell client, it is allowed to access this resource from any origin
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

module.exports = { socketConnectionRequest, publishMessageToConnectedSockets }