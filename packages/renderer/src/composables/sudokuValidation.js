import { computed, readonly, ref } from "vue";

export function useSudokuValidation(puzzleRef) {
  const puzzle = ref(puzzleRef);

  function isCellInvalid(row, col, value) {
    //this checks that the value specified in the cell does
    //not exist as the value for another cell in the
    //row column or subgrid
    //make sure we have a value to compare
    if (!value) {
      return true;
    }
    //make sure the puzzle is initialized
    if (puzzle.value?.length > 0) {
      //check the other cells in the row
      for (let c = 0; c < 9; c++) {
        if (puzzle.value[row][c].value == value && c != col) {
          return true;
        }
      }
      //check the other cells in the column
      for (let r = 0; r < 9; r++) {
        if (puzzle.value[r][col].value == value && r != row) {
          return true;
        }
      }
      //check the other cells in the subgrid
      let rowStart = Math.floor(row / 3) * 3;
      let colStart = Math.floor(col / 3) * 3;
      for (let r = rowStart; r < rowStart + 3; r++) {
        for (let c = colStart; c < colStart + 3; c++) {
          if (puzzle.value[r][c].value == value && !(r == row && c == col)) {
            return true;
          }
        }
      }
    }
    return false;
  }

  return {
    isCellInvalid,
  };
}
