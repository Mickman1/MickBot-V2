const { SlashCommandBuilder } = require('@discordjs/builders')

const { EmbedBuilder } = require('discord.js')
const ColorThief = require('colorthief')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('minecraft-skin')
		.setDescription('Grab a specific Minecraft skin')
		.addStringOption(option =>
			option.setName('username')
				.setDescription('Minecraft Java Edition skin username')
				.setRequired(true)
		)
		.addStringOption(option =>
			option.setName('pose')
				.setDescription('Avatar pose for skin image')
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
		),
		
	async execute(interaction) {
		const embed = new EmbedBuilder()

		const username = interaction.options.getString('username')
		let usernameCheckRequest = await fetch(`https://starlightskins.lunareclipse.studio/render/skin/${username}/default`)
		if (!usernameCheckRequest.ok) {
			embed.setDescription('Player not found!')
			embed.setColor(MICKBOT_RED)
			await interaction.reply({ embeds: [embed] })
			return;
		}

		let renderType = 'default'
		let crop = 'full'
		let extraParameters = ''

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

		let embedColor = await ColorThief.getColor(`https://starlightskins.lunareclipse.studio/render/pixel/${username}/full?capeEnabled=false`)

		embed.setImage(`https://starlightskins.lunareclipse.studio/render/${renderType}/${username}/${crop}?borderHighlight=true&borderHighlightRadius=10&dropShadow=true&renderScale=2${extraParameters}`)
		embed.setAuthor({
			name: 'NameMC',
			iconURL: 'https://media.discordapp.net/attachments/596928630009888781/1332654267068190792/namemc_icon.webp',
			url: `https://namemc.com/profile/${username}`,
		})
		embed.setTitle(username)
		embed.setColor(embedColor)

		await interaction.reply({ embeds: [embed] })
	},
}
