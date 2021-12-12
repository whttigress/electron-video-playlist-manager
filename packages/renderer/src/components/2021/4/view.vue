<script setup>
import { ref, reactive } from 'vue'
import input from './input.txt'

var items = input.split(/\n\n\s?/).filter((x) => !!x)
var calledNumbers = items.shift().split(',')
var boards = items.map((x) => {
  return x
    .split(/\n\s?/)
    .filter((y) => !!y)
    .map((y) =>
      y.split(/\s+/).map((z) => {
        return { number: z, called: false }
      }),
    )
})
console.log(boards)
console.log(calledNumbers)
const score1 = reactive({})
for (var i = 0; i < calledNumbers.length; i++) {
  markCalled(calledNumbers[i], boards)
  var solvedBoard = checkSolved(boards)
  if (solvedBoard) {
    console.log(solvedBoard, calledNumbers[i], i)
    score1.lastNum = parseInt(calledNumbers[i])
    var sum = 0
    for (var j = 0; j < solvedBoard.board.length; j++) {
      for (var k = 0; k < solvedBoard.board[j].length; k++) {
        if (!solvedBoard.board[j][k].called) {
          sum += parseInt(solvedBoard.board[j][k].number)
        }
      }
    }
    score1.sum = sum
    score1.total = sum * parseInt(calledNumbers[i])
    break
  }
}
var boards2 = boards.filter((x) => true)
const score2 = reactive({})
outer_loop: for (var i = 0; i < calledNumbers.length; i++) {
  markCalled(calledNumbers[i], boards2)
  for (var j = 0; j < boards2.length; j++) {
    let board = boards2[j]
    var solved = checkBoardSolved(board)
    if (solved) {
      console.log(solved)
      boards2.splice(j, 1)
    }
    if (boards2.length == 0) {
      console.log(solved.board, calledNumbers[i], i)
      score2.lastNum = parseInt(calledNumbers[i])
      var sum = 0
      for (var j = 0; j < solved.board.length; j++) {
        for (var k = 0; k < solved.board[j].length; k++) {
          if (!solved.board[j][k].called) {
            sum += parseInt(solved.board[j][k].number)
          }
        }
      }
      //4351  too low
      score2.sum = sum
      score2.total = sum * parseInt(calledNumbers[i])
      break outer_loop
    }
  }
}
function markCalled(value, bds) {
  bds.forEach((board) => {
    board.forEach((row) => {
      row.forEach((cell) => {
        if (cell.number == value) {
          cell.called = true
        }
      })
    })
  })
}
function checkSolved(boardArray) {
  console.log(boardArray.length)
  for (var i = 0; i < boardArray.length; i++) {
    let board = boardArray[i]
    var solved = checkBoardSolved(board)
    if (solved) {
      return solved
    }
  }
}
function checkBoardSolved(board) {
  let rotBoard = rotate(board)
  for (var j = 0; j < board.length; j++) {
    if (board[j].filter((x) => x.called).length == 5) {
      console.log(board, j)
      return { board }
    }
    if (rotBoard[j].filter((x) => x.called).length == 5) {
      console.log(board, rotBoard, j, 'rotated')
      return { board }
    }
  }
}
function rotate(matrix) {
  // Create a deep copy of 2d array first
  let rotateArr = matrix.map((a) => a.slice())
  const n = rotateArr.length
  const x = Math.floor(n / 2)
  const y = n - 1
  for (let i = 0; i < x; i++) {
    for (let j = i; j < y - i; j++) {
      const k = rotateArr[i][j] // put first value in temp variable
      rotateArr[i][j] = rotateArr[y - j][i]
      rotateArr[y - j][i] = rotateArr[y - i][y - j]
      rotateArr[y - i][y - j] = rotateArr[j][y - i]
      rotateArr[j][y - i] = k
    }
  }
  return rotateArr
}
</script>
<template>
  <div>
    <h2>Day 4</h2>
    <h4>Puzzle 1</h4>
    {{ score1 }}
    <h4>Puzzle 2</h4>
    {{ score2 }}
  </div>
</template>
<style scoped></style>
