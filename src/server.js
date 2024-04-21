import {web} from "./application/web.js";
import {logger} from "./application/logging.js";

import cors from "cors";

const corsOptions = {
    origin: 'https://admin.synchronice.id',
    optionsSuccessStatus: 200
};

web.use(cors(corsOptions))

// Increase the request size limit
web.use(bodyParser.json({ limit: '100mb' }));
web.use(bodyParser.urlencoded({ limit: '100mb', extended: true }));

web.listen(4455, () => {
    logger.info("App start");
});
