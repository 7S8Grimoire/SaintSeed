const { SlashCommandBuilder, EmbedBuilder, bold, time, TimestampStyles } = require('discord.js');
const i18next = require('i18next');
const { profiles } = require('../modules/api');
const { contributors, master_id } = require('../config/pistachios-config.json');
const moment = require('moment');
const { paginationEmbed } = require("../modules/helpers");

module.exports = {
  categories: ["command_spam"],
  guilds_white_list: [process.env.BREAD_BAKERY_ID],
  data: new SlashCommandBuilder()
    .setName('pistachio')
    .setDescription('pistachio record control')
    .addSubcommand((subcommand) =>
      subcommand.setName("info").setDescription("Get pistachio info")
    )
    .addSubcommand((subcommand) =>
      subcommand.setName("list").setDescription("Get list of pistachio records")
    )
    .addSubcommand((subcommand) =>
      subcommand.setName("register")
        .setDescription("Register pistachio record")
        .addIntegerOption((option) => {
          option.setName('grams').setDescription('How many grams').setRequired(true);
          option.min_value = 1;
          return option;
        })
    )
    .addSubcommand((subcommand) =>
      subcommand.setName("edit").setDescription("Edit pistachio record")
        .addIntegerOption(option => {
          option.setName('index').setDescription('Index of record').setRequired(true);
          option.min_value = 1;
          return option;
        })
        .addIntegerOption((option) => {
          option.setName('grams').setDescription('How many grams').setRequired(true);
          option.min_value = 1;
          return option;
        })
    )
    .addSubcommand((subcommand) =>
      subcommand.setName("remove").setDescription("Remove pistachio record")
        .addIntegerOption(option => {
          option.setName('index').setDescription('Index of record').setRequired(true);
          option.min_value = 1;
          return option;
        })
    ),
  async execute(interaction) {    
    const subCommand = interaction.options.getSubcommand();
    const profile = await profiles.show(interaction.guild.id, master_id);
    if (subCommand == 'info') {
      return info(interaction, profile);
    }

    if (subCommand == 'list') {
      return list(interaction, profile);
    }

    if (!contributors.includes(interaction.user.id)) {
      return await interaction.reply({
        content: "Ты не достоин этой возможности, пока не постигнешь фисташковое ремесло",
        ephemeral: true,
      });
    }

    if (subCommand == 'register') {
      return register(interaction, profile);
    }

    if (subCommand == 'edit') {
      return edit(interaction, profile);
    }

    if (subCommand == 'remove') {
      return remove(interaction, profile);
    }
  },
};

async function info(interaction, profile) {  
  const master = await interaction.guild.members.fetch(master_id);
  const pistachios_records = profile.data?.pistachios_records ?? [];
  const gram = pistachios_records.reduce((accumulator, record) => accumulator += record.grams, 0);
  const percentage = gram ? Math.round(gram / 10) / 100 : 0;  
  const embed = new EmbedBuilder()
    .setTitle('Статус обфисташкивания')
    .setThumbnail(master.displayAvatarURL({ extension: 'png' }))
    .setColor(master.displayHexColor)
    .setFields([
      {
        name: 'Позывной',
        value: master.displayName,
      },
      {
        name: 'Актов обфисташкования',
        value: `${ pistachios_records.length }`,
      },
      {
        name: "Грамм",
        value: `${ gram }`,
      },
      {
        name: 'Процент',
        value: `${percentage}%`,
      }
    ]);

  await interaction.reply({
    embeds: [embed]
  });
}

async function list(interaction, profile) {
  const master = await interaction.guild.members.fetch(master_id);
  const pistachios_records = profile.data?.pistachios_records ?? [];
  const itemsPerList = 20;
  const pages = [];
  const fields = pistachios_records
    .sort((a, b) => {
      return a.created_at - b.created_at;
    })
    .map((record, index) => {    
      return {
        name: `#${ index + 1 } | ${time(new Date(record.created_at * 1000), TimestampStyles.ShortDateTime)}`,
        value: `${ record.grams } грамм`
      }
    }).reverse();

  let itemCount = 0;
  let tempPage = [];
  fields.forEach((field, index) => {
    itemCount++;
    tempPage.push(field);
    if (itemCount == itemsPerList || index + 1 == fields.length) {
      pages.push(tempPage);
      tempPage = [];
    }
  });

  const embeds = [];
  pages.forEach(page => {
    const embed = new EmbedBuilder()
      .setTitle('Регистр фисташек')
      .setColor(master.displayHexColor)
      .addFields(page);    
    embeds.push(embed);
  });
  
  return paginationEmbed(interaction, embeds, Infinity);
}

async function register(interaction, profile) {
  const { guild, user } = interaction;
  const grams = interaction.options.getInteger("grams");
  const pistachios_records = profile.data?.pistachios_records ?? [];
  const record = {
    grams: grams,
    created_at: moment().unix(),
    updated_at: moment().unix(),
  }

  pistachios_records.push(record);

  await profiles.add(guild.id, master_id, {
    data: {
      pistachios_records: pistachios_records
    }
  });

  await interaction.reply({
    content: `${bold(grams)} грамм фисташек зарегистрировано`
  });
}

async function edit(interaction, profile) {
  const index = interaction.options.getInteger("index");
  const grams = interaction.options.getInteger("grams");
  let pistachios_records = profile.data?.pistachios_records ?? [];

  if (!pistachios_records.length || index > pistachios_records.length) {
    return await interaction.reply({
      content: `Нечего обновлять`,
      ephemeral: true
    });
  }

  pistachios_records[index - 1].grams = grams;
  await profiles.add(interaction.guild.id, master_id, {
    data: {
      pistachios_records: pistachios_records
    }
  });
  return await interaction.reply({
    content: `запись ${bold(index + '#')} обновлена`,
    ephemeral: true
  });
}

async function remove(interaction, profile) {
  const index = interaction.options.getInteger("index");
  let pistachios_records = profile.data?.pistachios_records ?? [];
  
  if (!pistachios_records.length || index > pistachios_records.length) {
    return await interaction.reply({
      content: `Убирать нечего`,
      ephemeral: true
    });
  }
  
  pistachios_records.splice(index - 1, 1);

  await profiles.add(interaction.guild.id, master_id, {
    data: {
      pistachios_records: pistachios_records
    }
  });
  return await interaction.reply({
    content: `запись ${bold(index + '#')} убрана`,
    ephemeral: true
  });
}