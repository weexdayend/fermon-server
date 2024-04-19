import express from "express";
import cors from "cors";

import {publicRouter} from "../route/public-api.js";
import {errorMiddleware} from "../middleware/error-middleware.js";

export const web = express();

export const corsOptions = {
    origin: "https://admin.synchronice.id",
    optionsSuccessStatus: 200,
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    allowedHeaders: "Content-Type, Authorization",
};

web.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', 'https://admin.synchronice.id');
    res.setHeader('Access-Control-Allow-Methods', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

web.use(cors(corsOptions));

web.use(express.json());

web.use(publicRouter); 

web.use(errorMiddleware);
