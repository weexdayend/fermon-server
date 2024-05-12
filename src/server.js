import { web } from "./application/web.js";
import { logger } from "./application/logging.js";
import { Server } from "socket.io";

import http from "http";
import bodyParser from "body-parser";
import cors from "cors";

const server = http.createServer(web);

const corsOptions = {
    origin: ['https://admin.greatjbb.com', 'https://mage.greatjbb.com', 'https://app.greatjbb.com'],
    optionsSuccessStatus: 200
};

web.use(cors(corsOptions))

// Increase the request size limit
web.use(bodyParser.json({ limit: '100mb' }));
web.use(bodyParser.urlencoded({ limit: '100mb', extended: true }));

web.listen(4000, () => {
    logger.info("Starting Fermon Server!");
});

export const io = new Server(server, {
    cors: {
        origin: ['https://admin.greatjbb.com', 'https://mage.greatjbb.com'],
        methods: ['GET', 'POST'],
        allowedHeaders: ['Access-Control-Allow-Origin'],
        credentials: true
    },
    transports: ['websocket'],
});

io.on('connection', async (socket) => {
    console.log(`${socket.id} connected`);

    socket.on('import progress', (data) => {
        socket.broadcast.emit('import progress', data)
    });

    socket.on('import completed', (data) => {
        socket.broadcast.emit('import completed', data)
    });

    socket.on('bulk progress', (data) => {
        socket.broadcast.emit('bulk progress', data)
    });

    socket.on('bulk completed', (data) => {
        socket.broadcast.emit('bulk completed', data)
    });

    socket.on('migration process', (data) => {
        socket.broadcast.emit('migration process', data)
    });

    socket.on('migration finish', (data) => {
        socket.broadcast.emit('migration finish', data)
    });

    socket.on('example data', (data) => {
        socket.broadcast.emit('example data', data)
    });

    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
});

io.listen(8002, () => {
    logger.info("Socket.io Server listening on port 5000!");
});