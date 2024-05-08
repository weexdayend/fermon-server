import express from "express";

import {publicRouter} from "../route/public-api.js";
import {errorMiddleware} from "../middleware/error-middleware.js";

import bodyParser from 'body-parser'

import cors from "cors";

export const web = express();

const corsOptions = {
    origin: ['https://admin.greatjbb.com', 'https://mage.greatjbb.com'],
    optionsSuccessStatus: 200
};

web.use(cors(corsOptions))

// Increase the request size limit
web.use(bodyParser.json({ limit: '100mb' }));
web.use(bodyParser.urlencoded({ limit: '100mb', extended: true }));

web.use(publicRouter); 

web.use(errorMiddleware);
