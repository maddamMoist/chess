class SquareModel
{
	rank;
	file;
	occupiedBy;
	attackedBy = [];
	xRayedBy = [];
	//potentiallyOccupiedBy = [];//includes pawn moves

	constructor(_rank, _file)
	{
		this.rank = _rank;
		this.file = _file;
	}

	isAttackedBy(_colour)
	{
		for(var i = 0; i < this.attackedBy.length; i++)
		{
			var piece = this.attackedBy[i];
			if(piece.colour == _colour)
			{
				return true;
			}
		}

		return false;
	}

	clearVision()
	{
		this.attackedBy = [];
		this.xRayedBy = [];
	}

	addAttacker(_piece)
	{
		this.attackedBy.push(_piece);
	}
}