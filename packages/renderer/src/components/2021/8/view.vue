<script setup>
import { ref, reactive } from 'vue'
import input from './input.txt'

var items = input
  .split('\n')
  .filter((x) => !!x)
  .map((y) => {
    return {
      signal: y.split(' | ')[0].split(' '),
      output: y.split(' | ')[1].split(' '),
    }
  })
var counts = reactive({})
items.forEach((x) => {
  x.output.forEach((y) => {
    if (y.length == 2 || y.length == 3 || y.length == 4 || y.length == 7) {
      counts[y.length] ? (counts[y.length] += 1) : (counts[y.length] = 1)
      counts.total ? (counts.total += 1) : (counts.total = 1)
    }
  })
})
var total = ref(0)
items.forEach((x) => {
  var symbols = { 8: 'abcdefg' }
  var concat = x.signal.reduce((acc, e) => acc.concat(...e), [])
  var occ = concat.reduce((obj, e) => {
    obj[e] = (obj[e] || 0) + 1
    return obj
  }, {})
  Object.entries(occ).forEach((entry) => {
    const [key, value] = entry
    if (value == 4) {
      symbols.e = key
    }
    if (value == 6) {
      symbols.b = key
    }
    if (value == 9) {
      symbols.f = key
    }
  })
  x.signal.forEach((y) => {
    if (y.length == 2) {
      symbols[1] = y.split('').sort().join('')
      symbols.c = y.replace(symbols.f, '')
      if (symbols[4]) {
        symbols.d = symbols[4]
          .replace(symbols.c, '')
          .replace(symbols.f, '')
          .replace(symbols.b, '')
      }
      if (symbols[7]) {
        symbols.a = symbols[7].replace(symbols.c, '').replace(symbols.f, '')
      }
    }
    if (y.length == 3) {
      symbols[7] = y.split('').sort().join('')
      if (symbols.c && symbols.f) {
        symbols.a = y.replace(symbols.c, '').replace(symbols.f, '')
      }
    }
    if (y.length == 4) {
      symbols[4] = y.split('').sort().join('')
      if (symbols.c && symbols.f && symbols.b) {
        symbols.d = y
          .replace(symbols.c, '')
          .replace(symbols.f, '')
          .replace(symbols.b, '')
      }
    }
  })
  if (
    symbols[8] &&
    symbols.a &&
    symbols.b &&
    symbols.c &&
    symbols.d &&
    symbols.e &&
    symbols.f
  ) {
    symbols.g = symbols[8]
      .replace(symbols.a, '')
      .replace(symbols.b, '')
      .replace(symbols.c, '')
      .replace(symbols.d, '')
      .replace(symbols.e, '')
      .replace(symbols.f, '')
  }
  symbols[2] = (symbols.a + symbols.c + symbols.d + symbols.e + symbols.g)
    .split('')
    .sort()
    .join('')
  symbols[3] = (symbols.a + symbols.c + symbols.d + symbols.f + symbols.g)
    .split('')
    .sort()
    .join('')
  symbols[5] = (symbols.a + symbols.b + symbols.d + symbols.f + symbols.g)
    .split('')
    .sort()
    .join('')
  symbols[6] = (
    symbols.a +
    symbols.b +
    symbols.d +
    symbols.e +
    symbols.f +
    symbols.g
  )
    .split('')
    .sort()
    .join('')
  symbols[9] = (
    symbols.a +
    symbols.b +
    symbols.c +
    symbols.d +
    symbols.f +
    symbols.g
  )
    .split('')
    .sort()
    .join('')
  symbols[0] = (
    symbols.a +
    symbols.b +
    symbols.c +
    symbols.e +
    symbols.f +
    symbols.g
  )
    .split('')
    .sort()
    .join('')
  var tot = ''
  x.output.forEach((x) => {
    var out = x.split('').sort().join('')
    for (var i = 0; i < 10; i++) {
      if (out == symbols[i]) {
        tot = tot + i.toString()
      }
    }
  })
  total.value = total.value + parseInt(tot)
  console.log(symbols, tot)
})
// 2 digits is a 1 (cf)
// 3 digits is a 7 (acf) (so we know a because of the extra character)
// 4 digits is a 4 (bcdf) (ba and d are not in 1 or 7)
// 5 digits could be a 2,3 or 5
//chars not in 2 are both in 0,4,5,6,8,9
//chars not in 3 are both in 0,6
//chars not in 5 are both in 0,2,8
// 6 digits could be a 0,6,or 9
// char not in 0 is in 2,3,4,5,6,8,9 (only missing in 0,1 and 7)
// char not in 6 is in 0,1,2,3,4,7,8,9 (only missing in 5 and 6)
// char not in 9 is in 0,2,6,8 (missing from 1,3,4,5,7,9)
// 7 digits is an 8

//a is in 8 digits - this is the char in 7 but not 1
//b is in 6 digits** - can be determined by counting digits that contain it
//c is in 8 digits - since we know f and 1 this is the other char in 1
//d is in 7 digits - this is the char in 4 that is not in 1 and is not b
//e is in 4 digits** - can be determined by counting digits that contain it
//f is in 9 digits** - can be determined by counting digits that contain it
//g is in 7 digits
</script>
<template>
  <div>
    <h2>Day 8</h2>
    <h4>Puzzle 1</h4>
    {{ counts }}
    <h4>Puzzle 2</h4>
    {{ total }}
  </div>
</template>
<style scoped></style>
