const DIAGONALS = [{x:-1, y:-1}, {x:1, y:-1}, {x:-1, y:1}, {x:1, y:1}];
const STRAIGHTS = [{x:-1, y:0}, {x:1, y:0}, {x:0, y:1}, {x:0, y:-1}];
const QUEEN_DIRS = DIAGONALS.concat(STRAIGHTS);
const KS = 0;
const QS = 1;

const BACK_RANK = [0,7];
const PAWN_RANK = [1,6];

var CASTLE_FILE_VALUES = {
	inbetweenFiles:[[5,6],[1,2,3]],
	nonCheckFiles:[[4,5,6],[2,3,4]], 
	kingStartFile:4,
	kingFinFiles:[6,2],
	rookStartFiles:[7,0],
	rookFinFiles:[5,3]};

//gamestates
const PLAY_ON = 0;
const CHECKMATE = 1;
const STALEMATE = 2;

function getOpponentMove(colour, _boardState)
{
	var validMoves = [];
	for(var i = 0; i < _boardState.pieces.length; i++)
	{
		var piece = _boardState.pieces[i];

		if(piece.colour == colour)
		{
			for(var j = 0; j < piece.moves.length; j++)
			{
				var move = piece.moves[j];
				if(move.isLegal && move.isBookMove)
				{
					validMoves.push(move);
				}
			}
		}
	}
	return validMoves[Math.floor(Math.random()*validMoves.length)];
}

function makeMove(_move, _boardState)
{
	if(_move.capturePiece != undefined)
	{
		_boardState.capturePiece(_move.capturePiece);
		if(_move.capturePiece.type == ROOK)
		{
			if (_boardState.canCastle[_move.capturePiece.colour][KS] &&
				_move.capturePiece.file == CASTLE_FILE_VALUES.rookStartFiles[KS])
				_boardState.canCastle[_move.capturePiece.colour][KS] = false;

			else if (_boardState.canCastle[_move.capturePiece.colour][QS] &&
				_move.capturePiece.file == CASTLE_FILE_VALUES.rookStartFiles[QS])
				_boardState.canCastle[_move.capturePiece.colour][QS] = false;
		}
	}

	if(_move.type == CASTLE_KS || _move.type == CASTLE_QS)
	{
		var side = (_move.type == CASTLE_KS)?KS:QS;
		var rook = _boardState.getPieceAt(_move.piece.rank, CASTLE_FILE_VALUES.rookStartFiles[side]);
		_boardState.movePiece(rook, _move.piece.rank, CASTLE_FILE_VALUES.rookFinFiles[side]);
		_boardState.canCastle[_move.piece.colour][side] = false;
	}

	if(_move.piece.type == KING)
	{
		_boardState.canCastle[_move.piece.colour][KS] = 
		_boardState.canCastle[_move.piece.colour][QS] = false;
	}

	if(_move.piece.type == ROOK)
	{
		if(_boardState.canCastle[_move.piece.colour][KS]
			&& _move.piece.file == CASTLE_FILE_VALUES.rookStartFiles[KS])
		{
			_boardState.canCastle[_move.piece.colour][KS] = false;
		}
		else if(_boardState.canCastle[_move.piece.colour][QS]
			&& _move.piece.file == CASTLE_FILE_VALUES.rookStartFiles[QS])
		{
			_boardState.canCastle[_move.piece.colour][QS] = false;
		}
	}

	_boardState.updateNotation(_move);
	_boardState.movePiece(_move.piece, _move.rank, _move.file);
	_boardState.lastMove = _move;

	//next turn
	_boardState.whosTurn = (boardState.whosTurn==WHITE)?BLACK:WHITE;
}

function evaluateBoard(_boardState, _playerColour)
{
	for(var i = 0; i < _boardState.pieces.length; i++)
	{
		var piece = _boardState.pieces[i];
		if(!piece.captured)
		{
			calculateVision(piece, _boardState);//should be more like getLinesAndSquares()
		}
	}

		if(_boardState.canCastle[_boardState.whosTurn][KS] || _boardState.canCastle[_boardState.whosTurn][QS])
		{
			var king = _boardState.getPieceAt(BACK_RANK[_boardState.whosTurn],CASTLE_FILE_VALUES.kingStartFile);
			if(_boardState.canCastle[_boardState.whosTurn][KS])
			{
				//kingside
				var castleMove = getCastleMove(king, KS, _boardState);
				if(castleMove != undefined)
				{
					king.moves.push(castleMove);
				}
			}
			if(_boardState.canCastle[_boardState.whosTurn][QS])
			{
				//kingside
				var castleMove = getCastleMove(king, QS, _boardState);
				if(castleMove != undefined)
				{
					king.moves.push(castleMove);
				}
			}
		}
	

	var isCheck = false;
	var validMoves = [];

	for(var i = 0; i < _boardState.pieces.length; i++)
	{
		var piece = _boardState.pieces[i];
		if(!piece.captured)
		{
			if(piece.colour == _boardState.whosTurn)
			{
				checkMovesLegal(piece, _boardState);
			}

			for(var j = 0; j < piece.moves.length; j++)
			{
				var move = piece.moves[j];
				if(piece.colour == _boardState.whosTurn)
				{
					if(move.isLegal)
					{
						validMoves.push(move);
					}
				}
				else
				{
					if(move.capturePiece != undefined && move.capturePiece.type == KING)
					{
						isCheck = true;
						//found check
					}
				}
			}
		}
	}

	if(validMoves.length > 0)
	{
		for(var i = 0; i < validMoves.length; i++)
		{
			var move = validMoves[i];
			move.isBookMove = isBookMove(move, _boardState, _playerColour);
		}
	}
	else
	{
		if(isCheck)
		{
			_boardState.state = CHECKMATE;
		}
		else
		{
			_boardState.state = STALEMATE;
		}
	}
}

