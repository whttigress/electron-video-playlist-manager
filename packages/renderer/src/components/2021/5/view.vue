<script setup>
import { ref, reactive } from 'vue'
import input from './input.txt'

var items = input.split('\n').filter((x) => !!x)

var lines = items.map((line) =>
  line.split(' -> ').map((points) => points.split(',').map(Number)),
)
var map1 = []
var map2 = []
lines.forEach((line) => {
  let [x1, y1] = line[0]
  let [x2, y2] = line[1]
  mapHVVent(x1, y1, x2, y2)
})
lines.forEach((line) => {
  let [x1, y1] = line[0]
  let [x2, y2] = line[1]
  mapHVDVent(x1, y1, x2, y2)
})

// console.log(lines)
// items.forEach((item) => {
//   let [f, s] = item.split(' -> ')
//   let [x1, y1] = f.split(',').map(Number)
//   let [x2, y2] = s.split(',').map(Number)
//   mapHVVent(x1, y1, x2, y2)
// })
//4684  is too low
var danger = reactive({ count: 0 })
for (var i = 0; i < map1.length; i++) {
  if (map1[i]) {
    for (var j = 0; j < map1[i].length; j++) {
      if (map1[i][j] && map1[i][j] >= 2) {
        danger.count++
      }
    }
  }
}
//19417  too high
var danger2 = reactive({ count: 0 })
for (var i = 0; i < map1.length; i++) {
  if (map2[i]) {
    console.log(map2.length, map2[i].length)
    for (var j = 0; j < map2[i].length; j++) {
      if (map2[i][j] && map2[i][j] >= 2) {
        danger2.count++
      }
    }
  }
}
function mapHVVent(x1, y1, x2, y2) {
  var [lx, hx] = x1 <= x2 ? [x1, x2] : [x2, x1]
  var [ly, hy] = y1 <= y2 ? [y1, y2] : [y2, y1]
  if (lx == hx) {
    if (!map1[lx]) {
      map1[lx] = []
    }
    for (var i = ly; i <= hy; i++) {
      if (!map1[lx][i]) {
        map1[lx][i] = 0
      }
      map1[lx][i]++
    }
  }
  if (ly == hy) {
    for (var i = lx; i <= hx; i++) {
      if (!map1[i]) {
        map1[i] = []
      }
      if (!map1[i][ly]) {
        map1[i][ly] = 0
      }
      map1[i][ly]++
    }
  }
}
function mapHVDVent(x1, y1, x2, y2) {
  var [lx, hx] = x1 <= x2 ? [x1, x2] : [x2, x1]
  var [ly, hy] = y1 <= y2 ? [y1, y2] : [y2, y1]
  if (lx == hx) {
    if (!map2[lx]) {
      map2[lx] = []
    }
    for (var i = ly; i <= hy; i++) {
      if (!map2[lx][i]) {
        map2[lx][i] = 0
      }
      map2[lx][i]++
    }
  } else if (ly == hy) {
    for (var i = lx; i <= hx; i++) {
      if (!map2[i]) {
        map2[i] = []
      }
      if (!map2[i][ly]) {
        map2[i][ly] = 0
      }
      map2[i][ly]++
    }
  } else {
    for (var x = x1, y = y1; x <= hx && x >= lx && y <= hy && y >= ly; ) {
      if (!map2[x]) {
        map2[x] = []
      }
      if (!map2[x][y]) {
        map2[x][y] = 0
      }
      map2[x][y]++
      x = x + Math.sign(x2 - x1)
      y = y + Math.sign(y2 - y1)
    }
  }
}
</script>
<template>
  <div>
    <h2>Day 5</h2>
    <h4>Puzzle 1</h4>
    {{ danger }}
    <h4>Puzzle 2</h4>
    {{ danger2 }}
  </div>
</template>
<style scoped></style>
