import Discord from 'discord.js';

import config from './config';
import * as api from './lib/liko-api';
import { createMethodEmbed, methodsIndex } from './lib/doc-utils';

const client = new Discord.Client({
	presence: {
		status: 'online',
		activity: {
			name: ".method",
			type: 'WATCHING'
		}
	}
});

client.on('ready', () => {
	console.log('I\'m ready!');
});

const methodUsageEmbed = new Discord.MessageEmbed();
methodUsageEmbed.title = 'Usage:';
methodUsageEmbed.description = "```css\n.method <method_name> [usage_id]\n```";

client.on('message', (message) => {
	const args = message.content.split(' ');
	const command = args.shift()?.toLowerCase();

	if (command === '.ping') message.channel.send('Pong 🏓');
	if (command === '.method') {
		const methodName = args[0]?.toLowerCase();
		const usageId = Number.parseInt(args[1] ?? '-1');
		
		if (!methodName) return message.channel.send('', methodUsageEmbed.setFooter(`@${message.author.username}#${message.author.discriminator}`));

		let selectedMatch = undefined;
		const shorterMatches = [], longerMatches = [];
		for (const index in methodsIndex) {
			//Found an exact match
			if (index === methodName) {
				selectedMatch = methodsIndex[index];
				break;
			}

			//Longer match
			if (index.includes(methodName)) longerMatches.push(methodsIndex[index]);

			//Shorter match
			if (methodName.includes(index)) shorterMatches.push(methodsIndex[index]);
		}

		//Found an exact match
		if (selectedMatch) return message.channel.send('', createMethodEmbed(selectedMatch.peripheral, selectedMatch.object, selectedMatch.name, selectedMatch.method, usageId));

		//Found a single longer match
		if (longerMatches.length === 1) {
			selectedMatch = longerMatches[0];
			const embed = createMethodEmbed(selectedMatch.peripheral, selectedMatch.object, selectedMatch.name, selectedMatch.method, usageId);
			const extendFooter = `Didn't find an exact match for '${args[0]}' but instead found a longer match.`
			embed.footer = embed.footer ?? {};
			embed.footer.text = embed.footer ? `${embed.footer}\n${extendFooter}` : extendFooter;
			message.channel.send('', embed);
			return
		}

		//No longer matches, and a single shorter match
		if (longerMatches.length === 0 && shorterMatches.length === 1) {
			selectedMatch = shorterMatches[0];
			const embed = createMethodEmbed(selectedMatch.peripheral, selectedMatch.object, selectedMatch.name, selectedMatch.method, usageId);
			const extendFooter = `Didn't find an exact match for '${args[0]}' but instead found a shorter match.`
			embed.footer = embed.footer ?? {};
			embed.footer.text = embed.footer ? `${embed.footer}\n${extendFooter}` : extendFooter;
			message.channel.send('', embed);
			return
		}

		const embed = new Discord.MessageEmbed();

		if (shorterMatches.length === 0 && longerMatches.length === 0) {
			embed.title = 'No results found ⚠';
		} else {
			embed.title = 'No exact match';
			embed.description = 'But found those shorter/longer matches:';

			if (longerMatches.length > 0) embed.addField('Longer matches', longerMatches.map(match => `- \`${match.formatted}\``).join('\n'));
			if (shorterMatches.length > 0) embed.addField('Shorter matches', shorterMatches.map(match => `- \`${match.formatted}\``).join('\n'));
		}

		message.channel.send('', embed);
	}
});

client.login(config.botToken);

const stop = () => client.destroy();
process.on('SIGINT', stop);
process.on('SIGTERM', stop);