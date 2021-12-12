<script setup>
import { ref, reactive } from 'vue'
import input from './input.txt'

var items = input.split('\n').filter((x) => !!x)
let score = reactive({ p: 0, s: 0, c: 0, a: 0, t: 0 })
for (let i = 0; i < items.length; i++) {
  var line = items[i]
  var validation = validateBrackets(line)
  if (validation !== true) {
    if (validation == ')') {
      score.p++
      score.t += 3
    }
    if (validation == ']') {
      score.s++
      score.t += 57
    }
    if (validation == '}') {
      score.c++
      score.t += 1197
    }
    if (validation == '>') {
      score.a++
      score.t += 25137
    }
  }
  // console.log(i, line, validation, score)
}
let cScore = reactive({ list: [], needCompletion: [] })
for (let i = 0; i < items.length; i++) {
  var line = items[i]
  var validation = validateBrackets(line)
  if (validation !== true) {
    if (
      validation == ')' ||
      validation == ']' ||
      validation == '}' ||
      validation == '>'
    ) {
    } else {
      let complete = { i, needed: validation.join('') }
      let lscore = 0
      let toComplete = []
      while (validation.length > 0) {
        var lastChar = validation.pop()
        switch (lastChar) {
          case '(':
            toComplete.push(')')
            lscore = lscore * 5 + 1
            break
          case '[':
            toComplete.push(']')
            lscore = lscore * 5 + 2
            break
          case '{':
            toComplete.push('}')
            lscore = lscore * 5 + 3
            break
          case '<':
            toComplete.push('>')
            lscore = lscore * 5 + 4
            break
        }
      }
      complete.score = lscore
      complete.toComplete = toComplete.join('')
      // cScore.needCompletion.push(complete)
      cScore.list.push(lscore)
    }
  }
}
cScore.list.sort((a, b) => a - b)
let mid = Math.floor(cScore.list.length / 2)
cScore.middle = cScore.list[mid]
//43723 is too low
function validateBrackets(line) {
  var stack = []
  for (let i = 0; i < line.length; i++) {
    switch (line[i]) {
      case '(':
        stack.push('(')
        break
      case '[':
        stack.push('[')
        break
      case '{':
        stack.push('{')
        break
      case '<':
        stack.push('<')
        break
      case ')':
        if (stack[stack.length - 1] == '(') {
          stack.pop()
        } else {
          return ')'
        }
        break
      case ']':
        if (stack[stack.length - 1] == '[') {
          stack.pop()
        } else {
          return ']'
        }
        break
      case '}':
        if (stack[stack.length - 1] == '{') {
          stack.pop()
        } else {
          return '}'
        }
        break
      case '>':
        if (stack[stack.length - 1] == '<') {
          stack.pop()
        } else {
          return '>'
        }
        break
    }
  }
  if (stack.length != 0) {
    // we have a mismatching brace
    return stack
  } else {
    return true
  }
}
</script>
<template>
  <div>
    <h2>Day 10</h2>
    <h4>Puzzle 1</h4>
    {{ score }}
    <h4>Puzzle 2</h4>
    {{ cScore }}
  </div>
</template>
<style scoped></style>
