import { Client, Intents } from 'discord.js';
import config from './config';


const client: Client = new Client({
  intents: [],
  presence: {
    status: 'online',
    activities: [{
      name: ".method",
      type: 'WATCHING'
    }]
  }
});

client.once('ready', () => {
	console.log('Ready!');
});

client.on('interactionCreate', async interaction => {
	if (!interaction.isCommand()) return;

	const { commandName } = interaction;

	if (commandName === 'ping') {
		await interaction.reply('Pong 🏓');
	};
});

client.login(config.botToken);