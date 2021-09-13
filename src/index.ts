import Discord from 'discord.js';
import { createMethodEmbed, methodsIndex } from './lib/doc-utils';

import config from './config';

// TODO: these functions might belong to doc-utils
function isComplex(name: string): boolean {
  return /[\.:]/.test(name); // caching this regex would have minimal performance increase.
}

function generateMatchesList(matches: { formatted: string }[]): string { // to lazy to have the method object type
  return matches.map(match => `- \`${match.formatted}\``).join('\n');
}

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

client.on('interactionCreate', async interaction => {
  if (!interaction.isCommand()) return;

  const { commandName } = interaction;

  if (commandName === 'ping') {
    await interaction.reply('Pong 🏓');
  }
  else if (commandName === 'method') { // it does not seem to work the same as .method, not sure why, this is kinda confusing and uncommented.
    const methodName = interaction.options.getString('method_name', true);
    const usageId = interaction.options.getInteger('usage_id', false) ?? -1;

    let shorterMatches = [], longerMatches = [];

    const complexName = isComplex(methodName); // cahcing whether the methodName is complex
    // iterate over all the methods.
    for (const index in methodsIndex) {
      const method = methodsIndex[index];
      // check whether it's a exact match.
      if (index === methodName) {
        return interaction.reply({ embeds: [createMethodEmbed({ ...method, usageId })] });
      }
      else if (complexName || !isComplex(index)) {
        if (index.includes(methodName)) longerMatches.push(method); // found a longer match
        else if (longerMatches.length === 0 /* small speed improvement */ && methodName.includes(index)) shorterMatches.push(method) // found a single shorter match incase no longer matches are found
      }
    }

    if (longerMatches.length === 1) { // has one longer match
      const embed = createMethodEmbed({ ...longerMatches[0], usageId });
      const extendFooter = `Didn't find an exact match for '${methodName}' but instead found a longer match.`

      embed.setFooter(embed.footer?.text ? `${embed.footer.text}\n${extendFooter}` : extendFooter);

      return interaction.reply({ embeds: [embed] });

    }
    else if (shorterMatches.length === 1) { // or has one shorter match
			const embed = createMethodEmbed({ ...shorterMatches[0], usageId });
			const extendFooter = `Didn't find an exact match for '${methodName}' but instead found a shorter match.`
      
			embed.setFooter(embed.footer?.text ? `${embed.footer.text}\n${extendFooter}` : extendFooter);

      return interaction.reply({ embeds: [embed] });
    }

    const failEmbed = new Discord.MessageEmbed();

    if (longerMatches.length + shorterMatches.length === 0) failEmbed.setTitle('No results found ⚠')
    else {
      failEmbed
        .setTitle('No exact match')
        .setDescription('But found those shorter/longer matches:');

      if (longerMatches.length !== 0) failEmbed.addField('Longer matches', generateMatchesList(longerMatches));
      if (shorterMatches.length !== 0) failEmbed.addField('Shorter matches', generateMatchesList(shorterMatches));
    }

    return interaction.reply({ embeds: [failEmbed] });
  };
});

const stop = () => client.destroy();
process.on('SIGINT', stop);
process.on('SIGTERM', stop);

client.login(config.botToken);
