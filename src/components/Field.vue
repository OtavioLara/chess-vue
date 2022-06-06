<template>
  <div class="field" :style="{backgroundColor: colorView}" >
    <img v-if="this.piece_name" :src="images_context(`./${this.piece_color}-${this.piece_name}.svg`)" class="chess-piece"/>
  </div>
</template>
<script>
export default {
  name: 'BoardField',
  props: {
    color : String,
    piece_name: String,
    piece_color: String,
    piece_mv_number: Number,
    mark_color: String,
  },
  data() {
    return {
      images_context: require.context('../assets/imgs/'),
    }
  },
  computed: {
    colorView() {
      return this.mark_color != null ? this.mark_color : this.color
    }
  }
}
</script>
<style>
.field{
    width: 100px;
    height: 100px;
    display: flex;
    align-items: center;
    justify-content: center;
}
.chess-piece{
  height: 80%;
  width: 80%;
  cursor: pointer;
}
</style>