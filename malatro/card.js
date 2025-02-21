module.exports = class Card {
	constructor({ rank, rankTitle, rankTitleFull, suit, suitNumber, emote, color, chips, edition = null, enhancement = null, seal = null, debuffed = false }) {
		this.rank = rank
		this.rankTitle = rankTitle
		this.rankTitleFull = rankTitleFull
		this.suit = suit
		this.suitNumber = suitNumber
		this.emote = emote
		this.color = color
		this.chips = chips
		this.edition = edition
		this.enhancement = enhancement
		this.seal = seal
		this.debuffed = debuffed
	}
}
