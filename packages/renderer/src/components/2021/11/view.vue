<script setup>
import { ref, reactive, nextTick } from 'vue'
import Octopus from './octopus.svg?inline'
import input from './input.txt'
import rfdc from 'rfdc'
const clone = rfdc()

var items = input
  .split('\n')
  .filter((x) => !!x)
  .map((x) =>
    x.split('').map((y) => {
      return { value: Number(y), flashed: false, iteration: -1 }
    }),
  )
let octopi = ref(clone(items))
function reset() {
  octopi.value = clone(items)
  totalFlashes.value = 0
  allFlashed.value = null
}
let totalFlashes = ref(0)
let allFlashed = ref(null)
async function run(iterations) {
  var i = 0
  totalFlashes.value = 0
  while (allFlashed.value == null && i < iterations) {
    setTimeout(
      (function (x) {
        return async function () {
          if (allFlashed.value == null) {
            var arr = octopi.value
            // for (var i = 0; i < iterations; i++) {
            await nextTick(() => {
              iterateGrid(x, arr)
              if (allFlashed.value == null) {
                var largeFlash = true
                checkFlash: for (var r = 0; r < arr.length; r++) {
                  for (var c = 0; c < arr[r].length; c++) {
                    if (arr[r][c].flashed != true) {
                      largeFlash = false
                      break checkFlash
                    }
                  }
                }
                if (largeFlash) {
                  allFlashed.value = x
                }
              }
              setTimeout(() => {}, 1000)
            })
            octopi.value = arr
          }
        }
      })(i),
      100 * i,
    )
    i++
  }
}
function iterateGrid(i, arr) {
  for (var r = 0; r < arr.length; r++) {
    for (var c = 0; c < arr[r].length; c++) {
      iterateCell(r, c, i, false, arr)
    }
  }
}
function iterateCell(r, c, i, fromAdjacent, arr) {
  var cell = arr[r][c]
  if (cell.iteration !== i) {
    cell.flashed = false
    cell.iteration = i
    cell.value += 1
  }
  if (fromAdjacent && !cell.flashed) {
    cell.value += 1
  }
  if (cell.value > 9 && !cell.flashed) {
    totalFlashes.value += 1
    cell.flashed = true
    cell.value = 0
    iterateAdjacent(r, c, i, arr)
  }
}
function iterateAdjacent(r, c, i, arr) {
  //we can only check the row above if it exists
  if (r >= 1) {
    //if column to left exists
    if (c >= 1) {
      iterateCell(r - 1, c - 1, i, true, arr)
    }
    //if column to right exists
    if (c < arr[r].length - 1) {
      iterateCell(r - 1, c + 1, i, true, arr)
    }
    iterateCell(r - 1, c, i, true, arr)
  }
  //we can only check the row below if it exists
  if (r < arr.length - 1) {
    //if column to left exists
    if (c >= 1) {
      iterateCell(r + 1, c - 1, i, true, arr)
    }
    //if column to right exists
    if (c < arr[r].length - 1) {
      iterateCell(r + 1, c + 1, i, true, arr)
    }
    iterateCell(r + 1, c, i, true, arr)
  }
  //if column to left exists
  if (c >= 1) {
    iterateCell(r, c - 1, i, true, arr)
  }
  //if column to right exists
  if (c < arr[r].length - 1) {
    iterateCell(r, c + 1, i, true, arr)
  }
}

console.log(octopi.value)
</script>
<template>
  <div>
    <h2>Day 11</h2>
    <v-btn @click="reset">Reset</v-btn>
    <h4>Puzzle 1</h4>
    <v-btn @click="run(100)">Run iteration</v-btn>
    <div>
      {{ totalFlashes }}
    </div>
    <div v-for="row in octopi">
      <span
        class="octopus"
        v-for="box in row"
        :class="box.flashed ? 'flash' : ''"
      >
        <Octopus
          height="80%"
          width="80%"
          :fill="box.flashed ? 'white' : '#333'"
        ></Octopus>
        <!-- {{ box.value }} -->
      </span>
    </div>
    <h4>Puzzle 2</h4>
    <v-btn @click="run(300)">Run iteration</v-btn>
    <div v-if="allFlashed">
      {{ allFlashed + 1 }}
    </div>
  </div>
</template>
<style scoped>
.octopus {
  /* border: 1px solid #222; */
  text-align: center;
  vertical-align: middle;
  display: table-cell;
  height: 50px;
  width: 50px;
}
.flash {
  /* background-color: white; */
  /* border: 1px solid white; */
  color: black;
  font-weight: bold;
}
</style>
