<script setup>
import { ref, reactive } from 'vue'
import input from './input.txt'

var crabs = input
  .replace('\n', '')
  .split(',')
  .filter((x) => !!x)
  .map(Number)
var max = Math.max(...crabs)
var pos = reactive([])
for (var i = 0; i <= max; i++) {
  var fuel = crabs.reduce((acc, pos) => acc + Math.abs(pos - i), 0)
  pos[i] = fuel
}
console.log(crabs, max, pos, Math.min(...pos))
var pos2 = reactive([])
for (var i = 0; i <= max; i++) {
  var fuel = crabs.reduce(
    (acc, pos) => acc + (Math.abs(pos - i) * (Math.abs(pos - i) + 1)) / 2,
    0,
  )
  pos2[i] = fuel
}
console.log(crabs, max, pos2, Math.min(...pos2))
</script>
<template>
  <div>
    <h2>Day 7</h2>
    <h4>Puzzle 1</h4>
    {{ Math.min(...pos) }}
    <h4>Puzzle 2</h4>
    {{ Math.min(...pos2) }}
  </div>
</template>
<style scoped></style>
