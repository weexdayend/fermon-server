import express from "express";
import cors from "cors";

import {publicRouter} from "../route/public-api.js";
import {errorMiddleware} from "../middleware/error-middleware.js";

export const web = express();

// Define CORS options
const corsOptions = {
    origin: "https://admin.synchronice.id/",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true,
    optionsSuccessStatus: 204,
};

web.use(cors(corsOptions));

web.use(express.json());

web.use(publicRouter); 

web.use(errorMiddleware);
