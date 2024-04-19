import {web} from "./src/application/js";
import {logger} from "./src/application/logging.js";

web.listen(3000, () => {
    logger.info("App start");
});
