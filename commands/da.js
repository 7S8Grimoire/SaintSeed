const {
  SlashCommandBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  ComponentType,
  EmbedBuilder,
} = require("discord.js");
const i18next = require("i18next");
const moment = require('moment');
const { profiles, api } = require("../modules/api");
const { data } = require("./pray");

const owner_id = "240491981426393088";
const anton_id = "281478128629579776";
const piu_piu_id = "319116123612119040";
const EXP_MONEY = 1;
const EXP_NOT_MONEY = 2;
const NOT_EXP_MONEY = 3;
const NOT_EXT_NOT_MONEY = 4;

module.exports = {
  disabled: true,
  // categories: ["command_spam", "roulette"],
  guilds_white_list: [process.env.BREAD_BAKERY_ID],
  data: new SlashCommandBuilder()
    .setName("1-act")
    .setDescription("Start 1 act"),
  async execute(interaction) {
    if (interaction.user.id == anton_id) {
      return await interaction.reply('А я знаю чего ты хочешь, но увы Мы тебя знаем');
    }
    if (interaction.user.id != owner_id) {
      return await interaction.reply('Спасибо что проверяете меня 😚');
    }

    const timestamp = moment().unix();
    const buttonId = `act-1-start-${timestamp}`;
    const startFirstAct = new ButtonBuilder()
      .setCustomId(buttonId)
      .setLabel("Та самая красная кнопка")
      .setStyle(ButtonStyle.Danger);

    let row = new ActionRowBuilder().addComponents(startFirstAct);

    await interaction.deferReply();

    let act1 = await interaction.editReply({
      components: [row],
    });

    const filter = (i) => {
      return i.customId === buttonId && i.user.id === anton_id;
    };

    const collector = await act1.createMessageComponentCollector({
      componentType: ComponentType.Button,
      filter,
    });

    collector.on("collect", async (i) => {
      row = row.setComponents(startFirstAct.setDisabled(true));
      collector.stop();
      interaction.editReply({
        components: [row]
      });
      part_1(i);
    });
  },
};

async function part_1(interaction) {
  await interaction.deferReply();

  const timestamp = moment().unix();
  const embed = new EmbedBuilder()
    .setTitle('Акт 1 - Освободись')
    .setDescription(getText_1());

  const buttonId = `continue-${timestamp}`;
  const continueAct = new ButtonBuilder()
    .setCustomId(buttonId)
    .setLabel("Да, я уверен!")
    .setStyle(ButtonStyle.Primary);

  const row = new ActionRowBuilder().addComponents(continueAct);

  const message = await interaction.editReply({
    embeds: [embed],
    components: [row],
  });

  const filter = (i) => {
    return i.customId === buttonId && i.user.id === anton_id;
  };

  const collector = await message.createMessageComponentCollector({
    componentType: ComponentType.Button,
    filter,
  });

  collector.on("collect", async (i) => {
    collector.stop();
    part_2(i);
  });
}

async function part_2(interaction) {
  await interaction.deferReply();

  const timestamp = moment().unix();
  const embed = new EmbedBuilder()
    .setDescription(getText_2());

  const moneyButtonId = `money-${timestamp}`;
  const processButtonId = `process-${timestamp}`;
  const moneyButton = new ButtonBuilder()
    .setCustomId(moneyButtonId)
    .setLabel("деньги")
    .setStyle(ButtonStyle.Primary);
  const processButton = new ButtonBuilder()
    .setCustomId(processButtonId)
    .setLabel("Процесс")
    .setStyle(ButtonStyle.Primary);
  const row = new ActionRowBuilder().addComponents(moneyButton, processButton);

  const message = await interaction.editReply({
    embeds: [embed],
    components: [row],
  });

  const filter = (i) => {
    return (i.customId === moneyButtonId || i.customId === processButtonId) && i.user.id === piu_piu_id;
  };

  const collector = await message.createMessageComponentCollector({
    componentType: ComponentType.Button,
    filter,
  });

  collector.on("collect", async (i) => {
    collector.stop();
    const choose = {
      is_money: i.customId === moneyButtonId
    };
    part_3(i, choose);
  });

}

