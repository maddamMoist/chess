const PNG_OPENINGS = 
[
	//fried liver
	[true, false, "1. e4 e5 2. Nf3 Nc6 3. Bc4 Nf6 4. Ng5 d5 5. exd5 Nxd5 6. Nxf7 Kxf7 7. Qf3+ Ke6 8. Nc3 Nd4 9. Bxd5+ Kd6 10. Qg3 Nxc2+ 11. Kd1 Nxa1 12. d4 *"],
	[true, false, "1. e4 e5 2. Nf3 Nc6 3. Bc4 Nf6 4. Ng5 d5 5. exd5 Nxd5 6. Nxf7 Kxf7 7. Qf3+ Ke6 8. Nc3 Nb4 9. Bb3 c6 10. a3 *"],
	[true, false, "1. e4 e5 2. Nf3 Nc6 3. Bc4 Nf6 4. Ng5 d5 5. exd5 Nxd5 6. Nxf7 Kxf7 7. Qf3+ Ke6 8. Nc3 Nb4 9. Bb3 Bc5 10. O-O Rf8 11. Qg3 *"],
	[true, false, "1. e4 e5 2. Nf3 Nc6 3. Bc4 Nf6 4. Ng5 d5 5. exd5 Na5 6. Bb5+ c6 7. dxc6 bxc6 8. Qf3 Be7 9. Bd3 *"],
	[true, false, "1. e4 e5 2. Nf3 Nc6 3. Bc4 Nf6 4. Ng5 d5 5. exd5 Na5 6. Bb5+ c6 7. dxc6 bxc6 8. Qf3 Rb8 9. Be2 Be7 10. Ne4 *"],
	[true, false, "1. e4 e5 2. Nf3 Nc6 3. Bc4 Nf6 4. Ng5 d5 5. exd5 Nd4 6. c3 b5 7. Bf1 Nxd5 8. cxd4 Qxg5 9. Bxb5+ *"],

	//evans gambit
	[true, false, "1. e4 e5 2. Nf3 Nc6 3. Bc4 Bc5 4. b4 Bxb4 5. c3 Bc5 6. d4 exd4 7. O-O dxc3 8. Bxf7+ Kxf7 9. Qd5+ Kf8 10. Qxc5+ d6 11. Qxc3 Nf6 12. Bb2 h6 13. Nbd2 *"],
	[true, false, "1. e4 e5 2. Nf3 Nc6 3. Bc4 Bc5 4. b4 Bxb4 5. c3 Bc5 6. d4 exd4 7. O-O dxc3 8. Bxf7+ Kxf7 9. Qd5+ Ke8 10. Qxc5 d6 11. Qh5+ g6 12. Qd5 c2 13. Nc3 Nge7 14. Qd3 *"],
	[true, false, "1. e4 e5 2. Nf3 Nc6 3. Bc4 Bc5 4. b4 Be7 5. b5 Na5 6. Nxe5 Nxc4 7. Nxc4 d5 8. exd5 Qxd5 9. Ne3 Qxb5 10. c4 Qa5 11. O-O *"],
	[true, false, "1. e4 e5 2. Nf3 Nc6 3. Bc4 Bc5 4. b4 Be7 5. a3 Nf6 6. d3 d5 7. exd5 Nxd5 8. O-O *"],
	[true, false, "1. e4 e5 2. Nf3 Nc6 3. Bc4 Bc5 4. b4 Bxb4 5. c3 Ba5 6. d4 d6 7. Qb3 *"],
	[true, false, "1. e4 e5 2. Nf3 Nc6 3. Bc4 Bc5 4. b4 Bxb4 5. c3 Be7 6. d4 Na5 7. Bd3 *"],

	[false, true, "1. e4 c5 2. Nf3 e6 3. Bc4 a6 4. d4 d5 5. exd5 exd5 *"],//sicillian
	[true, false, "1. Nf3 e6 2. Nc3 e5 3. Nxe5 f6 4. Na4 c6 5. Nc5 h6 6. Nexd7 h5 7. h3 *"],//specifytest1
	[true, false, "1. Nf3 e6 2. Nc3 e5 3. Nxe5 f6 4. Na4 c6 5. Nc5 h6 6. Ncxd7 a6 7. a3 *"]//specifytest2
];

const SPECIFY_RANK = 0;
const SPECIFY_FILE = 1;
const SPECIFY_BOTH = 2;

openingsArr = [];
processOpenings();

function processOpenings()
{
	

	for(var i = 0; i < PNG_OPENINGS.length; i++)
	{
		var gameStr = PNG_OPENINGS[i][2];
		var openingObject = {};
		var moveStrArr = [];
		var currentSpaceIndex = 0;
		var spaceCount = 0; //in order to ignore the move-number chunks
		var reading = true;
		var startMoveIndex = -1;

		while (reading)
		{
			var nextSpaceIndex = gameStr.indexOf(" ", currentSpaceIndex + 1);
			if (nextSpaceIndex >= 0)
			{
				if (startMoveIndex >= 0)
				{
					var endMoveIndex = nextSpaceIndex;
					moveStrArr.push(gameStr.substring(startMoveIndex, endMoveIndex));
					startMoveIndex = -1;
				}

				if (spaceCount % 3 == 2) //move-number chunk
				{
					//ignore
				}
				else
				{
					startMoveIndex = nextSpaceIndex + 1;
				}
				spaceCount++;
				currentSpaceIndex = nextSpaceIndex;
			}
			else
			{
				//no more spaces in game string
				if (startMoveIndex >= 0)
				{
					var endMoveIndex = gameStr.length;
					moveStrArr.push(gameStr.substring(startMoveIndex, endMoveIndex));
				}
				reading = false;
			}
		}

		//remove uneccesary bits
		{
			for(var j = 0; j < moveStrArr.length; j++)
			{
				var moveStr = moveStrArr[j];
				var lastChar = moveStr.charAt(moveStr.length-1);
				if(lastChar == "+" || lastChar == "#")
				{
					moveStrArr[j] = moveStr.substring(0,moveStr.length-1);
				}
			}
		}

		openingObject.moves = moveStrArr;
		openingObject.forWhite = PNG_OPENINGS[i][0];
		openingObject.forBlack = PNG_OPENINGS[i][1];
		openingsArr.push(openingObject);
		console.log("this:" + moveStrArr);
	}
}

