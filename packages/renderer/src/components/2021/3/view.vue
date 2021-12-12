<script setup>
import { ref, reactive } from 'vue'
import input from './input.txt'

var items = input.split('\n').filter((x) => !!x)

var bits = {}
for (var i = 0; i < items.length; i++) {
  var bin = items[i].split('')
  bin.forEach((x, idx) => {
    if (bits[idx] && bits[idx][x]) {
      bits[idx][x]++
    } else {
      if (!bits[idx]) {
        bits[idx] = {}
      }
      bits[idx][x] = 1
    }
  })
}
var gam = []
var eps = []
for (var i = 0; i < 12; i++) {
  if (bits[i][0] > bits[i][1]) {
    gam[i] = 0
    eps[i] = 1
  } else {
    gam[i] = 1
    eps[i] = 0
  }
}
let gamma1 = gam.join('')
let epsilon1 = eps.join('')
let conditions1 = {
  gammaDec: parseInt(gamma1, 2),
  gammaBin: gamma1,
  epsilonDec: parseInt(epsilon1, 2),
  epsilonBin: epsilon1,
  powerConsumption: parseInt(gamma1, 2) * parseInt(epsilon1, 2),
}
var oxygen = filterDirection(items, 'high')
var co2 = filterDirection(items, 'low')
function filterDirection(array, highLow) {
  for (var i = 0; i < 12; i++) {
    if (array.length == 1) {
      return array
    } else {
      if (array.length == array.filter((y) => y[i] == array[0][i]).length) {
        continue
      }
      let bitCounts = {}
      for (var j = 0; j < array.length; j++) {
        var bin = array[j].split('')
        bin.forEach((x, idx) => {
          if (bitCounts[idx] && bitCounts[idx][x]) {
            bitCounts[idx][x]++
          } else {
            if (!bitCounts[idx]) {
              bitCounts[idx] = {}
            }
            bitCounts[idx][x] = 1
          }
        })
      }
      var count = []
      for (var k = 0; k < 12; k++) {
        if (bitCounts[k][0] > bitCounts[k][1]) {
          count[k] = highLow == 'high' ? 0 : 1
        } else if (bitCounts[k][0] == bitCounts[k][1]) {
          count[k] = highLow == 'high' ? 1 : 0
        } else {
          count[k] = highLow == 'high' ? 1 : 0
        }
      }
      array = array.filter((x) => x[i] == count[i])
      console.log(array, i, highLow)
      return filterDirection(array, highLow)
    }
  }
}
console.log(oxygen, co2)
var lifeSupport = {
  oxygenBin: oxygen[0],
  co2Bin: co2[0],
  oxygenDec: parseInt(oxygen[0], 2),
  co2Dec: parseInt(co2[0], 2),
  rating: parseInt(oxygen[0], 2) * parseInt(co2[0], 2),
}
// var binary = "101101";
// var decimal = parseInt(binary, 2);
</script>
<template>
  <div>
    <h2>Day 3</h2>
    <h4>Puzzle 1</h4>
    {{ conditions1 }}
    <h4>Puzzle 2</h4>
    {{ lifeSupport }}
  </div>
</template>
<style scoped></style>
