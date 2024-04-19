import {web} from "./application/web.js";
import {logger} from "./application/logging.js";

web.get('/', (req, res) => {
    res.send("Server is Running")
    logger.info("Server is Running")
})

web.listen(4000, () => {
    logger.info("App start");
});
