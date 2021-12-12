<script setup>
import { ref, reactive } from 'vue'
import input from './input.txt'

var items = input.split('\n').filter((x) => !!x)
var position = reactive({ horizontal: 0, depth: 0 })
items.forEach((x) => {
  const [dir, dist] = x.split(' ')
  switch (dir) {
    case 'forward':
      position.horizontal += parseInt(dist)
      break
    case 'up':
      position.depth -= parseInt(dist)
      break
    case 'down':
      position.depth += parseInt(dist)
      break
  }
})
var position2 = reactive({ horizontal: 0, depth: 0, aim: 0 })
items.forEach((x) => {
  const [dir, dist] = x.split(' ')
  switch (dir) {
    case 'forward':
      position2.horizontal += parseInt(dist)
      position2.depth += parseInt(dist) * position2.aim
      break
    case 'up':
      position2.aim -= parseInt(dist)
      break
    case 'down':
      position2.aim += parseInt(dist)
      break
  }
})
</script>
<template>
  <div>
    <h2>Day 2</h2>
    <h4>Puzzle 1</h4>
    {{ position }} - {{ position.depth * position.horizontal }}
    <h4>Puzzle 2</h4>
    {{ position2 }} - {{ position2.depth * position2.horizontal }}
  </div>
</template>
<style scoped></style>
