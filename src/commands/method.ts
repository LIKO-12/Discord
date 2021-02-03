import { Command } from 'discord-akairo';
import { MessageEmbed, User, Message } from 'discord.js';
import { createMethodEmbed, methodsIndex } from '../lib/doc-utils';


function UsageEmbed(user: User): MessageEmbed {
    return new MessageEmbed()
        .setTitle('Usage:')
        .setDescription('```css\n.method <method_name> [usage_id]\n```')
        .setFooter(`@${user.tag}`);
}

class Method extends Command {
    constructor() {
        super('method', {
            aliases: ['method'],
            args: [{
                id: 'name',
                type: 'lowercase',
                otherwise: (message: Message) => UsageEmbed(message.author)
            },
            {
                id: 'usage',
                type: 'number',
                default: -1
            }]
        })
    }
    async exec(message: Message, args: any) {
        const methodName = args.name;
		const usageId = args.usage;
		
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

		const embed = new MessageEmbed();

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
}
module.exports = Method;