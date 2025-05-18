const NORMAL_MOVE = 0;
const PAWN_MOVE_TWO = 1;
const CASTLE_KS = 2;
const CASTLE_QS = 3;
const EN_PASSANT = 4; 

class MoveModel
{
	type;
	piece;
	rank;
	file;
	canCapture;
	capturePiece;
	isLegal = false;
	isBookMove = true;
	notation;
	score;
	//isBlocked;

	constructor(_rank, _file, _piece, _type, _canCapture, _notation)
	{
		this.type = _type;
		this.piece = _piece;
		this.rank = _rank;
		this.file = _file;
		this.canCapture = _canCapture;

		if(this.piece != undefined)
		{
			this.debugStr = this.piece.type;
		}
	}

	createCopy()
	{
		var copy = new MoveModel(this.rank, this.file, this.piece, this.type, this.canCapture);
		copy.capturePiece = this.capturePiece;
		copy.isLegal = this.isLegal;
		copy.notation = this.notation;
		return copy;
	}
}