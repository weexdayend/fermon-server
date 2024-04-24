import { web } from "./application/web.js";
import { logger } from "./application/logging.js";
import { Server } from "socket.io";

import http from "http";
import bodyParser from "body-parser";
import cors from "cors";

const server = http.createServer(web);

const corsOptions = {
    origin: ['https://admin.synchronice.id', 'https://mage.synchronice.id'],
    optionsSuccessStatus: 200
};

web.use(cors(corsOptions))

// Increase the request size limit
web.use(bodyParser.json({ limit: '100mb' }));
web.use(bodyParser.urlencoded({ limit: '100mb', extended: true }));

web.listen(4000, () => {
    logger.info("Starting Fermon Server!");
});

const io = new Server(server, {
    cors: {
        origin: ['https://admin.synchronice.id', 'https://mage.synchronice.id'],
        methods: ['GET', 'POST'],
        allowedHeaders: ['Access-Control-Allow-Origin'],
        credentials: true
    },
    transports: ['websocket'],
});

io.on('connection', async (socket) => {
    console.log(`${socket.id} connected`);
  
    socket.on('pyEvents', (data) => {
        socket.broadcast.emit('pyResponse', data)
    });
  
    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
});

io.listen(8002, () => {
    logger.info("Socket.io Server listening on port 5000!");
});