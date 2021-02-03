import Discord from 'discord.js';
import config from './config';

const client = new Discord.Client({
	presence: {
		status: 'online',
		activity: {
			name: "VSCode",
			type: 'WATCHING'
		}
	}
});

client.on('ready', () => {
	console.log('I\'m ready!');
});

client.on('message', (message) => {
	if (message.content === 'ping') message.channel.send('pong');
});

client.login(config.botToken);

const stop = () => client.destroy();
process.on('SIGINT', stop);
process.on('SIGTERM', stop);