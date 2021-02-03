import { AkairoClient, AkairoOptions, CommandHandler, ListenerHandler } from 'discord-akairo';
import { BitFieldResolvable, IntentsString } from 'discord.js';

interface LikoOptions extends AkairoOptions {
	intents: BitFieldResolvable<IntentsString> | number,
	token: string,
	prefix: string
}

class LikoClient extends AkairoClient {
	commandHandler: CommandHandler;
	listenerHandler: ListenerHandler;
	prefix: string;
	constructor(options: LikoOptions) { // correct? idk, I don't use ts much
		options = Object.assign({}, {
			intents: 513,
			prefix: '.',
			presence: {
				status: 'online',
				activity: {
					name: "VSCode",
					type: 'WATCHING'
				}
			}
		}, options);

		super(options);

		this.prefix = options.prefix;
		this.token = options.token;
		
		this.commandHandler = new CommandHandler(this, {
			prefix: this.prefix,
			directory: __dirname + '/../commands/',// could maybe be improved, but I just do it this way
			// autoCategories: true // could maybe be added, but there is not much commands for this to be needed
		});

		this.listenerHandler = new ListenerHandler(this, {
			directory: __dirname + '/../listeners/'
		});
	}
	init() {
		this.commandHandler.useListenerHandler(this.listenerHandler);
		
		this.listenerHandler.loadAll();
		this.commandHandler.loadAll(); // there is a specific reason for this order
	}
	// nice optimisation I like to make
	login(token: any): Promise<string> {
		return super.login(token || this.token);
	}
}
module.exports = LikoClient;