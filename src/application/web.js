import express from "express";
import cors from "cors";

import {publicRouter} from "../route/public-api.js";
import {errorMiddleware} from "../middleware/error-middleware.js";

export const web = express();

web.all('/', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "http://admin.synchronice.id");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    next();
});

web.use(cors(
    cors({
        origin: "https://admin.synchronice.id", // restrict calls to those this address
        methods: "GET" // only allow GET requests
    })
));

web.use(express.json());

web.use(publicRouter); 

web.use(errorMiddleware);
