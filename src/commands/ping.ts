import { Command } from 'discord-akairo';
import { Message } from 'discord.js';

class Ping extends Command {
    constructor() {
        super('ping', {
            aliases: ['ping']
        });
    }
    exec(message: Message) {
        message.channel.send('Pong 🏓');
    }
}
module.exports = Ping;