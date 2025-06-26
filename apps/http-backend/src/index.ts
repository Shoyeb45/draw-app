import { createServer  } from "./utils/server";

const app = createServer();

app.listen(9000, () => {
    console.log("HTTP Server is running on port 9000");
    
})
