import { defineStore, storeToRefs } from 'pinia'
import { ref, computed, watch } from 'vue'
import sudoku from '/@/lib/sudoku'
import { useSudokuSettingsStore } from '/@/stores/sudokuSettings'
import { useSudokuValidation } from '/@/composables/sudokuValidation'
import { useSudokuSolving } from '/@/composables/sudokuSolving'
export const useSudokuStore = defineStore('sudokuPuzzleStore', () => {
  const puzzle = ref([])
  const history = ref([])
  const future = ref([])
  const { isCellInvalid } = useSudokuValidation(puzzle)
  const success = ref(false)
  function isGameComplete() {
    // this goes through all cells in the grid to see if we are done
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (isCellInvalid(r, c, puzzle.value[r][c].value)) {
          success.value = false
          return false
        }
      }
    }
    // if everything is good set success to true and reset the timer
    success.value = true
    clearInterval(timer)
    return true
  }
  function isNumberComplete(value) {
    //this checks the value sent in to see if it has been used 9 times
    let needed = 9
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (puzzle.value[r][c].value == value) {
          needed--
        }
      }
    }
    return needed == 0
  }
  function setCellValue(value) {
    history.value.push(JSON.parse(JSON.stringify(puzzle.value)))
    future.value = []
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (
          puzzle.value[r][c].selected &&
          !puzzle.value[r][c].original &&
          !editPuzzle.value
        ) {
          puzzle.value[r][c].value = value
        } else if (puzzle.value[r][c].selected && editPuzzle.value) {
          puzzle.value[r][c].value = value
          puzzle.value[r][c].original = true
        }
      }
    }

    if (!isGameComplete()) {
      calculatePossibilities()
      getSolution()
    }
  }

  const editPuzzle = ref(false)
  watch(editPuzzle, (newValue, oldValue) => {
    if (newValue) {
      clearTimer()
    } else if (oldValue) {
      const settings = useSudokuSettingsStore()
      const { difficulty } = storeToRefs(settings)
      difficulty.value = 'custom'
      getSolution()
      calculatePossibilities()
      resetTimer()
    }
  })
  const solveNakedSingles = ref(false)
  const solveNakedPairs = ref(false)
  const solveNakedTriples = ref(false)
  const solveNakedQuads = ref(false)
  const solveHiddenSingles = ref(false)
  const solveHiddenPairs = ref(false)
  const solveHiddenTriples = ref(false)
  const solveHiddenQuads = ref(false)
  const solveRestricted = ref(false)
  watch(
    [
      solveNakedSingles,
      solveNakedPairs,
      solveNakedTriples,
      solveNakedQuads,
      solveHiddenSingles,
      solveHiddenPairs,
      solveHiddenTriples,
      solveHiddenQuads,
      solveRestricted,
    ],
    (newValue, oldValue) => {
      console.log('setting changed, recalculate')
      calculatePossibilities()
    },
  )
  function resetSolves() {
    solveNakedSingles.value = false
    solveNakedPairs.value = false
    solveNakedTriples.value = false
    solveNakedQuads.value = false
    solveHiddenSingles.value = false
    solveHiddenPairs.value = false
    solveHiddenTriples.value = false
    solveHiddenQuads.value = false
    solveRestricted.value = false
  }

  const seconds = ref(0)
  let timer = null
  function resetTimer() {
    seconds.value = 0
    clearInterval(timer)
    timer = setInterval(() => {
      seconds.value += 1
    }, 1000)
  }
  function clearTimer() {
    clearInterval(timer)
  }

  function generatePuzzle() {
    console.log('Generating puzzle')
    history.value = []
    future.value = []
    const settings = useSudokuSettingsStore()
    let boardString = sudoku.generate(settings.difficulty)
    let tries = 0
    while (checkForMultipleSolutions(boardString)) {
      console.log(`tried ${tries} times to generate unique puzzle`)
      boardString = sudoku.generate(settings.difficulty)
      tries++
      if (tries > 100) break
    }
    puzzle.value = sudoku.board_string_to_grid(boardString).map((row) => {
      return row.map((cell) => {
        return {
          value: cell != '.' ? parseInt(cell) : null,
          original: cell != '.',
          selected: false,
          cornerPencils: [],
          centerPencils: [],
          possibleValues: [],
          pairs: [],
          cellPairs: [],
          rowPairs: [],
          colPairs: [],
          gridPairs: [],
          numberComplete: false,
        }
      })
    })
    getSolution()
    resetTimer()
    calculatePossibilities()
  }
  const { calculatePossibilities, solve } = useSudokuSolving(
    puzzle,
    history,
    future,
  )
  function rotate(text, noOfChars = 0) {
    const n = noOfChars % text.length
    const part1 = text.slice(0, n)
    const part2 = text.slice(n)
    return `${part2}${part1}`
  }
  function rotateColumn(text, rows, columns) {
    const n = noOfChars % text.length
    const part1 = text.slice(0, n)
    const part2 = text.slice(n)
    return `${part2}${part1}`
  }
  function checkForMultipleSolutions(boardString) {
    let p2 = rotate(boardString, 9 * 3)
    let p3 = rotate(boardString, 9 * 6)

    let s1 = sudoku.solve(boardString)
    let s2 = sudoku.solve(p2)
    let s3 = sudoku.solve(p3)

    let r1 = sudoku
      .solve(boardString.split('').reverse().join(''))
      .split('')
      .reverse()
      .join('')
    let r2 = sudoku
      .solve(p2.split('').reverse().join(''))
      .split('')
      .reverse()
      .join('')
    let r3 = sudoku
      .solve(p3.split('').reverse().join(''))
      .split('')
      .reverse()
      .join('')
    let x2 = rotate(s2, 9 * 6)
    let xr2 = rotate(r2, 9 * 6)
    let x3 = rotate(s3, 9 * 3)
    let xr3 = rotate(r3, 9 * 3)
    if (s1 != r1 || s1 != x2 || s1 != xr2 || s1 != x3 || s1 != xr3) {
      console.log('multiple solutions', s1, r1, x2, xr2, x3, xr3)
      return true
    } else {
      return false
    }
  }
  const multipleSolutions = ref(false)
  function getSolution() {
    console.log('Getting Solution')
    // this gets the solution usign the sudoku.js library
    let unmapped = puzzle.value.map((row) => {
      return row.map((cell) => {
        return cell.value ? cell.value : '.'
      })
    })
    console.log()
    try {
      let puzzleString = sudoku.board_grid_to_string(unmapped)
      let p2 = rotate(puzzleString, 9 * 3)
      let p3 = rotate(puzzleString, 9 * 6)

      let solutionString = sudoku.solve(puzzleString)
      if (checkForMultipleSolutions(puzzleString)) {
        console.log('multiple solutions')
        multipleSolutions.value = true
      } else {
        multipleSolutions.value = false
      }

      let solution = sudoku.board_string_to_grid(solutionString)
      for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
          puzzle.value[r][c].solution = solution[r][c]
        }
      }
    } catch (err) {
    } finally {
    }
  }
  const pencilHighlight = ref(null)
  function highlightPencilNumbers(number) {
    if (pencilHighlight.value == number) {
      pencilHighlight.value = null
    } else {
      pencilHighlight.value = number
    }
  }

  function undo() {
    if (history.value.length > 0) {
      future.value.push(JSON.parse(JSON.stringify(puzzle.value)))
      let lastEntry = history.value.pop()
      puzzle.value = JSON.parse(JSON.stringify(lastEntry))
    }
  }
  function redo() {
    if (future.value.length > 0) {
      history.value.push(JSON.parse(JSON.stringify(puzzle.value)))
      let lastEntry = future.value.pop()
      puzzle.value = JSON.parse(JSON.stringify(lastEntry))
    }
  }
  function resetSelected() {
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        puzzle.value[r][c].selected = false
      }
    }
  }
  function clearSelected() {
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (
          puzzle.value[r][c].selected &&
          (!puzzle.value[r][c].original || editPuzzle.value)
        ) {
          if (puzzle.value[r][c].value) {
            puzzle.value[r][c].value = null
            if (editPuzzle.value) {
              puzzle.value[r][c].original = false
            }
          } else {
            puzzle.value[r][c].cornerPencils = []
            puzzle.value[r][c].centerPencils = []
          }
        }
      }
    }
  }
  function resetPuzzle() {
    console.log('Resetting puzzle')
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (!puzzle.value[r][c].original) {
          puzzle.value[r][c].value = null
          puzzle.value[r][c].cornerPencils = []
          puzzle.value[r][c].centerPencils = []
          puzzle.value[r][c].possibleValues = []
          puzzle.value[r][c].solution = null
          puzzle.value[r][c].selected = false
        }
      }
    }
    getSolution()
    calculatePossibilities()
    resetTimer()
  }
  function clearPuzzle() {
    console.log('Clearing puzzle')
    history.value = []
    future.value = []
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        puzzle.value[r][c].value = null
        puzzle.value[r][c].cornerPencils = []
        puzzle.value[r][c].centerPencils = []
        puzzle.value[r][c].possibleValues = []
        puzzle.value[r][c].rowPairs = []
        puzzle.value[r][c].colPairs = []
        puzzle.value[r][c].gridPairs = []
        puzzle.value[r][c].cellPairs = []
        puzzle.value[r][c].pairs = []
        puzzle.value[r][c].solution = null
        puzzle.value[r][c].selected = false
        puzzle.value[r][c].original = false
      }
    }
  }
  function selectNumber(number, e) {
    // console.log(number, e)
    if (e.shiftKey && !e.ctrlKey && !e.altKey) {
      //toggle cornerPencilMark
      setCornerPencil(number)
    } else if (!e.shiftKey && e.ctrlKey && !e.altKey) {
      //toggle centerPencilMark
      setCenterPencil(number)
    } else if (!e.shiftKey && !e.ctrlKey && e.altKey) {
      //toggle color?
      highlightPencilNumbers(number)
    } else if (!e.shiftKey && !e.ctrlKey && !e.altKey) {
      //normal keypress
      setCellValue(number)
    }
  }
  function clearColors() {
    console.log('Clearing colors')
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        puzzle.value[r][c].color = null
        for (let i = 0; i < puzzle.value[r][c].cornerPencils.length; i++) {
          puzzle.value[r][c].cornerPencils[i].color = null
        }
        for (let i = 0; i < puzzle.value[r][c].centerPencils.length; i++) {
          puzzle.value[r][c].centerPencils[i].color = null
        }
      }
    }
  }
  function selectColor(color) {
    history.value.push(JSON.parse(JSON.stringify(puzzle.value)))
    future.value = []
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (puzzle.value[r][c].selected) {
          if (puzzle.value[r][c].color == color) {
            puzzle.value[r][c].color = null
          } else {
            puzzle.value[r][c].color = color
          }
        }
      }
    }
  }
  function setCornerPencil(value) {
    history.value.push(JSON.parse(JSON.stringify(puzzle.value)))
    future.value = []
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (puzzle.value[r][c].selected && !puzzle.value[r][c].original) {
          //set pencil marks
          let match = puzzle.value[r][c].cornerPencils.findIndex(
            (p) => p.value == value,
          )
          if (match >= 0) {
            puzzle.value[r][c].cornerPencils.splice(match, 1)
          } else {
            let pencil = { value: value, color: false }
            puzzle.value[r][c].cornerPencils.push(pencil)
          }
          puzzle.value[r][c].cornerPencils.sort((a, b) => a.value - b.value)
        }
      }
    }
  }
  function setCenterPencil(value) {
    history.value.push(JSON.parse(JSON.stringify(puzzle.value)))
    future.value = []
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (puzzle.value[r][c].selected && !puzzle.value[r][c].original) {
          //set pencil marks
          let match = puzzle.value[r][c].centerPencils.findIndex(
            (p) => p.value == value,
          )
          if (match >= 0) {
            puzzle.value[r][c].centerPencils.splice(match, 1)
          } else {
            let pencil = { value: value, color: false }
            puzzle.value[r][c].centerPencils.push(pencil)
          }
          puzzle.value[r][c].centerPencils.sort((a, b) => a.value - b.value)
        }
      }
    }
  }
  return {
    puzzle,
    seconds,
    success,
    generatePuzzle,
    isCellInvalid,
    clearColors,
    clearPuzzle,
    resetPuzzle,
    calculatePossibilities,
    undo,
    redo,
    resetSelected,
    clearSelected,
    setCellValue,
    pencilHighlight,
    highlightPencilNumbers,
    setCenterPencil,
    setCornerPencil,
    selectColor,
    selectNumber,
    solve,
    clearTimer,
    editPuzzle,
    solveNakedSingles,
    solveNakedPairs,
    solveNakedTriples,
    solveNakedQuads,
    solveHiddenSingles,
    solveHiddenPairs,
    solveHiddenTriples,
    solveHiddenQuads,
    solveRestricted,
    resetSolves,
    multipleSolutions,
  }
})
