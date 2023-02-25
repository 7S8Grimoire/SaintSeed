// https://www.npmjs.com/package/discordjs-button-pagination
import {
	EmbedBuilder,
	ButtonBuilder,
	ActionRowBuilder,
	ButtonStyle,
	ComponentType,
} from "discord.js";
import i18next from "i18next";

/**
 * Creates a pagination embed
 * @param {Interaction} interaction
 * @param {EmbedBuilder[]} pages
 * @param {MessageButton[]} buttonList
 * @param {number} timeout
 * @returns
 */
export async function paginationEmbed(
	interaction,
	pages,
	timeout = 10000,
	ephemeral = false
) {
	if (!pages) throw new Error("Pages are not given.");

	const timestamp = require("moment")().unix();
	const prevBtnId = `previousBtn-${timestamp}`;
	const nextBtnId = `nextBtn-${timestamp}`;
	const previousBtn = new ButtonBuilder()
		.setCustomId(prevBtnId)
		.setLabel(i18next.t("pagination.prev"))
		.setStyle(ButtonStyle.Secondary)
		.setDisabled(true);
	const nextBtn = new ButtonBuilder()
		.setCustomId(nextBtnId)
		.setLabel(i18next.t("pagination.next"))
		.setStyle(ButtonStyle.Secondary)
		.setDisabled(pages.length == 1);

	const row = new ActionRowBuilder().addComponents(previousBtn, nextBtn);

	pages.forEach((page, index) => {
		page.setFooter({ text: `Page ${index + 1} / ${pages.length}` });
	});
	let page = 0;

	//has the interaction already been deferred? If not, defer the reply.
	if (interaction.deferred == false) {
		await interaction.deferReply({ ephemeral: ephemeral });
	}

	const curPage = await interaction.editReply({
		embeds: [pages[page]],
		components: [row],
		fetchReply: true,
	});

	const filter = (i) => {
		return i.customId === prevBtnId || i.customId === nextBtnId;
	};

	const collector = await curPage.createMessageComponentCollector({
		componentType: ComponentType.Button,
		filter,
		time: timeout,
	});

	collector.on("collect", async (i) => {
		previousBtn.setDisabled(false);
		nextBtn.setDisabled(false);

		if (i.customId == prevBtnId) {
			if (page > 0) page--;
		}

		if (i.customId == nextBtnId) {
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
}

export function sleep(ms: number) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

export function formatBytes(bytes, decimals) {
	if (bytes == 0) return "0 Bytes";
	var k = 1024,
		dm = decimals || 2,
		sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"],
		i = Math.floor(Math.log(bytes) / Math.log(k));
	return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}
