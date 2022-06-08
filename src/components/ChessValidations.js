import { direction } from './MovementsUtil.js'
import { piecesColor } from './PiecesUtil.js'

const findAllTeamPossibleMovements = (piece, isFromEnemy, board, isCheckMate) => {
    return board.reduce((previousColumn, currentColumn) => {
        return [...previousColumn, ...currentColumn.filter((otherPieces) => 
            (otherPieces.piece_color != null) && 
                !((!(otherPieces.piece_color != piece.piece_color) && isFromEnemy) || ((otherPieces.piece_color != piece.piece_color) && !isFromEnemy)))
            .reduce((previousPiece, currentPiece)=>{
                var modifiedCurrentPiece = {...currentPiece, x: parseInt(currentPiece.pos.x), y: parseInt(currentPiece.pos.y)}
                var possibleMovements = []
                if(isCheckMate){
                    possibleMovements = validatePossibleMovements(getPossibleMovementsFromPieceName(modifiedCurrentPiece, board), modifiedCurrentPiece, board)
                }else{
                    possibleMovements = validatePossibleMovementsForCheck(getPossibleMovementsFromPieceName(modifiedCurrentPiece, board), modifiedCurrentPiece, board)
                }
                if (possibleMovements.length > 0){
                    return [...previousPiece, {currentPiece: modifiedCurrentPiece, possibleMovements: possibleMovements}]
                } else {
                    return [...previousPiece]
                }
                
            }, 
        [])
    ]}, [])
}
const findKing = (piece, isFromEnemy, board) => {
    return board.reduce((previousColumn, currentColumn) => {
        var king = currentColumn.find((otherPiece) => 
            otherPiece.piece_name == "king" && 
            !((!(otherPiece.piece_color != piece.piece_color) && isFromEnemy) || ((otherPiece.piece_color != piece.piece_color) && !isFromEnemy)))
        if(king){
            return {...previousColumn, ...king}
        }else{
            return previousColumn
        }
    }, {})
}
export const willKingCheck = (movement, piece, board) => {
    var simulateMovementPiece = {...piece, x: movement.x + piece.x, y: movement.y + piece.y, pos: {x: movement.x + piece.x, y: movement.y + piece.y}}
    var simulatedBoard = JSON.parse(JSON.stringify(board))
    simulatedBoard[piece.x][piece.y] = {}
    simulatedBoard[simulateMovementPiece.x][simulateMovementPiece.y] = simulateMovementPiece
    var myKing = findKing(simulateMovementPiece, false, simulatedBoard)
    var checkingKing = findAllTeamPossibleMovements(simulateMovementPiece, true, simulatedBoard, false).filter((enemyPiece) => 
        enemyPiece.possibleMovements.find((curMovement) => 
            (curMovement.x + enemyPiece.currentPiece.x == myKing.pos.x) && (curMovement.y + enemyPiece.currentPiece.y == myKing.pos.y)))
    return checkingKing != null && checkingKing.length > 0
}
export const isKingCheck = (piece, board) => {
    var modifiedPiece = {...piece, x: piece.x, y: piece.y}
    var theirKing = findKing(modifiedPiece, true, board)
    var checkingKing = findAllTeamPossibleMovements(modifiedPiece, false, board, false).filter((friendPiece) => 
        friendPiece.possibleMovements.find((curMovement) => 
            (curMovement.x + friendPiece.currentPiece.x == theirKing.pos.x) && (curMovement.y + friendPiece.currentPiece.y == theirKing.pos.y)))
    return checkingKing != null && checkingKing.length > 0
}
export const isKingCheckMate = (piece, board) => {
    var modifiedPiece = {...piece, x: piece.x, y: piece.y}
    var allEnemiesPossibleMovements = findAllTeamPossibleMovements(modifiedPiece, true, board, true)
    return allEnemiesPossibleMovements != null && allEnemiesPossibleMovements.length == 0
}

const times = (direct, times) => {
    return {x: direct.x * times,y: direct.y * times}
}

const isEmpty = (movement, piece, board) => {
    return !(board[piece.x + movement.x][piece.y + movement.y].piece_name || false)}

