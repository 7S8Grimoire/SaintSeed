import dotenv from "dotenv";
import { client } from "./modules/client.js";

dotenv.config();

(async () => {
  client.login(process.env.BOT_TOKEN);
})();
