class PieceModel
{
	type;
	colour;
	rank;
	file;
	image;
	captured = false;
	fromRank;
	fromFile;
	moves;
	lines;

	constructor(_type, _colour, _rank, _file)
	{
		this.type = _type;
		this.colour = _colour;
		this.rank = _rank;
		this.file = _file;
	}

	createCopy()
	{
		var copy = new PieceModel(this.type, this.colour, this.rank, this.file);
		copy.captured = this.captured;
		copy.fromRank = this.fromRank;
		copy.fromFile = this.fromFile;
		//moves doesnt get copied
		return copy;
	}

}
