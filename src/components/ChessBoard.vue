<template>
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
  </div>
</template>

<script>
  import BoardField from './Field.vue';
  import { piecesDict, piecesColor, fieldColor } from './PiecesUtil.js';
  import { possibleMovements } from './ChessValidations.js';
  let saves_context = require.context('../assets/saves/');

  let HEIGHT = 8;
  let WIDTH = 8;

  const swapColor = ((color) => {
    return fieldColor.dark == color ? fieldColor.light: fieldColor.dark;
  })

  const createFieldMatrix = () => {
        let matrix = []
        let startColor = fieldColor.dark;
        let curColor = fieldColor.dark;
        for(let i = 0; i < WIDTH; i++){ 
          startColor = swapColor(startColor)
          curColor = startColor
          let column = []
          for(let j = 0; j < HEIGHT; j++){
            column.push({
              color: curColor,
              pos: {x: i, y: j}
            })
            curColor = swapColor(curColor)
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
      BoardField
    },
    data() {
      return {
        chessBoardMatrix: loadSavedGame(saves_context('./save.json')),
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
        console.log(possibleMovementsList)
        this.unmark()
        this.mark(possibleMovementsList, piece)
      },
      startDrag(event, piece) {

        event.dataTransfer.dropEffect = 'move';
        event.dataTransfer.effectAllowed = 'move';
        console.log('start drag '+ piece.pos.x, piece.pos.y, piece.piece_mv_number)
        event.dataTransfer.setData('plain/text', piece.pos.x + ','+piece.pos.y)
      },
      onDrop(event, newField){
        if(newField.piece_name){
          return;
        }
        const [x, y] = event.dataTransfer.getData('plain/text').split(',');
        event.dataTransfer.clearData('plain/text')
        console.log(x,y)
        console.log(newField)
        let newPiece = this.chessBoardMatrix[x][y]
        this.chessBoardMatrix[x][y] = {
              color: this.chessBoardMatrix[x][y].color,
              pos: {x: x, y: y}
            }
        newPiece.pos.x = newField.pos.x
        newPiece.pos.y = newField.pos.y
        newPiece.color = newField.color
        newPiece.piece_mv_number += 1
        this.chessBoardMatrix[newField.pos.x][newField.pos.y] = newPiece
      }
    },
    computed: {
      
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
</style>