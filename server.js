import {web} from "./src/application/js";
import {logger} from "./src/application/logging.js";

web.listen(4000, () => {
    logger.info("App start");
});
