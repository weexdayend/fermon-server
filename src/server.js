import {web} from "./application/web.js";
import {logger} from "./application/logging.js";

web.listen(4000, () => {
    logger.info("App start");
});
