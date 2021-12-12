import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { useSudokuStore } from '/@/stores/sudokuPuzzle'
export const useSudokuSettingsStore = defineStore('sudokuSettingsStore', () => {
  const settings = ref(false)
  const difficulty = ref('hard')
  const selectedGame = ref('')
  const levels = [
    { value: 'easy', text: 'Easy' },
    { value: 'medium', text: 'Medium' },
    { value: 'hard', text: 'Hard' },
    { value: 'very-hard', text: 'Very Hard' },
    { value: 'insane', text: 'Insane' },
    { value: 'inhuman', text: 'Inhuman' },
    { value: 'custom', text: 'Custom' },
  ]
  const savedGames = ref([])
  function saveGame(game) {}
  function loadGame(game) {}
  function deleteGame(game) {}
  const pairSelection = ref('')
  watch(pairSelection, (newValue, oldValue) => {
    if (newValue) {
      const puzzleStore = useSudokuStore()
      puzzleStore.calculatePossibilities()
    }
  })
  const showMistakes = ref(true)
  const showPossibleValues = ref(true)
  const showSolution = ref(false)

  const pairs = [
    { value: 'pairs', text: 'All' },
    { value: 'gridPairs', text: 'Grid' },
    { value: 'colPairs', text: 'Column' },
    { value: 'rowPairs', text: 'Row' },
    { value: 'cellPairs', text: 'Cell' },
  ]
  const colors = [
    '#555',
    '#777',
    '#773',
    '#573',
    '#373',
    '#375',
    '#377',
    '#357',
    '#337',
    '#737',
    '#735',
    '#733',
    '#753',
  ]
  return {
    settings,
    showMistakes,
    showPossibleValues,
    showSolution,
    difficulty,
    colors,
    pairSelection,
    pairs,
  }
})
