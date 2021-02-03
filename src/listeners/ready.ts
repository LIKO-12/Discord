import { Listener } from 'discord-akairo';

class Ready extends Listener {
    constructor() {
        super('ready', {
            emitter: 'client',
            event: 'ready'
        });
    }
    exec() {
        console.log('I\'m ready!');
    }
}
module.exports = Ready;