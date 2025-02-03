const { SlashCommandBuilder, EmbedBuilder } = require('discord.js')

//const XIVAPI = require('@xivapi/js')
// Load XVIAPI token for avoiding rate limit
const { tokens } = require('../config/config.json')

//const servers = ['Adamantoise','Aegis','Alexander','Anima','Asura','Atomos','Bahamut','BaiJinHuanXiang','BaiYinXiang','Balmung','Behemoth','Belias','Bismarck','Brynhildr','Cactuar','Carbuncle','Cerberus','ChaoFengTing','ChenXiWangZuo','Chocobo','Coeurl','Diabolos','Durandal','Excalibur','Exodus','Faerie','Famfrit','Fenrir','FuXiaoZhiJian','Garuda','Gilgamesh','Goblin','Gungnir','Hades','HaiMaoChaWu','HongYuHai','HuanYingQunDao','HuPoYuan' ,'Hyperion','Ifrit','Ixion','Jenova','JingYuZhuangYuan','Kujata','Lamia','LaNuoXiYa','Leviathan','Lich','Longchaoshendian','Louisoix','LvRenZhanQiao','Malboro','Mandragora','Masamune','Mateus','MengYaChi','MengYuBaoJing','Midgardsormr','MoDuNa','Moogle','Odin','Omega','Pandaemonium','Phoenix','Ragnarok','Ramuh','Ravana','Ridill','RouFengHaiWan','Sargatanas','Sephirot','ShenQuanHen','ShenYiZhiDi','Shinryu','Shiva','Siren','Sophia','Spriggan','Tiamat','Titan','Tonberry','Twintania','Typhon','Ultima','Ultros','Unicorn','Valefor','WoXianXiRan','YanXia','Yojimbo','YuZhouHeYin','Zalera','Zeromus','ZiShuiZhanQiao','Zodiark','Zurvan']

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ffxiv')
		.setDescription('Search for Final Fantasy XIV character profile')
		.addStringOption(option =>
			option.setName('name')
				.setDescription('Character name to search for (Spaces allowed)')
				.setRequired(true),
		)
		.addStringOption(option =>
			option.setName('server')
				.setDescription('Character\'s home server (North America only)')
				.setRequired(true)
				.addChoices(
					{ name: 'Adamantoise', value: 'adamantoise' },
					{ name: 'Cactuar', value: 'cactuar' },
					{ name: 'Faerie', value: 'faerie' },
					{ name: 'Gilgamesh', value: 'gilgamesh' },
					{ name: 'Jenova', value: 'jenova' },
					{ name: 'Midgardsormr', value: 'midgardsormr' },
					{ name: 'Sargatanas', value: 'sargatanas' },
					{ name: 'Siren', value: 'siren' },
					{ name: 'Behemoth', value: 'behemoth' },
					{ name: 'Excalibur', value: 'excalibur' },
					{ name: 'Exodus', value: 'exodus' },
					{ name: 'Famfrit', value: 'famfrit' },
					{ name: 'Hyperion', value: 'hyperion' },
					{ name: 'Lamia', value: 'lamia' },
					{ name: 'Leviathan', value: 'leviathan' },
					{ name: 'Ultros', value: 'ultros' },
					{ name: 'Balmung', value: 'balmung' },
					{ name: 'Brynhildr', value: 'brynhildr' },
					{ name: 'Coeurl', value: 'coeurl' },
					{ name: 'Diabolos', value: 'diabolos' },
					{ name: 'Goblin', value: 'goblin' },
					{ name: 'Malboro', value: 'malboro' },
					{ name: 'Mateus', value: 'mateus' },
					{ name: 'Zalera', value: 'zalera' },
				),
		),

	async execute(interaction) {
		const embed = new EmbedBuilder()
		const xiv = new XIVAPI({
			private_key: tokens.xivApi,
			language: 'en',
			snake_case: true,
		})

		const name = interaction.options.getString('name')
		const server = interaction.options.getString('server')

		// Defer the reply until data comes back, then send embed
		await interaction.deferReply()

		// Search for character using given name and server
		let character = await xiv.character.search(name, { server })

		// Check if FFXIV API couldn't find a character
		if (character.results.length === 0) {
			//embed.setAuthor({ name: 'No character found!', iconURL: 'https://static.wikia.nocookie.net/finalfantasy/images/a/a3/FFXIV_Quest_Icon.png/revision/latest/scale-to-width-down/174?cb=20210415061951' })
			embed.setDescription('No character found!')
			embed.setColor(MICKBOT_RED)
			return await interaction.editReply({ embeds: [embed] });
		}

		character = character.results[0]
		const characterID = character.id

		console.log(character)

		const characterData = await xiv.character.get(characterID)

		console.log(characterData)

		embed.setAuthor({ name: character.name, iconURL: character.avatar })
		embed.setFooter({ text: character.server })
		embed.setImage(characterData.character.portrait)
		embed.setColor('#3c6acb')

		await interaction.editReply({ embeds: [embed] })
	},
}
