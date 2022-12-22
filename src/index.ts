import dotenv from 'dotenv';
dotenv.config();

import { connectDatabase } from './modules/database';
connectDatabase();

import { initLocalization } from './modules/localization';
initLocalization();

import client from './modules/client';


(async () => {  
  client.login(process.env.BOT_TOKEN);
})();