async function part_3(interaction, choose) {
  await interaction.deferReply();

  const timestamp = moment().unix();
  const embed = new EmbedBuilder()
    .setDescription(getText_3(choose));

  const expButtonId = `exp-${timestamp}`;
  const praysButtonId = `prays-${timestamp}`;
  const expButton = new ButtonBuilder()
    .setCustomId(expButtonId)
    .setLabel("Экспи")
    .setStyle(ButtonStyle.Primary);
  const praysButton = new ButtonBuilder()
    .setCustomId(praysButtonId)
    .setLabel("Молитвы")
    .setStyle(ButtonStyle.Primary);
  const row = new ActionRowBuilder().addComponents(expButton, praysButton);

  const message = await interaction.editReply({
    embeds: [embed],
    components: [row],
  });

  const filter = (i) => {
    return (i.customId === expButtonId || i.customId === praysButtonId) && i.user.id === piu_piu_id;
  };

  const collector = await message.createMessageComponentCollector({
    componentType: ComponentType.Button,
    filter,
  });

  collector.on("collect", async (i) => {
    collector.stop();
    choose.is_exp = i.customId === expButtonId;
    part_4(i, choose);
  });
}

async function part_4(interaction, choose) {
  await interaction.deferReply();

  const embed = new EmbedBuilder()
    .setDescription(getText_4(choose));


  if (getResult(choose) == EXP_MONEY) {
    let data = [
      {
        user_id: piu_piu_id,
        guild_id: process.env.BREAD_BAKERY_ID,
        experience: 8 * 1000 * 1000,
      },
      {
        user_id: anton_id,
        guild_id: process.env.BREAD_BAKERY_ID,
        experience: 8 * 100 * 1000,
      }
    ];
    profiles.bulkAdd(data);
  }
  else if (getResult(choose) == EXP_NOT_MONEY) {
    let data = [
      {
        user_id: piu_piu_id,
        guild_id: process.env.BREAD_BAKERY_ID,
        experience: 8 * 1000 * 1000 + 8 * 100 * 1000,
      },
    ];
    await profiles.bulkAdd(data);
  }
  else if (getResult(choose) == NOT_EXP_MONEY) {

  }
  else if (getResult(choose) == NOT_EXT_NOT_MONEY) {
    let data = [
      {
        user_id: piu_piu_id,
        guild_id: process.env.BREAD_BAKERY_ID,
        experience: 8 * 100 * 1000,
      },
    ];
    await profiles.bulkAdd(data);
  }

  const savePiuPiuPrays = getResult(choose) == NOT_EXT_NOT_MONEY || getResult(choose) == NOT_EXP_MONEY;  
  const experienceEarnedList = [];

  await api.get(`profile/${process.env.BREAD_BAKERY_ID}`, {
    params: {
      limit: 0
    }
  })
    .then(({ data }) => {
      if (savePiuPiuPrays) {
        data = data.filter(profile => profile.user_id != piu_piu_id);
      }
      const mappedPizdecZeroing = data.map(profile => {
        const earnedExperience = profile.pray?.total * 9 * 1000;
        experienceEarnedList.push({
          user_id: profile.user_id,
          earnedExperience: earnedExperience,
          had_total: profile.pray?.total,
        });        
        return {
          user_id: profile.user_id,
          guild_id: profile.guild_id,
          experience: profile.experience + earnedExperience,
          pray: {
            date: 0,
            streak: 0,
            total: 0
          }
        }
      });

      api.patch(`profile`, mappedPizdecZeroing);

    });
  
  const convertedEmbed = new EmbedBuilder()
    .setTitle('Топ конвертов')
    .addFields(experienceEarnedList.slice(0, 10).map(earned => {
      return {
        name: interaction.guild.members.cache.get(earned.user_id).displayName,
        value: `${earned.had_total} преев => ${earned.earnedExperience} експи`,
      }
    }));

  await interaction.editReply({
    embeds: [embed, convertedEmbed],
    components: [],
  });
}

function getText_1() {
  const texts = [
    'Когда−то я была ангелом−рабом бога «Ангелов». Любое действие, что шло против её приказов, несло за собой наказание. Она любила нас пытать. А то, что люди называли нимбом и являлось для них божественным символом, было для нас ошейником, который в любой момент мог убить нас. Однажды она мне и еще нескольким ангелам приказала убить семью демона и человека. У них был ребёнок, полу−демон. Я была против убийства этой семьи, но со мной были другие ангелы, что уже потеряли рассудок и не хотели страдать – я же спрятала ребёнка, пока никто не видел. Как наказание я лишилась правой руки и правой ноги. Из меня сделали обычного сборщика душ и примерно одно столетие я просто собирала души погибших существ, чтобы лишить демонов пищи. Иногда подталкивала людей на конфликты, по типу войн или обычных убийств. Я была раздраженная, тем что люди покланяются столь ужасному, хуже демона, существу.',
    'Через время объявился Фер, наш бывший король, предложил, тем у кого еще остался рассудок, сбежать. Он сказал, что нашёл демонов готовых нам помочь − они были готовы помочь нам сломать нимбы. Но оказалось, что заключил он сделку для себя − он отдал нас на съедение демонам. Наши нимбы и в правду сломались, но после этого мы потеряли силы и даже держаться на ногах не могли, а куда мне с одной. Фер с коварной улыбкой на лице говорил: «Спасибо!». Я же ползла по земле, пытаясь спрятаться, мне было страшно, а позади крики. Я хотела как можно дольше побыть свободной без этого нимба. Но меня остановил один демон. Взял и поднял за левую руку, как подушку. Я не могла разглядеть его, в глазах всё мылилось от слёз. Он мне сказал: «Давно не виделись, Уно». Затем, одним движением руки, сквозь плоть и кости, схватился за моё сердце. Я почувствовала, как что−то внутри лопнуло и пропало. В глазах помутнело, на душе стало подозрительно легко и мысли утихли. Эта пустота показалась мне свободой, которую я так долго желала.',
    'А ты уверен в том, что делаешь?'
  ];

  return texts.join('\n\n');
}