function isBookMove(_move, _boardState, _playercolour)
{
	var specify = -1;
	var sameRank = false;
	var sameFile = false;
	for(var i = 0; i < _boardState.pieces.length; i++)
	{
		var otherPiece = _boardState.pieces[i];
		if (otherPiece != _move.piece
			&& otherPiece.captured == false
			&& otherPiece.colour == _move.piece.colour
			&& otherPiece.type == _move.piece.type)
		{
			moveLoop: for(var j = 0; j < otherPiece.moves.length; j++)
			{
				var otherPieceMove = otherPiece.moves[j];
				if(otherPieceMove.rank == _move.rank
					&& otherPieceMove.file == _move.file)
				{	
					if(otherPiece.rank == _move.piece.rank)
					{
						sameRank = true;
					}
					else if(otherPiece.file == _move.piece.file)
					{
						sameFile = true;
					}
					break moveLoop;
				}
			}
		}
	}

	if(sameFile) specify = SPECIFY_RANK;
	if(sameRank) specify = SPECIFY_FILE;
	if(sameRank && sameFile) specify = SPECIFY_BOTH;

	if(specify != -1) console.log("-----------specify: " + specify);
	
	var moveStr = moveToNotation(_move, specify);
	console.log("moveStr: " + moveStr);
	_move.notation = moveStr;
	var tempMoves = _boardState.movesSoFar.concat();
	tempMoves.push(moveStr);

	var eliminatedOpenings = [];
	for (var j = 0; j < tempMoves.length; j++)
	{
		for(var i = 0; i < openingsArr.length; i++)
		{
			if(eliminatedOpenings.includes(i)) continue;
			var opening = openingsArr[i];
			if (!( ((_playercolour == WHITE && opening.forWhite) ||
				(_playercolour == BLACK && opening.forBlack)) &&
				opening.moves[j] == tempMoves[j]))
				{
					eliminatedOpenings.push(i);
				}
		}
	}
	if (eliminatedOpenings.length < openingsArr.length)
	{
		console.log("||||||||||||||||openings left:" + (openingsArr.length - eliminatedOpenings.length));
		return true;
	}
	

	return false;
}

//used privately only vvvv
function moveToNotation(_move, _specify)
{
	var str;

	switch(_move.type)
	{
		case CASTLE_KS:
			return "O-O";
			break;
		case CASTLE_QS:
			return "O-O-O";
			break;
	}

	var specifyStr = "";
	if(_specify >= 0)
	{
		switch(_specify)
		{
			case SPECIFY_RANK:
				specifyStr = (_move.piece.rank+1).toString();
				break;
			case SPECIFY_FILE:
				specifyStr = indexToFile(_move.piece.file);
				break;
			case SPECIFY_BOTH:
				specifyStr = indexToFile(_move.piece.file) + (_move.piece.rank+1).toString();
				break;
		}
	}

	var rank = (_move.rank+1).toString();
	var file = indexToFile(_move.file);
	var capture = _move.capturePiece != undefined;

	switch (_move.piece.type)
	{
		case PAWN:
			str = getBasicNotation(file, rank, capture);
			if(capture) 
			{
				str = indexToFile(_move.piece.file) + "x" + file + rank;
			}
			else
			{
				str = file + rank;
			}
			break;
		case BISHOP:
			str = getBasicNotation(file, rank, capture);
			str = "B" + specifyStr + str;
			break;
		case KNIGHT:
			str = getBasicNotation(file, rank, capture);
			str = "N" + specifyStr + str;
			break;
		case ROOK:
			str = getBasicNotation(file, rank, capture);
			str = "R" + specifyStr + str;
			break;
		case QUEEN:
			str = getBasicNotation(file, rank, capture);
			str = "Q" + specifyStr + str;
			break;
		case KING:
			str = getBasicNotation(file, rank, capture);
			str = "K" + specifyStr + str;
			break;
	}

	return str;
}

function getBasicNotation(_file, _rank, _capture)
{
	var str;
	if(_capture)
	{
		str = "x" + _file + _rank;
	}
	else
	{
		str = _file + _rank;
	}
	return str;
}

function indexToFile(_index)
{
	switch (_index)
	{
	case 0:
		return "a";
		break;
	case 1:
		return "b";
		break;
	case 2:
		return "c";
		break;
	case 3:
		return "d";
		break;
	case 4:
		return "e";
		break;
	case 5:
		return "f";
		break;
	case 6:
		return "g";
		break;
	case 7:
		return "h";
		break;
	}
	console.log("ERORRRR");
}
