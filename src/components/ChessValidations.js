import { direction } from './MovementsUtil.js'
import { piecesColor } from './PiecesUtil.js'

export const possibleMovements = (board, piece) => {
    if(!piece.piece_name){
        return [];
    }
    piece = {...piece, x: parseInt(piece.pos.x), y: parseInt(piece.pos.y)}
    const times = (direct, times) => {
        return {x: direct.x * times,y: direct.y * times}
    }
    const willKingCheck = (movement) => {
        return movement == false // TODO verificar
    }
    const isEmpty = (movement) => !(board[piece.x + movement.x][piece.y + movement.y].piece_name || false)
    
    const isEnemy = (movement) => !isEmpty(movement) && board[piece.x + movement.x][piece.y + movement.y].piece_color != piece.piece_color
    
    const isMvValid = (movement) => ((piece.x + movement.x) >= 0 && (piece.x + movement.x) < 8 ) && ((piece.y + movement.y) >= 0 && (piece.y + movement.y) < 8 )

    const moveOne = (movement) => {
        return {
            ...movement,
            x: movement.x + movement.direction.x,
            y: movement.y + movement.direction.y
        }
    }
    const generateHorsePossibleMovements = (possibleMovementsList) => {
        return possibleMovementsList.reduce((previousMovement, currentMovement) => {
            if(!isMvValid(currentMovement)){
                return [...previousMovement]
            }
            if(isEmpty(currentMovement)){
                return [...previousMovement, {...currentMovement, type: 'mv'}]
            } else if(isEnemy(currentMovement)){
                return [...previousMovement, {...currentMovement, type: 'eat'}]
            } else {
                return [...previousMovement]
            }
        },[])
    }
    const generatePathPossibleMovements = (possibleMovementsList) => {
        return possibleMovementsList.map((movement) => {
            var newMovements = []
            var newMovement = {...movement}
            var count = 0
            do{
                if(!isMvValid(newMovement)){
                    break;
                }
                if(isEmpty(newMovement)){
                    newMovement.type = 'mv'
                } else if(isEnemy(newMovement)){
                    newMovement.type = 'eat'
                    newMovements.push(newMovement);
                    break;
                } else {
                    break;
                }
                newMovements.push(newMovement);
                newMovement = moveOne(newMovement);
                count += 1
            }while(isMvValid(newMovement) && (count < newMovement.amount || newMovement.amount == 'max'));
            return newMovements
        }).reduce((previousValue, currentValue) => {
            return [...previousValue, ...currentValue]
        })
    }
    const validatePossibleMovements = (possibleMovements) => {
        return possibleMovements.filter((movement) => {
            return isMvValid(movement) &&
            !willKingCheck(movement) &&
                (
                    (movement.type == 'eat' && isEnemy(movement)) ||
                    (movement.type == 'mv' && isEmpty(movement))
                ) &&
                (
                    (movement.especialConditions == null) ||  
                    (movement.especialConditions.every((c) => c == true))
                )
        })
    }
    const pawnPossibleMovements = () => {
        var possibleMovementsList = [
            {...direction.S, direction: direction.S, type:'mv', amount: 1},
            {...times(direction.S, 2), direction: direction.S, type:'mv', amount: 2, especialConditions: [piece.piece_mv_number == 0 && isEmpty(direction.S)]},
            {...direction.SW, direction: direction.SW, type:'eat', amount: 1},
            {...direction.SE, direction: direction.SE, type:'eat', amount: 1}
        ];
        if(piece.piece_color == piecesColor.W){
            possibleMovementsList[1].especialConditions = [piece.piece_mv_number == 0 && isEmpty(direction.N)]
            return possibleMovementsList.map((movement) => {
                movement.y *= -1
                return movement
            })
        }
        return possibleMovementsList
    }
    const towerPossibleMovements = () => {
        var possibleMovementsList = [
            {...direction.N, direction: direction.N, type:'mv|eat', amount: 'max'},
            {...direction.S, direction: direction.S, type:'mv|eat', amount: 'max'},
            {...direction.W, direction: direction.W, type:'mv|eat', amount: 'max'},
            {...direction.E, direction: direction.E, type:'mv|eat', amount: 'max'},
        ];
        possibleMovementsList = generatePathPossibleMovements(possibleMovementsList)
        return possibleMovementsList
    }
    const bishopPossibleMovements = () => {
        var possibleMovementsList = [
            {...direction.NW, direction: direction.NW, type:'mv|eat', amount: 'max'},
            {...direction.NE, direction: direction.NE, type:'mv|eat', amount: 'max'},
            {...direction.SW, direction: direction.SW, type:'mv|eat', amount: 'max'},
            {...direction.SE, direction: direction.SE, type:'mv|eat', amount: 'max'},
        ];
        possibleMovementsList = generatePathPossibleMovements(possibleMovementsList)
        return possibleMovementsList
    }
    const queenPossibleMovements = () => {
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
        possibleMovementsList = generatePathPossibleMovements(possibleMovementsList)
        return possibleMovementsList
    }
    const kingPossibleMovements = () => {
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
        possibleMovementsList = generatePathPossibleMovements(possibleMovementsList)
        return possibleMovementsList
    }
    const horsePossibleMovements = () => {
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
        possibleMovementsList = generateHorsePossibleMovements(possibleMovementsList)
        return possibleMovementsList
    }
    var possibleMovements = []
    if(piece.piece_name == 'pawn'){
        possibleMovements = pawnPossibleMovements()
    }else if(piece.piece_name == 'tower'){
        possibleMovements = towerPossibleMovements()
    }else if(piece.piece_name == 'bishop'){
        possibleMovements = bishopPossibleMovements()
    }else if(piece.piece_name == 'queen'){
        possibleMovements = queenPossibleMovements()
    }else if(piece.piece_name == 'king'){
        possibleMovements = kingPossibleMovements()
    }else if(piece.piece_name == 'horse'){
        possibleMovements = horsePossibleMovements()
    }
    return validatePossibleMovements(possibleMovements)
}