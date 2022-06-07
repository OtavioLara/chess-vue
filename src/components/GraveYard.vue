<template>
  <div class="grave-field" :style="{backgroundColor: 'gray'}" >
    <img v-if="this.piece_name" :src="images_context(`./${this.piece_color}-${this.piece_name}.svg`)" class="grave-chess-piece"/>
  </div>
</template>
<script>
export default {
  name: 'GraveYard',
  props: {
    color : String,
    piece_name: String,
    piece_color: String,
  },
  data() {
    return {
      images_context: require.context('../assets/imgs/'),
    }
  }
}
</script>
<style>
.grave-field{
    width: 100px;
    height: 100px;
    display: flex;
    align-items: center;
    justify-content: center;
}
.grave-chess-piece{
  height: 80%;
  width: 80%;
  cursor: pointer;
}
</style>