const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js')
const ColorThief = require('colorthief')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('minecraft-skin')
		.setDescription('Grab a specific Minecraft skin')
		.addStringOption(option =>
			option.setName('username')
				.setDescription('Minecraft Java Edition username')
				.setRequired(true)
		)
		.addStringOption(option =>
			option.setName('pose')
				.setDescription('Set a pose for the player')
				.setRequired(false)
				.addChoices(
					{ name: 'Default', value: 'default' },
					{ name: 'Walking', value: 'walking' },
					{ name: 'Back', value: 'back' },
					{ name: 'Dead', value: 'dead' },
					{ name: 'Flat', value: 'pixel' },
					{ name: 'Skin File', value: 'skin' },
				)
		)
		.addStringOption(option =>
			option.setName('cape')
				.setDescription('Show cape?')
				.setRequired(false)
				.addChoices(
					{ name: 'Yes', value: 'true' },
					{ name: 'No', value: 'false' },
				)
		)
		.setIntegrationTypes(0, 1)
		.setContexts(0, 1, 2),

	async execute(interaction) {
		const embed = new EmbedBuilder()

		const username = interaction.options.getString('username')
		const usernameCheckRequest = await fetch(`https://starlightskins.lunareclipse.studio/info/user/${username}`)
		if (!usernameCheckRequest.ok) {
			embed.setDescription('Player not found!')
			embed.setColor(MICKBOT_RED)
			await interaction.reply({ embeds: [embed] })
			return;
		}

		let renderType = 'default'
		let crop = 'full'
		let extraParameters = 'borderHighlight=true&borderHighlightRadius=10&dropShadow=true&renderScale=2'

		// Check if user gave an optional pose
		if (interaction.options.getString('pose')) {
			renderType = interaction.options.getString('pose')

			switch (interaction.options.getString('pose')) {
				case 'skin':
					crop = 'default'
					break
				case 'back':
					renderType = 'default'
					extraParameters += '&cameraPosition={"x":"30","y":"36","z":"45"}'
					break
			}
		}

		if (interaction.options.getString('cape')) {
			extraParameters += `&capeEnabled=${interaction.options.getString('cape')}`
		}

		const embedColor = await ColorThief.getColor(`https://starlightskins.lunareclipse.studio/render/pixel/${username}/full?capeEnabled=false`)

		embed.setImage(`https://starlightskins.lunareclipse.studio/render/${renderType}/${username}/${crop}?${extraParameters}`)
		embed.setDescription(`## <:mc_grass_block:1339388489715814410> \`${username}\``)
		embed.setColor(embedColor)

		const nameMcButton = new ButtonBuilder()
			.setLabel('NameMC Profile')
			.setEmoji('1332934063530446889')
			.setURL(`https://namemc.com/profile/${username}`)
			.setStyle(ButtonStyle.Link)

		const row = new ActionRowBuilder()
			.addComponents(nameMcButton)

		await interaction.reply({
			embeds: [embed],
			components: [row],
		})
	},
}
