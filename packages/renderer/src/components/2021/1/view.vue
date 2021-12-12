<script setup>
import { ref } from 'vue'
import input from './input.txt'
// console.log(input)
var items = input
  .split('\n')
  .filter((x) => !!x)
  .map((x) => parseInt(x))
// console.log(items)
let increases = ref(0)
let groupIncreases = ref(0)
for (let i = 3; i < items.length; i++) {
  var prev = items[i - 3] + items[i - 2] + items[i - 1]
  var curr = items[i - 2] + items[i - 1] + items[i]
  if (curr > prev) {
    groupIncreases.value++
  }
}

for (let i = 1; i < items.length; i++) {
  let prev = items[i - 1]
  let curr = items[i]
  if (curr > prev) {
    increases.value += 1
  }
}
</script>
<template>
  <div>
    <h2>Day 1</h2>
    <h4>Puzzle 1</h4>
    {{ increases }}
    <h4>Puzzle 2</h4>
    {{ groupIncreases }}
  </div>
</template>
<style scoped></style>
