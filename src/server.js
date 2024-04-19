import {web} from "./application/web.js";
import {logger} from "./application/logging.js";

web.get('/', (req, res) => {
    res.send("Server is Running on port 4000")
    logger.info("Server is Running on port 4000")
})

web.listen(4000, () => {
    logger.info("App start");
});
