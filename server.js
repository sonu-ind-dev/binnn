import app from "./src/app.js";
import config from "./src/config/config.js";
import { initializeMysqlModels } from "./src/db/mysql/index.js";
import { initializeMongoCollections } from "./src/db/mongo/index.js";

await initializeMysqlModels();
await initializeMongoCollections();

app.listen(config.APP_PORT, () => console.log(`SERVER: Server Running @PORT:${config.APP_PORT}`));
