module.exports = class Card {
	constructor({ rank, rankTitle, suit, emoji, color, chips, edition = null, enhancement = null, seal = null, debuffed = false }) {
		this.rank = rank
		this.rankTitle = rankTitle
		this.suit = suit
		this.emoji = emoji
		this.color = color
		this.chips = chips
		this.edition = edition
		this.enhancement = enhancement
		this.seal = seal
		this.debuffed = debuffed
	}
}

