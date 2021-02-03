const LikoClient = require('./client/LikoClient');

import config from './config'

const client = new LikoClient(config);

client.init();
client.login();