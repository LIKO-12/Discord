import Discord from 'discord.js';
import { createMethodEmbed, methodsIndex } from './lib/doc-utils';

import config from './config';


const client: Discord.Client = new Discord.Client({
  intents: [],
  presence: {
    status: 'online',
    activities: [{
      name: "/method",
      type: 'WATCHING'
    }]
  }
});

client.once('ready', () => {
  console.log('Ready!');
});

// const methodUsageEmbed = new Discord.MessageEmbed()
//   .setTitle('Usage')
//   .setDescription('```css\n.method <method_name> [usage_id]\n```');

client.on('interactionCreate', async interaction => {
  if (!interaction.isCommand()) return;

  const { commandName } = interaction;

  if (commandName === 'ping') {
    await interaction.reply('Pong 🏓');
  }
  else if (commandName === 'method') { // it does not seem to work the same as .method, not sure why, this is kinda confusing and uncommented.
    const methodName = interaction.options.getString('method_name', true);
    const usageId = interaction.options.getInteger('usage_id', false) ?? -1;

    // if (!methodName) return message.channel.send('', methodUsageEmbed.setFooter(`@${message.author.username}#${message.author.discriminator}`));

    const plainName = !(/[\.:]/.test(methodName));

    let selectedMatch = undefined;
    const shorterMatches = [], longerMatches = [];
    for (const index in methodsIndex) {
      //Found an exact match
      if (index === methodName) {
        selectedMatch = methodsIndex[index];
        break;
      }

      if (!plainName || !/[\.:]/.test(index)) {
        //Longer match
        if (index.includes(methodName)) longerMatches.push(methodsIndex[index]);

        //Shorter match
        if (methodName.includes(index)) shorterMatches.push(methodsIndex[index]);
      }
    }

    //Found an exact match
    if (selectedMatch) return interaction.reply({ embeds: [createMethodEmbed(selectedMatch.peripheral, selectedMatch.object, selectedMatch.name, selectedMatch.method, usageId)] });

    //Found a single longer match. this code is ugly ngl.
    if (longerMatches.length === 1) {
      selectedMatch = longerMatches[0];
      const embed = createMethodEmbed(selectedMatch.peripheral, selectedMatch.object, selectedMatch.name, selectedMatch.method, usageId);
      const extendFooter = `Didn't find an exact match for '${methodName}' but instead found a longer match.`
      embed.setFooter(embed.footer?.text ? `${embed.footer.text}\n${extendFooter}` : extendFooter);
      interaction.reply({ embeds: [embed] });
      return
    }

    //No longer matches, and a single shorter match
    if (longerMatches.length === 0 && shorterMatches.length === 1) {
      selectedMatch = shorterMatches[0];
      const embed = createMethodEmbed(selectedMatch.peripheral, selectedMatch.object, selectedMatch.name, selectedMatch.method, usageId);
      const extendFooter = `Didn't find an exact match for '${methodName}' but instead found a shorter match.`
      embed.footer = embed.footer ?? {};
      embed.footer.text = embed.footer.text ? `${embed.footer.text}\n${extendFooter}` : extendFooter;
      interaction.reply({ embeds: [embed] });
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

    interaction.reply({ embeds: [embed] });
  };
});

client.login(config.botToken);