function getText_2() {
  const texts = [
    'После я очнулась на земле, лучи солнца светили мне прямо в глаза, а голова раскалывалась. Я немного приподнялась и увидела, как дикие волки лакомились падалью моих, уже мёртвых, собратьев. Пока я смотрела на этих волков, во мне проснулся голод. Я, недолго размышляя, инстинктивно набросилась на ближайшего и отрубила ему голову и уже держала в своей, не осознанной, правой руке. А сама при этом стояла на двух ногах. Рука и нога были чёрными, свет их попросту не освещал, даже поглощался. Не понимая еще своего голода, я поймала и полакомилась остальными волками. После пришла к выводу, что рука и нога демонические, а на память пришло то, как моё сердце сдавил демон, перед этим еще поблагодарил. Мне захотелось попытаться взлететь, но мои прекрасные белые крылья не слушались меня. Я задумалась, а может это жизнь после смерти или просто вечный сон?',
    'Я продолжила бродить по лесу и меня никак не отпускал вопрос – почему я сейчас «Жива»?',
    'А что для тебя, <@319116123612119040>, важней - заработанные деньги или процесс зарабатывания денег?'
  ];

  return texts.join('\n\n');
}

function getText_3(choose) {
  const texts = [
    choose.is_money
      ? 'Значит тебе нравится результат, а мне доставляет больше процесс, результат обычно одноразовый.'
      : 'Мы с тобой чем-то похожи. *Уно стала относится к тебе лучше*',
    `Тогда я тебе предложу такое, ты получишь ${choose.is_money ? '8.000.000' : '8.800.000'} експи, но потеряешь свои молитвы`,
    'Или ты сохранишь свои молитвы, займешь первое место в списке молитв и добьешься 365 дней молитв?',
  ];

  return texts.join('\n\n');
}

function getText_4(choose) {
  let texts = [];

  if (getResult(choose) == EXP_MONEY) {
    texts = [
      'Это было очевидно, раз уж тебе нравится мгновенный результат. Обнуляю молитвы.',
      '<@281478128629579776>, ты мой самый преданный всё же слуга!',
      '<@319116123612119040> был проспонсирован "Чёрными Крыльями" на 8.000.000 експи',
      '<@281478128629579776> был проспонсирован "Чёрными Крыльями" на 800.000 експи'
    ];
  }
  else if (getResult(choose) == EXP_NOT_MONEY) {
    texts = [
      'Я была немного другого мнения о тебе. *Уно задумалась*',
      '<@319116123612119040> был проспонсирован "Чёрными Крыльями" на 8.800.000 експи',
    ];
  }
  else if (getResult(choose) == NOT_EXP_MONEY) {
    texts = [
      '*Уно стала относиться к тебе немного лучше*',
    ];
  }
  else if (getResult(choose) == NOT_EXT_NOT_MONEY) {
    texts = [
      'Я гуляла по лесу и никак не могла насыться, голод меня не отпускал и усиливался. Я вырезала всю фауну, что попадалась мне – лисы, волки, медведи, зайцы, птицы, ёжики, крысы и даже насекомые. Это точно сон…',
      'Меня радует твой выбор. В подарок получишь немного бонуски.',
      '<@319116123612119040> был проспонсирован "Чёрными Крыльями" на 800.000 експи',
    ];
  }

  return texts.join('\n\n');
}

function getResult(choose) {
  if (choose.is_exp && choose.is_money) {
    return EXP_MONEY;
  }
  if (choose.is_exp && !choose.is_money) {
    return EXP_NOT_MONEY;
  }
  if (!choose.is_exp && choose.is_money) {
    return NOT_EXP_MONEY;
  }
  if (!choose.is_exp && !choose.is_money) {
    return NOT_EXT_NOT_MONEY;
  }
}
