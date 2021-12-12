<script setup>
import { ref, reactive } from 'vue'
import input from './input.txt'

var items = input
  .split('\n')
  .filter((x) => !!x)
  .map((x) => x.split('').map(Number))
console.log(items)
function lineRisk(idx, arr) {
  var line = arr[idx]
  var lineRisk = 0
  for (var i = 0; i < line.length; i++) {
    var lowest = true
    //above
    if (idx > 0) {
      lowest = arr[idx - 1][i] > line[i]
    }
    //left
    if (i > 0 && lowest) {
      lowest = line[i - 1] > line[i]
    }
    //right
    if (i < line.length - 1 && lowest) {
      lowest = line[i + 1] > line[i]
    }
    //below
    if (idx < arr.length - 1 && lowest) {
      lowest = arr[idx + 1][i] > line[i]
    }
    //if none below add value + 1 to lineRisk
    if (lowest) {
      lineRisk += line[i] + 1
    }
  }
  return lineRisk
}
var lowPoint = {}
var includedInBasin = {}
function lowPoints(idx, arr) {
  var line = arr[idx]
  for (var i = 0; i < line.length; i++) {
    var lowest = true
    //above
    if (idx > 0) {
      lowest = arr[idx - 1][i] > line[i]
    }
    //left
    if (i > 0 && lowest) {
      lowest = line[i - 1] > line[i]
    }
    //right
    if (i < line.length - 1 && lowest) {
      lowest = line[i + 1] > line[i]
    }
    //below
    if (idx < arr.length - 1 && lowest) {
      lowest = arr[idx + 1][i] > line[i]
    }
    //if none below add value + 1 to lineRisk
    if (lowest) {
      lowPoint[`${idx}-${i}`] = 0
    }
  }
}

function countAdjacentBasinCells(row, col, arr) {
  var count = 1
  if (arr[row][col] == 9) {
    return 0
  }
  if (includedInBasin[`${row}-${col}`]) {
    return 0
  }
  includedInBasin[`${row}-${col}`] = true
  //above
  if (row > 0) {
    count += countAdjacentBasinCells(row - 1, col, arr)
  }
  //left
  if (col > 0) {
    count += countAdjacentBasinCells(row, col - 1, arr)
  }
  //right
  if (col < arr[row].length - 1) {
    count += countAdjacentBasinCells(row, col + 1, arr)
  }
  //below
  if (row < arr.length - 1) {
    count += countAdjacentBasinCells(row + 1, col, arr)
  }
  return count
}
const pickHighest = (obj, num = 1) => {
  const requiredObj = {}
  if (num > Object.keys(obj).length) {
    return false
  }
  Object.keys(obj)
    .sort((a, b) => obj[b] - obj[a])
    .forEach((key, ind) => {
      if (ind < num) {
        requiredObj[key] = obj[key]
      }
    })
  return requiredObj
}
var risk = items.reduce((acc, curr, idx, arr) => acc + lineRisk(idx, arr), 0)
items.forEach((currentValue, index, arr) => {
  lowPoints(index, arr)
})
Object.entries(lowPoint).forEach((entry) => {
  const [key, value] = entry
  const [row, col] = key.split('-').map(Number)
  lowPoint[key] = countAdjacentBasinCells(row, col, items)
})
var highest = pickHighest(lowPoint, 3)
var multiple = Object.values(highest).reduce((acc, curr) => acc * curr, 1)
console.log(multiple)
</script>
<template>
  <div>
    <h2>Day 9</h2>
    <h4>Puzzle 1</h4>
    {{ risk }}
    <h4>Puzzle 2</h4>
    {{ multiple }}
  </div>
</template>
<style scoped></style>
