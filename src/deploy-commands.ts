import { SlashCommandBuilder, SlashCommandOptionsOnlyBuilder } from '@discordjs/builders';
import { REST } from '@discordjs/rest';
import { Routes } from'discord-api-types/v9';

import config from './config';

const commands: Array<any> /*idk what the interface for json slash commands are*/ = [
	new SlashCommandBuilder().setName('ping').setDescription('Replies with pong!'),
    new SlashCommandBuilder().setName('method').setDescription('Replies with method') // TODO: better description
    .addStringOption(option => option.setName('method_name').setDescription('Method Name').setRequired(true))
    .addIntegerOption(option => option.setName('usage_id').setDescription('Usage Id').setRequired(false))
].map(command => command.toJSON());

const rest: REST = new REST({ version: '9' }).setToken(config.botToken);

(async () => {
	try {
		await rest.put(
			Routes.applicationGuildCommands(config.clientId, config.guildId),
			{ body: commands },
		);

		console.log('Successfully registered application commands.');
	} catch (error) {
		console.error(error);
	}
})();