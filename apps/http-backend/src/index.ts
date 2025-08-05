import { createServer  } from "./utils/server";
import { logger } from "./utils/loggeer";
const app = createServer();


// Routing
import { router } from "./routes/index.route";
app.use("/api/v1", router);

app.listen(9000, () => {
    logger.info("HTTP Server is running on port 9000");  
})
