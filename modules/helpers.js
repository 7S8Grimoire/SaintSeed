// https://www.npmjs.com/package/discordjs-button-pagination
const {        
    EmbedBuilder,    
    ButtonBuilder,
    ActionRowBuilder,
    ButtonStyle,
    ComponentType,
  } = require("discord.js");
const i18next = require("i18next");
  
  /**
   * Creates a pagination embed
   * @param {Interaction} interaction
   * @param {EmbedBuilder[]} pages
   * @param {MessageButton[]} buttonList
   * @param {number} timeout
   * @returns
   */
  const paginationEmbed = async (
    interaction,
    pages,    
    timeout = 10000
  ) => {
    if (!pages) throw new Error("Pages are not given.");    
    
    const timestamp = require("moment")().unix();
    const previousBtn = new ButtonBuilder()
      .setCustomId(`previousBtn-${timestamp}`)
      .setLabel(i18next.t('pagination.prev'))
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(true);      
    const nextBtn = new ButtonBuilder()
      .setCustomId(`nextBtn-${timestamp}`)
      .setLabel(i18next.t('pagination.next'))
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(pages.length == 1);

    const row = new ActionRowBuilder().addComponents(previousBtn, nextBtn);

    pages.forEach((page, index) => {
      page.setFooter({ text: `Page ${index + 1} / ${pages.length}` });
    });
    let page = 0;
  
    //has the interaction already been deferred? If not, defer the reply.
    if (interaction.deferred == false) {
      await interaction.deferReply();
    }
  
    const curPage = await interaction.editReply({
      embeds: [pages[page]],
      components: [row],
      fetchReply: true,
    });
  
  
    const filter = (i) => {      
      return i.customId === previousBtn.data.custom_id || i.customId === nextBtn.data.custom_id;
    }
  
    const collector = await curPage.createMessageComponentCollector({
      componentType: ComponentType.Button,
      filter,
      time: timeout,
    });
  
    collector.on("collect", async (i) => {
      previousBtn.setDisabled(false);
      nextBtn.setDisabled(false);
      
      if (i.customId == previousBtn.data.custom_id) {        
        if (page > 0) page--;
      }

      if (i.customId == nextBtn.data.custom_id) {        
        if (page + 1 <= pages.length) page++;
      }

      if (page == 0) {        
        previousBtn.setDisabled(true);
      }
      if (page + 1 == pages.length) {        
        nextBtn.setDisabled(true);
      }

      const newRow = new ActionRowBuilder().addComponents(previousBtn, nextBtn);      
      await i.deferUpdate();
      await i.editReply({
        embeds: [pages[page]],
        components: [newRow],
      });      
      
      collector.resetTimer();
    });
  
    collector.on("end", (_, reason) => {      
      if (reason !== "messageDelete") {
        const disabledRow = new ActionRowBuilder().addComponents(
          previousBtn.setDisabled(true),
          nextBtn.setDisabled(true)
        );
        curPage.edit({
          embeds: [pages[page]],
          components: [disabledRow],
        });
      }
    });
  
    return curPage;
  };

exports.sleep = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
}

exports.paginationEmbed = paginationEmbed;
  