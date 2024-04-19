import {web} from "./application/js";
import {logger} from "./application/logging.js";

web.listen(4000, () => {
    logger.info("App start");
});
