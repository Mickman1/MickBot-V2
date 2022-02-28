const { SlashCommandBuilder } = require('@discordjs/builders')

const servers = ['Adamantoise','Aegis','Alexander','Anima','Asura','Atomos','Bahamut','BaiJinHuanXiang','BaiYinXiang','Balmung','Behemoth','Belias','Bismarck','Brynhildr','Cactuar','Carbuncle','Cerberus','ChaoFengTing','ChenXiWangZuo','Chocobo','Coeurl','Diabolos','Durandal','Excalibur','Exodus','Faerie','Famfrit','Fenrir','FuXiaoZhiJian','Garuda','Gilgamesh','Goblin','Gungnir','Hades','HaiMaoChaWu','HongYuHai','HuanYingQunDao','HuPoYuan' ,'Hyperion','Ifrit','Ixion','Jenova','JingYuZhuangYuan','Kujata','Lamia','LaNuoXiYa','Leviathan','Lich','Longchaoshendian','Louisoix','LvRenZhanQiao','Malboro','Mandragora','Masamune','Mateus','MengYaChi','MengYuBaoJing','Midgardsormr','MoDuNa','Moogle','Odin','Omega','Pandaemonium','Phoenix','Ragnarok','Ramuh','Ravana','Ridill','RouFengHaiWan','Sargatanas','Sephirot','ShenQuanHen','ShenYiZhiDi','Shinryu','Shiva','Siren','Sophia','Spriggan','Tiamat','Titan','Tonberry','Twintania','Typhon','Ultima','Ultros','Unicorn','Valefor','WoXianXiRan','YanXia','Yojimbo','YuZhouHeYin','Zalera','Zeromus','ZiShuiZhanQiao','Zodiark','Zurvan']

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ffxiv')
		.setDescription('Search for Final Fantasy XIV player profile')
		.addStringOption(option =>
			option.setName('name')
				.setDescription('Player name to search for')
				.setRequired(true)
		)
		.addStringOption(option =>
			option.setName('server')
				.setDescription('Server to search for player in')
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

		const XIVAPI = require('@xivapi/js')
		const xiv = new XIVAPI()
		
		let name = interaction.options.getString('name')
		let server = interaction.options.getString('server')

		await interaction.deferReply()

		let character = await xiv.character.search(name, { server: server })
		character = character.Results[0]
		console.log(character)

		embed.setAuthor({ name: character.Name, iconURL: character.Avatar })
		embed.setFooter({ text: character.Server })

		await interaction.editReply({ embeds: [ embed ] })
	},
}