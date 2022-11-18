const { client } = require('./client');
const fs = require('fs');
const log = require('log-beautify');

// const eventFiles = fs.readdirSync('./events').filter(file => file.endsWith('.js'));
const eventFiles = [];

for (const file of eventFiles) {
	const event = require(`../events/${file}`);
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args));
	} else {
		client.on(event.name, (...args) => event.execute(...args));
	}
}

log.info(`Registered ${eventFiles.length} event files`)