const { SlashCommandBuilder } = require('@discordjs/builders')

const servers = ['Adamantoise','Aegis','Alexander','Anima','Asura','Atomos','Bahamut','BaiJinHuanXiang','BaiYinXiang','Balmung','Behemoth','Belias','Bismarck','Brynhildr','Cactuar','Carbuncle','Cerberus','ChaoFengTing','ChenXiWangZuo','Chocobo','Coeurl','Diabolos','Durandal','Excalibur','Exodus','Faerie','Famfrit','Fenrir','FuXiaoZhiJian','Garuda','Gilgamesh','Goblin','Gungnir','Hades','HaiMaoChaWu','HongYuHai','HuanYingQunDao','HuPoYuan' ,'Hyperion','Ifrit','Ixion','Jenova','JingYuZhuangYuan','Kujata','Lamia','LaNuoXiYa','Leviathan','Lich','Longchaoshendian','Louisoix','LvRenZhanQiao','Malboro','Mandragora','Masamune','Mateus','MengYaChi','MengYuBaoJing','Midgardsormr','MoDuNa','Moogle','Odin','Omega','Pandaemonium','Phoenix','Ragnarok','Ramuh','Ravana','Ridill','RouFengHaiWan','Sargatanas','Sephirot','ShenQuanHen','ShenYiZhiDi','Shinryu','Shiva','Siren','Sophia','Spriggan','Tiamat','Titan','Tonberry','Twintania','Typhon','Ultima','Ultros','Unicorn','Valefor','WoXianXiRan','YanXia','Yojimbo','YuZhouHeYin','Zalera','Zeromus','ZiShuiZhanQiao','Zodiark','Zurvan']

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ffxiv')
		.setDescription('Search for Final Fantasy XIV character profile')
		.addStringOption(option =>
			option.setName('name')
				.setDescription('Character name to search for (Spaces allowed)')
				.setRequired(true)
		)
		.addStringOption(option =>
			option.setName('server')
				.setDescription('Character\'s home server (North America only)')
				.setRequired(true)
				.addChoices([
					['Adamantoise', 'adamantoise'],
					['Cactuar', 'cactuar'],
					['Faerie', 'faerie'],
					['Gilgamesh', 'gilgamesh'],
					['Jenova', 'jenova'],
					['Midgardsormr', 'midgardsormr'],
					['Sargatanas', 'sargatanas'],
					['Siren', 'siren'],
					['Behemoth', 'behemoth'],
					['Excalibur', 'excalibur'],
					['Exodus', 'exodus'],
					['Famfrit', 'famfrit'],
					['Hyperion', 'hyperion'],
					['Lamia', 'lamia'],
					['Leviathan', 'leviathan'],
					['Ultros', 'ultros'],
					['Balmung', 'balmung'],
					['Brynhildr', 'brynhildr'],
					['Coeurl', 'coeurl'],
					['Diabolos', 'diabolos'],
					['Goblin', 'goblin'],
					['Malboro', 'malboro'],
					['Mateus', 'mateus'],
					['Zalera', 'zalera'],
				])
		),
		
	async execute(interaction) {
		const { MessageEmbed } = require('discord.js')
		const embed = new MessageEmbed()

		// Load XVIAPI token for avoiding rate limit
		const { xivapiToken } = require('../config/xivapiToken.json')
		const XIVAPI = require('@xivapi/js')
		const xiv = new XIVAPI({
			private_key: xivapiToken,
			language: 'en',
			snake_case: true
		})
		
		let name = interaction.options.getString('name')
		let server = interaction.options.getString('server')

		// Defer the reply until data comes back, then send embed
		await interaction.deferReply()

		// Search for character using given name and server
		let character = await xiv.character.search(name, { server: server })

		// Check if FFXIV API couldn't find a character
		if (character.results.length === 0) {
			//embed.setAuthor({ name: 'No character found!' })
			embed.setDescription('No character found!')
			embed.setColor(MICKBOT_RED)
			return await interaction.editReply({ embeds: [ embed ] });
		}

		character = character.results[0]
		let characterID = character.id

		console.log(character)

		let characterData = await xiv.character.get(characterID)

		console.log(characterData)

		embed.setAuthor({ name: character.name, iconURL: character.avatar })
		embed.setFooter({ text: character.server })
		embed.setImage(characterData.character.portrait)
		embed.setColor('#3c6acb')

		await interaction.editReply({ embeds: [ embed ] })
	},
}