const isEnemy = (movement, piece, board) => !isEmpty(movement, piece, board) && board[piece.x + movement.x][piece.y + movement.y].piece_color != piece.piece_color

const isMvValid = (movement, piece) => ((piece.x + movement.x) >= 0 && (piece.x + movement.x) < 8 ) && ((piece.y + movement.y) >= 0 && (piece.y + movement.y) < 8 )

const moveOne = (movement) => {
    return {
        ...movement,
        x: movement.x + movement.direction.x,
        y: movement.y + movement.direction.y
    }
}
const generateHorsePossibleMovements = (possibleMovementsList, piece, board) => {
    return possibleMovementsList.reduce((previousMovement, currentMovement) => {
        if(!isMvValid(currentMovement, piece)){
            return [...previousMovement]
        }
        if(isEmpty(currentMovement, piece, board)){
            return [...previousMovement, {...currentMovement, type: 'mv'}]
        } else if(isEnemy(currentMovement, piece, board)){
            return [...previousMovement, {...currentMovement, type: 'eat'}]
        } else {
            return [...previousMovement]
        }
    },[])
}
const generatePathPossibleMovements = (possibleMovementsList, piece, board) => {
    return possibleMovementsList.map((movement) => {
        var newMovements = []
        var newMovement = {...movement}
        var count = 0
        do{
            if(!isMvValid(newMovement, piece)){
                break;
            }
            if(isEmpty(newMovement, piece, board)){
                newMovement.type = 'mv'
            } else if(isEnemy(newMovement, piece, board)){
                newMovement.type = 'eat'
                newMovements.push(newMovement);
                break;
            } else {
                break;
            }
            newMovements.push(newMovement);
            newMovement = moveOne(newMovement);
            count += 1
        }while(isMvValid(newMovement, piece) && (count < newMovement.amount || newMovement.amount == 'max'));
        return newMovements
    }).reduce((previousValue, currentValue) => {
        return [...previousValue, ...currentValue]
    })
}
const validatePossibleMovements = (possibleMovements, piece, board) => {
    return possibleMovements.filter((movement) => {
        return isMvValid(movement, piece) &&
            (!willKingCheck(movement, piece, board)) &&
            (
                (movement.type == 'eat' && isEnemy(movement, piece, board)) ||
                (movement.type == 'mv' && isEmpty(movement, piece, board))
            ) &&
            (
                (movement.especialConditions == null) ||  
                (movement.especialConditions.every((c) => c == true))
            )
    })
}
const validatePossibleMovementsForCheck = (possibleMovements, piece, board) => {
    return possibleMovements.filter((movement) => {
        return isMvValid(movement, piece) &&
            (
                (movement.type == 'eat' && isEnemy(movement, piece, board)) ||
                (movement.type == 'mv' && isEmpty(movement, piece, board))
            ) &&
            (
                (movement.especialConditions == null) ||  
                (movement.especialConditions.every((c) => c == true))
            )
    })
}
const pawnPossibleMovements = (piece, board) => {
    var possibleMovementsList = [
        {...direction.S, direction: direction.S, type:'mv', amount: 1},
        {...times(direction.S, 2), direction: direction.S, type:'mv', amount: 2, especialConditions: [piece.piece_mv_number == 0 && isEmpty(direction.S, piece, board)]},
        {...direction.SW, direction: direction.SW, type:'eat', amount: 1},
        {...direction.SE, direction: direction.SE, type:'eat', amount: 1}
    ];
    if(piece.piece_color == piecesColor.W){
        possibleMovementsList[1].especialConditions = [piece.piece_mv_number == 0 && isEmpty(direction.N, piece, board)]
        return possibleMovementsList.map((movement) => {
            movement.y *= -1
            return movement
        })
    }
    return possibleMovementsList
}
const towerPossibleMovements = (piece, board) => {
    var possibleMovementsList = [
        {...direction.N, direction: direction.N, type:'mv|eat', amount: 'max'},
        {...direction.S, direction: direction.S, type:'mv|eat', amount: 'max'},
        {...direction.W, direction: direction.W, type:'mv|eat', amount: 'max'},
        {...direction.E, direction: direction.E, type:'mv|eat', amount: 'max'},
    ];
    possibleMovementsList = generatePathPossibleMovements(possibleMovementsList, piece, board)
    return possibleMovementsList
}
const bishopPossibleMovements = (piece, board) => {
    var possibleMovementsList = [
        {...direction.NW, direction: direction.NW, type:'mv|eat', amount: 'max'},
        {...direction.NE, direction: direction.NE, type:'mv|eat', amount: 'max'},
        {...direction.SW, direction: direction.SW, type:'mv|eat', amount: 'max'},
        {...direction.SE, direction: direction.SE, type:'mv|eat', amount: 'max'},
    ];
    possibleMovementsList = generatePathPossibleMovements(possibleMovementsList, piece, board)
    return possibleMovementsList
}
const queenPossibleMovements = (piece, board) => {
    var possibleMovementsList = [
        {...direction.N, direction: direction.N, type:'mv|eat', amount: 'max'},
        {...direction.S, direction: direction.S, type:'mv|eat', amount: 'max'},
        {...direction.W, direction: direction.W, type:'mv|eat', amount: 'max'},
        {...direction.E, direction: direction.E, type:'mv|eat', amount: 'max'},
        {...direction.NW, direction: direction.NW, type:'mv|eat', amount: 'max'},
        {...direction.NE, direction: direction.NE, type:'mv|eat', amount: 'max'},
        {...direction.SW, direction: direction.SW, type:'mv|eat', amount: 'max'},
        {...direction.SE, direction: direction.SE, type:'mv|eat', amount: 'max'},
    ];
    possibleMovementsList = generatePathPossibleMovements(possibleMovementsList, piece, board)
    return possibleMovementsList
}
const kingPossibleMovements = (piece, board) => {
    var possibleMovementsList = [
        {...direction.N, direction: direction.N, type:'mv|eat', amount: 1},
        {...direction.S, direction: direction.S, type:'mv|eat', amount: 1},
        {...direction.W, direction: direction.W, type:'mv|eat', amount: 1},
        {...direction.E, direction: direction.E, type:'mv|eat', amount: 1},
        {...direction.NW, direction: direction.NW, type:'mv|eat', amount: 1},
        {...direction.NE, direction: direction.NE, type:'mv|eat', amount: 1},
        {...direction.SW, direction: direction.SW, type:'mv|eat', amount: 1},
        {...direction.SE, direction: direction.SE, type:'mv|eat', amount: 1},
    ];
    possibleMovementsList = generatePathPossibleMovements(possibleMovementsList, piece, board)
    return possibleMovementsList
}
const horsePossibleMovements = (piece, board) => {
    var possibleMovementsList = [
        {x: 2, y: -1, type:'mv|eat'},
        {x: 2, y: 1, type:'mv|eat'},
        {x: -2, y: -1, type:'mv|eat'},
        {x: -2, y: 1, type:'mv|eat'},
        {x: 1, y: -2, type:'mv|eat'},
        {x: -1, y: -2, type:'mv|eat'},
        {x: 1, y: 2, type:'mv|eat'},
        {x: -1, y: 2, type:'mv|eat'},
    ];
    possibleMovementsList = generateHorsePossibleMovements(possibleMovementsList, piece, board)
    return possibleMovementsList
}
const getPossibleMovementsFromPieceName = (piece, board) => {
    switch (piece.piece_name) {
    case 'pawn':
        return pawnPossibleMovements(piece, board);
    case 'tower':
        return towerPossibleMovements(piece, board);
    case 'bishop':
        return bishopPossibleMovements(piece, board);
    case 'queen':
        return queenPossibleMovements(piece, board);
    case'king':
        return kingPossibleMovements(piece, board);
    case 'horse':
        return horsePossibleMovements(piece, board);
    }
}
export const possibleMovements = (board, pieceParam) => {
    if(!pieceParam.piece_name){
        return [];
    }
    pieceParam = {...pieceParam, x: parseInt(pieceParam.pos.x), y: parseInt(pieceParam.pos.y)}
    return validatePossibleMovements(getPossibleMovementsFromPieceName(pieceParam, board), pieceParam, board)
}