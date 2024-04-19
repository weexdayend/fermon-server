import express from "express";
import cors from "cors";

import {publicRouter} from "../route/public-api.js";
import {errorMiddleware} from "../middleware/error-middleware.js";

export const web = express();

// Define CORS options
const corsOptions = {
    origin: "http://10.128.206.74:8224", // Replace with your Next.js app's domain
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true, // Enable cookies from the client-side
    optionsSuccessStatus: 204,
};
  
web.use(cors(corsOptions));

web.use(express.json());

web.use(publicRouter); 

web.use(errorMiddleware);
