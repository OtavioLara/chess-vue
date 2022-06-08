<template>
  <div class='chess-game'>
    <div class="chessboard">
      <div v-for="fields_column in chessBoardMatrix" :key="fields_column" >
        <BoardField 
        v-for="field in fields_column" 
        :key="field.pos.x + field.pos.y" 
        v-bind="field" 
        :draggable="true" 
        @dragstart="startDrag($event, field)"
        @drop="onDrop($event, field)"
        @dragenter.prevent
        @dragover.prevent
        @click="onClick($event, field)"
        />
      </div>
      <h1>{{checkMateMessage}}</h1>
      
    </div>
    <div class="graveyard">
      <GraveYard v-for="grave in graveyard" v-bind="grave" :key="grave"/>
    </div>
  </div>
</template>

<script>
  import BoardField from './Field.vue';
  import { piecesDict, piecesColor, fieldColor } from './PiecesUtil.js';
  import { possibleMovements, isKingCheck, isKingCheckMate} from './ChessValidations.js';
  let saves_context = require.context('../assets/saves/');
  import GraveYard from './GraveYard.vue'

  let HEIGHT = 8;
  let WIDTH = 8;

  const swapFieldColor = ((color) => {
    return fieldColor.dark == color ? fieldColor.light: fieldColor.dark;
  })
  const swapShift = ((shift) => piecesColor.D == shift ? piecesColor.W: piecesColor.D)

  const createFieldMatrix = () => {
        let matrix = []
        let startColor = fieldColor.dark;
        let curColor = fieldColor.dark;
        for(let i = 0; i < WIDTH; i++){ 
          startColor = swapFieldColor(startColor)
          curColor = startColor
          let column = []
          for(let j = 0; j < HEIGHT; j++){
            column.push({
              color: curColor,
              pos: {x: i, y: j}
            })
            curColor = swapFieldColor(curColor)
          }
          matrix.push(column)
        }
        return matrix;
      }

  const loadSavedGame = (json) => {
    let table = createFieldMatrix()
    let firstMovement = json[0]
    firstMovement.piecesPositions.map((piece) => {
      table[piece.x][piece.y] = {
        ...table[piece.x][piece.y],
        piece_name: piecesDict[piece.name],
        piece_color: piecesColor[piece.color],
        piece_mv_number: 0,
        mark_color: null
      }
    })
    return table
  }

  export default {
    name: 'ChessBoard',
    components: {
      BoardField,
      GraveYard
    },
    data() {
      return {
        chessBoardMatrix: loadSavedGame(saves_context('./save.json')),
        graveyard: [],
        shift: piecesColor.W,
        isInCheck: false,
        isInCheckMate: false
      }
    },
    methods: {
      mark(possibleMovementsList, piece){
        possibleMovementsList.forEach((movement) => {
          if(movement.type == 'mv'){
            this.chessBoardMatrix[movement.x + piece.pos.x][movement.y + piece.pos.y].mark_color = fieldColor.mark;
          }else if(movement.type == 'eat'){
            this.chessBoardMatrix[movement.x + piece.pos.x][movement.y + piece.pos.y].mark_color = fieldColor.eat;
          }
        })
      },
      unmark(){
        this.chessBoardMatrix = this.chessBoardMatrix
        .map((columns) => columns.map((field) => {
          field.mark_color = null
          field.pos.x = parseInt(field.pos.x)
          field.pos.y = parseInt(field.pos.y)
          return field
        }))
      },
      onClick(event, piece){
        var possibleMovementsList = possibleMovements(this.chessBoardMatrix, piece)
        this.unmark()
        this.mark(possibleMovementsList, piece)
      },
      startDrag(event, piece) {
        event.dataTransfer.dropEffect = 'move';
        event.dataTransfer.effectAllowed = 'move';
        event.dataTransfer.setData('plain/text', piece.pos.x + ','+piece.pos.y)
      },
      onDrop(event, newField){
        this.unmark()
        const [x, y] = event.dataTransfer.getData('plain/text').split(',');
        event.dataTransfer.clearData('plain/text')
        let newPiece = this.chessBoardMatrix[x][y]
        if(newPiece.piece_color != this.shift){
          return;
        }
        let possibleMovementsList = possibleMovements(this.chessBoardMatrix, newPiece)
        let movement = possibleMovementsList.find((movement) => (movement.x + newPiece.pos.x == newField.pos.x) && (movement.y + newPiece.pos.y == newField.pos.y))
        if(movement == null){
          return;
        }
        if(movement.type == 'eat'){
            this.graveyard.push(newField)
            console.log(this.graveyard)
        }
        this.chessBoardMatrix[x][y] = {
              color: this.chessBoardMatrix[x][y].color,
              pos: {x: x, y: y}
            }
        newPiece.pos.x = newField.pos.x
        newPiece.pos.y = newField.pos.y
        newPiece.color = newField.color
        newPiece.piece_mv_number += 1
        this.chessBoardMatrix[newField.pos.x][newField.pos.y] = newPiece
        this.isInCheck = isKingCheck(newPiece, this.chessBoardMatrix)
        if(this.isInCheck){
          this.isInCheckMate = isKingCheckMate(newPiece, this.chessBoardMatrix)
          if(this.isInCheckMate){
            return;
          }
        }
        this.shift = swapShift(this.shift)
      }
    },
    computed: {
      checkMateMessage: function () {
        var message = ''
        if(this.isInCheck){
          message = 'The king is in Check'
          if(this.isInCheckMate){
            message += ' Mate! '
            var winner = piecesColor.D == this.shift ? 'Blacks': 'Whites'
            message += winner + ' Wins!'
          }
        }
        return message
      }
    }
  }
</script>
<style>

.chessboard{
  display: flex;
  flex-flow: row wrap;
  width: 800px;
  height: 800px;
}
.chess-game{
  display: flex;
  flex-flow: row nowrap;
  gap: 1rem;
}
.graveyard{
  display: flex;
  flex-flow: column wrap;
  height: 800px;
}
</style>