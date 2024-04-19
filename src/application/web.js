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

web.use(cors(corsOptions));

web.use(express.json());

web.use(publicRouter); 

web.use(errorMiddleware);
