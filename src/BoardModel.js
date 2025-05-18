class BoardModel
{
	state = PLAY_ON;

	constructor()
	{
		this.pieces = [];
		this.whosTurn = WHITE;
		this.canCastle = [[true,true],[true,true]];
		this.lastMove = undefined;
		this.movesSoFar = [];
		this.ranks = [];
		for(var i = 0; i < 8; i++)
		{
			this.ranks.push([]);
			for(var j = 0; j < 8; j++)
			{
				this.ranks[i].push(new SquareModel(i,j));
			}
		}
	}

	addPiece(_piece)
	{
		this.pieces.push(_piece);
		if(!_piece.captured)
		{
			this.ranks[_piece.rank][_piece.file].occupiedBy = _piece;
		}
	}

	getPieceAt(_rank, _file)
	{
		var piece = this.ranks[_rank][_file].occupiedBy;
		if(piece != undefined)
		{
			if(piece.captured)
			{
				console.log("getting captured piece: ", piece.type, piece.colour, piece.rank, piece.file);
				console.trace();
			}
		}
		
		return piece;
	}

	movePiece(_piece, _toRank, _toFile)
	{
		//can be used multiple times in one move e.g., castling
		this.ranks[_toRank][_toFile].occupiedBy = _piece;
		this.ranks[_piece.rank][_piece.file].occupiedBy = undefined;
		_piece.fromRank = _piece.rank;
		_piece.fromFile = _piece.file;
		_piece.rank = _toRank;
		_piece.file = _toFile;
	}

	updateNotation(_move)
	{
		this.movesSoFar.push(_move.notation);
	}

	capturePiece(_piece)
	{
		_piece.captured = true;
		this.ranks[_piece.rank][_piece.file].occupiedBy = undefined;
		//^ neccessary bc en passant leaves an empty square after capture
	}

	createCopy()
	{
		var copy = new BoardModel();
		copy.whosTurn = this.whosTurn;
		copy.canCastle = [ [this.canCastle[0][0],this.canCastle[0][1]], [this.canCastle[1][0],this.canCastle[1][1]] ];
		copy.lastMove = this.lastMove;

		for(var i = 0; i < this.pieces.length; i++)
		{
			var piece = this.pieces[i];
			copy.addPiece(piece.createCopy());
		}

		//note that the SquareModels dont get copied.
		//debugging:
		for(var i = 0; i < this.ranks.length; i++)
		{
			for(var j = 0; j < this.ranks[i].length; j++)
			{
				if(this.ranks[i][j].occupiedBy == undefined)
				{
					if(copy.ranks[i][j].occupiedBy != undefined)
					{
						console.log("problem1", "rank:", i, "file:",  j);
					}
				}
				if(copy.ranks[i][j].occupiedBy == undefined)
				{
					if(this.ranks[i][j].occupiedBy != undefined)
					{
						console.log("problem2", this.ranks[i][j].occupiedBy.captured);
					}
				}
			}
		}
		return copy;
	}

	cloneMove(_move)
	{
		//updates object references, so a move can be applied to a board clone
		var clone = _move.createCopy();
		clone.piece = this.getPieceAt(_move.piece.rank, _move.piece.file);
		if(clone.piece == undefined)
		{
			console.log("move piece undefined... ", _move.piece.type, _move.piece.rank, _move.piece.file);
		}
		if(_move.capturePiece != undefined)
		{
			clone.capturePiece = this.getPieceAt(_move.capturePiece.rank, _move.capturePiece.file);
			if(clone.capturePiece != undefined && clone.capturePiece.captured)
			{
				console.log("capturePiece already captured... ", _move, _move.piece)
			}
		}
		return clone;
	}

	clearVision()
	{
		for(var i = 0; i < this.ranks.length; i++)
		{
			for(var j = 0; j < this.ranks[i].length; j++)
			{
				var square = this.ranks[i][j];
				square.attackedBy = [];
			}
		}
	}

	addAttacker(_piece, _rank, _file)
	{
		
		this.ranks[_rank][_file].addAttacker(_piece);
	}

	/*updateSquares()
	{
		this.clearVision();

		for(var i = 0; i < this.pieces.length; i++)
		{
			var piece = this.pieces[i];
			if(!piece.captured)
			{
				for (var j = 0; j < piece.moves.length; j++)
				{
					var move = piece.moves[j];
					if(move.canCapture)
					{
						var square = this.ranks[move.rank][move.file];
						square.attackedBy.push(piece);
					}
					
				}
			}
		}
	}*/

	getSquareAt(_rank, _file)
	{
		return this.ranks[_rank][_file];
	}
}