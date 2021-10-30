const { client } = require('./client');


let tickInterval = process.env.TICK_INTERVAL * 1000;
let guilds = ["524955529387180032"];

setInterval(() => {
    guilds.forEach(guild => {
        tickGuild(guild);
    });
}, tickInterval);

function tickGuild(guild) {
    client.guilds.fetch(guild).then(guild => {        
        guild.channels.cache.forEach(channel => {
            tickChannel(channel);
        })
    }).catch(error => {
        console.log(error);
    });
}

function tickChannel(channel) {
    // console.log(channel);
    // client.channels.fetch(channel.id).then(channel => {
    //     channel.members.forEach(member => tickMember(member));
    // }).catch(err => {error(err)});
}

function tickMember(member) {
    console.log(member);
}