function checkMovesLegal(_piece, _boardState)
{
	for(var i = 0; i < _piece.moves.length; i++)
	{
		var move = _piece.moves[i];
		move.isLegal = true;
		var tempState = _boardState.createCopy();
		var tempMove = tempState.cloneMove(move);
		makeMove(tempMove, tempState);

		//check for check
		enemyLoop: for(var j = 0; j < tempState.pieces.length; j++)
		{
			var enemyPiece = tempState.pieces[j];
			if(enemyPiece.captured == false 
				&& enemyPiece.colour == tempState.whosTurn)
			{
				calculateVision(enemyPiece, tempState);
				for(var q = 0; q < enemyPiece.moves.length; q++)
				{
					var enemyMove = enemyPiece.moves[q];
					if(enemyMove.capturePiece != undefined && enemyMove.capturePiece.type == KING)
					{
						//check
						move.isLegal = false;
						break enemyLoop;
					}
				}
			}
		}
	}
}

function calculateVision(_piece, _boardState)
{
	_boardState.clearVision();
	var allMoves;

	switch (_piece.type)
	{
	case PAWN:

		var tempMoves = [];
		allMoves = [];
		var yDist = (_piece.colour == WHITE)?1:-1;
		tempMoves.push(new MoveModel(_piece.rank+yDist, _piece.file-1, _piece, NORMAL_MOVE, true));//captureLeft
		tempMoves.push(new MoveModel(_piece.rank+yDist, _piece.file+1, _piece, NORMAL_MOVE, true));//captureRight
		tempMoves.push(new MoveModel(_piece.rank+yDist, _piece.file, _piece, NORMAL_MOVE, false));//moveForward
		if(_piece.colour == WHITE && _piece.rank == 1 ||
			_piece.colour == BLACK && _piece.rank == 6)
		{
			tempMoves.push(new MoveModel(_piece.rank+(yDist*2), _piece.file, _piece, PAWN_MOVE_TWO, false));//moveTwoForward
		}
		
		for(var iMove = 0; iMove < tempMoves.length; iMove++)
		{
			var move = tempMoves[iMove];
			if (move.file >= 0 && move.file <= 7
				&& move.rank >= 0 && move.rank <= 7)
			{
				var otherPiece = _boardState.getPieceAt(move.rank, move.file);
				if(move.canCapture)
				{
					if(otherPiece != undefined)
					{
						if(otherPiece.colour != _piece.colour)
						{
							move.capturePiece = otherPiece;
							allMoves.push(move);
						}
						_boardState.addAttacker(_piece, move.rank, move.file);
					}
					if(_boardState.lastMove != undefined && _boardState.lastMove.type == PAWN_MOVE_TWO)
					{
						//en passant
						if(_boardState.lastMove.piece.rank == move.rank - yDist && _boardState.lastMove.piece.file == move.file)
						{
							move.type = EN_PASSANT;
							move.capturePiece = _boardState.lastMove.piece;
							allMoves.push(move);
							_boardState.addAttacker(_piece, _boardState.lastMove.piece.rank, _boardState.lastMove.piece.file);
							//addPotentialOccupier()?
						}
					}
				}
				else
				{
					//addPotentialOccupier()?
					var blocked = false;
					if(otherPiece != undefined)
					{
						blocked = true;
					}
					if(move.type == PAWN_MOVE_TWO)
					{
						otherPiece = _boardState.getPieceAt(move.rank-yDist, move.file);
						if(otherPiece != undefined)
						{
							blocked = true;
						}
					}

					if(!blocked)
					{
						allMoves.push(move);
					}
				}
			}
		}
		break
	case KNIGHT:
		var tempMoves = [];
		allMoves = [];
		tempMoves.push(new MoveModel(_piece.rank + 2, _piece.file + 1));
		tempMoves.push(new MoveModel(_piece.rank + 2, _piece.file - 1));
		tempMoves.push(new MoveModel(_piece.rank - 2, _piece.file + 1));
		tempMoves.push(new MoveModel(_piece.rank - 2, _piece.file - 1));
		tempMoves.push(new MoveModel(_piece.rank + 1, _piece.file + 2));
		tempMoves.push(new MoveModel(_piece.rank + 1, _piece.file - 2));
		tempMoves.push(new MoveModel(_piece.rank - 1, _piece.file + 2));
		tempMoves.push(new MoveModel(_piece.rank - 1, _piece.file - 2));

		for (var iMove = 0; iMove < tempMoves.length; iMove++)
		{
			var move = tempMoves[iMove];
			move.canCapture = true;
			if (move.file >= 0 && move.file <= 7
				&& move.rank >= 0 && move.rank <= 7)
			{
				_boardState.addAttacker(_piece, move.rank, move.file);
				var blocked = false;
				var otherPiece = _boardState.getPieceAt(move.rank, move.file);
				if(otherPiece != undefined)
				{
					if(otherPiece.colour != _piece.colour)
					{
						move.capturePiece = otherPiece;
					}
					else
					{
						blocked = true;
					}
				}
				if (!blocked)
				{
					move.piece = _piece;
					move.type = NORMAL_MOVE;
					allMoves.push(move);
				}
			}
		}
		break
	case BISHOP:
		allMoves = getMovesInDirections(DIAGONALS, _piece, _boardState);
		break
	case QUEEN:
		allMoves = getMovesInDirections(QUEEN_DIRS, _piece, _boardState);
		break
	case ROOK:
		allMoves = getMovesInDirections(STRAIGHTS, _piece, _boardState);
		break
	case KING:
		allMoves = [];
		for (var iMove = 0; iMove < QUEEN_DIRS.length; iMove++)
		{
			var dir = QUEEN_DIRS[iMove];
			var move = new MoveModel(_piece.rank + dir.y, _piece.file + dir.x);
			move.canCapture = true;
			if (move.file >= 0 && move.file <= 7
				&& move.rank >= 0 && move.rank <= 7)
			{
				_boardState.addAttacker(_piece, move.rank, move.file);
				var blocked = false;
				var otherPiece = _boardState.getPieceAt(move.rank, move.file);
				if(otherPiece != undefined)
				{
					if(otherPiece.colour != _piece.colour)
					{
						move.capturePiece = otherPiece;
					}
					else
					{
						blocked = true;
					}
				}
				if (!blocked)
				{
					move.piece = _piece;
					move.type = NORMAL_MOVE;
					allMoves.push(move);
				}
			}
		}
		break
	}

	_piece.moves = allMoves;
}

