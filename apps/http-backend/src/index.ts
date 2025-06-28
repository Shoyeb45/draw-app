import { createServer  } from "./utils/server";

const app = createServer();


// Routing
import { router } from "./routes/index.route";
app.use("/api/v1", router);

app.listen(9000, () => {
    console.log("HTTP Server is running on port 9000");  
})
