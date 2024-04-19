import {web} from "./application/web.js";
import {logger} from "./application/logging.js";

import cors from "cors";

web.use(cors());
web.listen(4000, () => {
    logger.info("App start");
});