function getCastleMove(_king, _side, _boardState)
{
	var inbetweenSquares;
	var rook;
	rook = _boardState.getPieceAt(_king.rank, CASTLE_FILE_VALUES.rookStartFiles[_side]);
	if(rook == undefined)
	{
		console.log("no rook on this side: ", _side, " in this file: ", CASTLE_FILE_VALUES.rookStartFiles[_side], " | colour: ", _king.colour);
		console.trace();
	}
	//assumes rook and king in right place, bc this only gets called if canCastle
	for(var i = 0; i < CASTLE_FILE_VALUES.inbetweenFiles[_side].length; i++)
	{
		if(_boardState.getPieceAt(_king.rank, CASTLE_FILE_VALUES.inbetweenFiles[_side][i]) != undefined)
			return;
	}
	for(var i = 0; i < CASTLE_FILE_VALUES.nonCheckFiles[_side].length; i++)
	{
		var square = _boardState.getSquareAt(_king.rank, CASTLE_FILE_VALUES.nonCheckFiles[_side][i]);
		if(square.isAttackedBy(flipCol(_king.colour)))
			return;
	}

	return new MoveModel(_king.rank, CASTLE_FILE_VALUES.kingFinFiles[_side], _king, (_side==KS)?CASTLE_KS:CASTLE_QS, false);
}

function getMovesInDirections(dirs, _piece, _boardState)
{
	var moves = [];
	for(var iDir = 0; iDir < dirs.length; iDir++)
	{
		var dir = dirs[iDir];
		var blocked = false;
		var dist = 1;
		while(!blocked) //TODO: change for xray
		{
			var move = new MoveModel(_piece.rank + dir.y*dist, _piece.file + dir.x*dist);
			move.canCapture = true;
			if (move.file >= 0 && move.file <= 7
				&& move.rank >= 0 && move.rank <= 7)
			{
				_boardState.addAttacker(_piece, move.rank, move.file);
				var otherPiece = _boardState.getPieceAt(move.rank, move.file);
				if(otherPiece != undefined)
				{
					blocked = true;
					if(otherPiece.colour != _piece.colour)
					{
						move.capturePiece = otherPiece;
					}
				}
			}
			else
			{
				blocked = true;
			}
			if (move.capturePiece != undefined || !blocked)
			{
				move.piece = _piece;
				move.type = NORMAL_MOVE;
				moves.push(move);
			}
			dist++;
		}
	}
	return moves;

}

function flipCol(_col)
{
	return (_col==WHITE)?BLACK:WHITE;
}
