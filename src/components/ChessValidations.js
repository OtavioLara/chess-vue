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

    const isPathValid = (movement) => {
        while(movement){
            
        }
    }
    const validatePossibleMovements = (possibleMovements) => {
        return possibleMovements.filter((movement) => {
            return !willKingCheck(movement) &&
                (movement.amount == 1 || isPathValid(movement)) &&
                (
                    (movement.type == 'eat' && isEnemy(movement)) ||
                    (movement.type == 'mv' && isEmpty(movement)) ||
                    (movement.type == 'mv|eat' && isEmpty(movement))
                ) &&
                (
                    (movement.especialConditions == null) ||  
                    (movement.especialConditions.every((c) => c == true))
                )
        })
    }
    const pawnPossibleMovements = () => {
        var possibleMovementsList = [
            {...direction.S,  type:'mv', amount: 1},
            {...direction.S,  type:'mv', amount: 2, especialConditions: [piece.piece_mv_number == 0]},
            {...direction.SW, type:'eat', amount: 1},
            {...direction.SE, type:'eat', amount: 1}
        ];
        if(piece.piece_color == piecesColor.W){
            return possibleMovementsList.map((movement) => {
                movement.y *= -1
                return movement
            })
        }
        return possibleMovementsList
    }
    return validatePossibleMovements(pawnPossibleMovements())
}