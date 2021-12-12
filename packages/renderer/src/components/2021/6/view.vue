<script setup>
import { ref, reactive } from 'vue'
import input from './input.txt'

var fish = input
  .replace('\n', '')
  .split(',')
  .filter((x) => !!x)
  .map(Number)
var fish2 = input
  .replace('\n', '')
  .split(',')
  .filter((x) => !!x)
  .map(Number)

for (var d = 0; d < 80; d++) {
  var length = fish.length
  for (var i = 0; i < length; i++) {
    fish[i] = fish[i] - 1
    if (fish[i] < 0) {
      fish[i] = 6
      fish.push(8)
      // console.log(fish[i], fish, d, i)
    }
  }
  console.log(fish.length, d)
}
var fishCount = fish.length

var fishTracker = {}

function countFish(age, day, max) {
  if (fishTracker[`${age}-${day}`]) {
    return fishTracker[`${age}-${day}`]
  }
  //we have this fish
  let fishCount = 1
  //they will spawn after their age counts down to -1 (so on the date that adds their age + 1 + today)
  let nextSpawn = day + age + 1
  //now we find the count of the fish they spawn
  while (nextSpawn <= max) {
    //they spawn a 8 age fish ath their next spawn
    fishCount += countFish(8, nextSpawn, max)
    //and every 7 days afterward
    nextSpawn += 7
  }

  fishTracker[`${age}-${day}`] = fishCount

  return fishCount
}

var fish2Count = fish2.reduce((acc, age) => acc + countFish(age, 0, 256), 0)
</script>
<template>
  <div>
    <h2>Day 6</h2>
    <h4>Puzzle 1</h4>
    {{ fishCount }}
    <h4>Puzzle 2</h4>
    {{ fish2Count }}
  </div>
</template>
<style scoped></style>
