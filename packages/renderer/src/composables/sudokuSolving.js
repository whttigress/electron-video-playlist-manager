import { computed, readonly, ref } from 'vue'
import { storeToRefs } from 'pinia'
import _ from 'lodash'
import { useSudokuStore } from '/@/stores/sudokuPuzzle'

export function useSudokuSolving(puzzleRef, historyRef, futureRef) {
  const settings = useSudokuStore()
  const puzzle = ref(puzzleRef)
  const history = ref(historyRef)
  const future = ref(futureRef)
  var workPuzzle = []
  /**
   * this is an object that has an array for the row, col and subgrid types
   * for each number 1-9
   *
   * the array tracks the number of possible positions that
   * a value can be in for that type
   * @type {{row: Number[], column: Number[], subgrid: Number[]}}
   */
  let possibleNumberPositions = {}

  /**
   * this is an array that is initialized for each number 1-9 needing
   * to be used 9 times in the sudoku grid
   * @type {Number[]}
   */
  let neededNumbers = _.range(9).map(function () {
    return 9
  })
  /**
   * Clears possibleNumberPositions object and resets the row, column and subgrid arrays to the initial 0 values
   */
  function initializePossibleNumberPositions() {
    possibleNumberPositions = {}
    possibleNumberPositions.row = _.range(9).map(function () {
      return _.range(9).map(function () {
        return 0
      })
    })
    possibleNumberPositions.col = _.range(9).map(function () {
      return _.range(9).map(function () {
        return 0
      })
    })
    possibleNumberPositions.grid = _.range(9).map(function () {
      return _.range(9).map(function () {
        return 0
      })
    })
    possibleNumberPositions.gridRow = _.range(9).map(function () {
      return _.range(9).map(function () {
        return _.range(9).map(function () {
          return 0
        })
      })
    })
    possibleNumberPositions.gridColumn = _.range(9).map(function () {
      return _.range(9).map(function () {
        return _.range(9).map(function () {
          return 0
        })
      })
    })
  }
  /**
   * Resets neededNumbers array back to it's initial values (9)
   */
  function resetNeededNumbers() {
    neededNumbers = _.range(9).map(function () {
      return 9
    })
  }

  /**
   * Resets the row, col and grid pairs and triple arrays/booleans within the cell
   * to false so that they can be recalculated
   * @param  {Number} r row index
   * @param  {Number} c column index
   */
  function resetPairsAndTriples(r, c) {
    workPuzzle[r][c].rowPair = false
    workPuzzle[r][c].colPair = false
    workPuzzle[r][c].gridPair = false
    workPuzzle[r][c].rowTriple = false
    workPuzzle[r][c].colTriple = false
    workPuzzle[r][c].gridTriple = false
    workPuzzle[r][c].rowQuad = false
    workPuzzle[r][c].colQuad = false
    workPuzzle[r][c].gridQuad = false
  }
  /**
   * Calculates the possibilities in the puzzle sudoku array
   */
  function calculatePossibilities() {
    workPuzzle = puzzle.value
    console.log('calculating possibilities')
    // initializePossibleNumberPositions()
    resetNeededNumbers()
    getInitialPossibilities()
    processPossibleValuesInGrid()
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        workPuzzle[r][c].numberComplete =
          workPuzzle[r][c].value &&
          neededNumbers[workPuzzle[r][c].value - 1] == 0
        workPuzzle[r][c].pairs = _.union(
          workPuzzle[r][c].rowPairs,
          workPuzzle[r][c].colPairs,
          workPuzzle[r][c].gridPairs,
          workPuzzle[r][c].cellPairs,
        )
      }
    }
    puzzle.value = workPuzzle
  }
  /**
   */
  function processPossibleValuesInGrid() {
    // console.log('processPossibleValuesInGrid')
    const {
      solveNakedSingles,
      solveNakedPairs,
      solveNakedTriples,
      solveNakedQuads,
      solveHiddenSingles,
      solveHiddenPairs,
      solveHiddenTriples,
      solveHiddenQuads,
      solveRestricted,
    } = storeToRefs(settings)
    let possibleValuesRemoved = false
    if (
      checkForNakedSinglesPairsAndTriples(
        solveNakedSingles.value,
        solveNakedPairs.value,
        solveNakedTriples.value,
        solveNakedQuads.value,
      )
    ) {
      possibleValuesRemoved = true
    }
    if (
      checkForHiddenSinglesPairsAndRestrictedValues(
        solveHiddenSingles.value,
        solveHiddenPairs.value,
        solveHiddenTriples.value,
        solveHiddenQuads.value,
        solveRestricted.value,
      )
    ) {
      possibleValuesRemoved = true
    }
    if (possibleValuesRemoved) {
      processPossibleValuesInGrid()
    }
  }
  /**
   * looks for naked singles, pairs and triples
   */
  function checkForNakedSinglesPairsAndTriples(singles, pairs, triples, quads) {
    console.log('naked', { singles, pairs, triples, quads })
    let possibleValuesRemoved = false
    if ((singles || pairs) && findNakedSinglesAndNakedPairs(singles, pairs)) {
      console.log('naked singles and pairs removed possible values')
      possibleValuesRemoved = true
    }
    if (triples && findNakedTriples()) {
      console.log('naked triples removed possible values')
      possibleValuesRemoved = true
    }
    if (quads && findNakedQuads()) {
      console.log('naked quads removed possible values')
      possibleValuesRemoved = true
    }
    return possibleValuesRemoved
  }

  /**
   * - For each cell in the grid, we clear the pair and triple arrays.
   * - we create a nonPossibilities object and for each already set value within the column
   * row or grid we set the a property in the nonPossibilities of that value to true
   * - Based on these nonPossibilities we set the possibleValues and the rawPossibleValues for the cell
   * - if the cell has a value we subtract one from the appropriate index in the neededNumbers array.
   */
  function getInitialPossibilities() {
    console.log('get initial possibilities')
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (workPuzzle?.[r]?.[c] && !workPuzzle?.[r][c].value) {
          resetPairsAndTriples(r, c)

          var nonPossibilities = {}
          for (let i = 0; i < 9; i++) {
            if (workPuzzle[r][i].value) {
              nonPossibilities[workPuzzle[r][i].value] = true
            }
            if (workPuzzle[i][c].value) {
              nonPossibilities[workPuzzle[i][c].value] = true
            }
          }
          let rowStart = Math.floor(r / 3) * 3
          let colStart = Math.floor(c / 3) * 3
          for (let gr = rowStart; gr < rowStart + 3; gr++) {
            for (let gc = colStart; gc < colStart + 3; gc++) {
              if (workPuzzle?.[gr]?.[gc]?.value) {
                nonPossibilities[workPuzzle[gr][gc].value] = true
              }
            }
          }
          let takenNumbers = Object.keys(nonPossibilities)
          // console.log({ takenNumbers, nonPossibilities });
          workPuzzle[r][c].possibleValues = []
          workPuzzle[r][c].rawPossibleValues = []
          for (var i = 1; i < 10; i++) {
            if (takenNumbers.indexOf(String(i)) < 0) {
              workPuzzle[r][c].rawPossibleValues.push(i)
              workPuzzle[r][c].possibleValues.push(i)
            }
          }
        } else if (workPuzzle?.[r]?.[c]?.value) {
          //the value is set, so we need one less of that number
          neededNumbers[workPuzzle?.[r][c].value - 1]--
        }
      }
    }
    console.log('initial possibilities calculated')
  }

  /**
   *goes through each cell in the puzzle and checks cell for naked singles and pairs
   * @return {Boolean} returns true if possible values were removed
   */
  function findNakedSinglesAndNakedPairs(singles, pairs) {
    console.log('findNakedSinglesAndNakedPairs')
    var valuesRemoved = false
    //for each row
    for (let r = 0; r < 9; r++) {
      //for each column
      for (let c = 0; c < 9; c++) {
        if (checkCellForNakedSinglesAndNakedPairs(r, c, singles, pairs)) {
          valuesRemoved = true
        }
      }
    }
    return valuesRemoved
  }

  /**
   * checks possible values for a single value or pair of possible values
   * if there is a pair we check for other cells in the row, column, and grid
   * for another cell limited to the same possible values
   * if we find a match we remove the possibility from other cells in that row column or grid
   * @param  {Number} r row index
   * @param  {Number} c column index
   * @return {Boolean} returns true if the check removed possible values
   */
  function checkCellForNakedSinglesAndNakedPairs(r, c, singles, pairs) {
    var valuesRemoved = false
    //possible values for that cell
    let selected = workPuzzle[r][c]
    if (
      singles &&
      !selected.value &&
      selected.possibleValues &&
      selected.possibleValues.length == 1
    ) {
      if (removeValueOfSingleFromSeenCells(r, c)) {
        valuesRemoved = true
      }
    }
    if (
      pairs &&
      !selected.value &&
      selected.possibleValues &&
      selected.possibleValues.length == 2
    ) {
      // we have a naked pair and need to check for other cells in the col/row/grid that only contain these values
      // go through row/column
      if (!selected.rowPair) {
        for (let n = 0; n < 9; n++) {
          //check for another cell in the row that only contains possibleValues in our cell
          //row
          if (c != n) {
            if (cellsHaveMatchingNakedPair('row', r, c, r, n)) {
              for (let x = 0; x < 9; x++) {
                //skip our selcted and our matching cell
                if (x != c && x != n) {
                  if (removeMatchingValuesFromExcludedCell(r, c, r, x)) {
                    valuesRemoved = true
                  }
                }
              }
            }
          }
        }
      }
      if (!selected.colPair) {
        for (let n = 0; n < 9; n++) {
          //cell
          if (r != n) {
            if (cellsHaveMatchingNakedPair('col', r, c, n, c)) {
              for (let x = 0; x < 9; x++) {
                //skip our selcted and our matching cell
                if (x != r && x != n) {
                  if (removeMatchingValuesFromExcludedCell(r, c, x, c)) {
                    valuesRemoved = true
                  }
                }
              }
            }
          }
        }
      }
      if (!selected.gridPair) {
        //go through grid
        let rowStart = Math.floor(r / 3) * 3
        let colStart = Math.floor(c / 3) * 3
        for (let rn = rowStart; rn < rowStart + 3; rn++) {
          for (let cn = colStart; cn < colStart + 3; cn++) {
            if (!(r == rn && c == cn)) {
              if (cellsHaveMatchingNakedPair('grid', r, c, rn, cn)) {
                for (let rx = rowStart; rx < rowStart + 3; rx++) {
                  for (let cx = colStart; cx < colStart + 3; cx++) {
                    //skip our selcted and our matching cell
                    if (!(rx == r && cx == c) && !(rx == rn && cx == cn)) {
                      if (removeMatchingValuesFromExcludedCell(r, c, rx, cx)) {
                        valuesRemoved = true
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
    return valuesRemoved
  }

  /**
   * compare two cells to see if they have a matching pair of possible values
   * @param  {String} type type of comparison (row, col, or grid)
   * @param  {Number} r first cell row index
   * @param  {Number} c first cell column index
   * @param  {Number} rn comparison cell row index
   * @param  {Number} cn comparison cell column index
   * @return {Boolean} returns true if the cells are a pair
   */
  function cellsHaveMatchingNakedPair(type, r, c, rn, cn) {
    let selected = workPuzzle[r][c]
    let compare = workPuzzle[rn][cn]
    if (
      !(r == rn && c == cn) &&
      !compare.value &&
      !selected[`${type}Pair`] &&
      !compare[`${type}Pair`] &&
      compare.possibleValues &&
      compare.possibleValues.length > 0
    ) {
      if (
        compare.possibleValues.filter(
          (x) => !selected.possibleValues.includes(x),
        ).length == 0
      ) {
        selected[`${type}Pair`] = true
        compare[`${type}Pair`] = true
        return true
      } else {
        return false
      }
    } else {
      return false
    }
  }

  /**
   * for each cell in the grid we check the cell to see if it is part of a
   * triple (checkCellForTriple)
   * @return {Boolean} returns true if possible values were removed
   */
  function findNakedTriples() {
    console.log('findNakedTriples')
    var possibleValuesRemoved = false
    //for each row
    for (let r = 0; r < 9; r++) {
      //for each column
      for (let c = 0; c < 9; c++) {
        //possible values for that cell
        if (checkCellForNakedTriples(r, c)) {
          possibleValuesRemoved = true
        }
      }
    }
    return possibleValuesRemoved
  }

  /**
   * if this cell has two or three possibleValues we check the other cells in the row column or grid
   * to see if any of them have possible values that would be a possible triple
   * if so we check the rest of the values in that row column or grid to see if there is indeed a triple
   * if so we remove those possible values from the other cells in the row column or grid
   * @param  {Number} r row index
   * @param  {Number} c column index
   * @return {Boolean} returns true if possible values were removed
   */
  function checkCellForNakedTriples(r, c) {
    var possibleValuesRemoved = false
    let selected = workPuzzle[r][c]
    let subgrid = Math.floor(r / 3) * 3 + Math.floor(c / 3)
    var openCellsInGrid = openCellsInHouse('grid', subgrid)
    var openCellsInRow = openCellsInHouse('row', r)
    var openCellsInCol = openCellsInHouse('col', c)
    if (
      !selected.value &&
      selected.possibleValues &&
      selected.possibleValues.length <= 3 &&
      selected.possibleValues.length > 1
    ) {
      // we have a possible triple
      //rowCheck
      //we make sure it isn't part of a pair or triple already

      // pick two cells and do union on possible values check if length == 3
      if (openCellsInRow > 5 && !selected.rowPair && !selected.rowTriple) {
        for (let u = 0; u < 9; u++) {
          if (c != u) {
            let poss = cellsContainPossibleNakedTripleForHouse(
              'row',
              r,
              c,
              r,
              u,
            )
            if (poss) {
              for (let n = 0; n < 9; n++) {
                if (n != c && n != u) {
                  if (
                    cellsContainNakedTripleForHouse('row', r, c, r, u, r, n)
                  ) {
                    for (let x = 0; x < 9; x++) {
                      if (x != c && x != n && x != u) {
                        if (
                          removeTripleMatchesFromOtherCells(
                            r,
                            c,
                            r,
                            u,
                            r,
                            n,
                            r,
                            x,
                          )
                        ) {
                          possibleValuesRemoved = true
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
      if (openCellsInCol > 5 && !selected.colPair && !selected.colTriple) {
        for (let u = 0; u < 9; u++) {
          if (r != u) {
            let poss = cellsContainPossibleNakedTripleForHouse(
              'col',
              r,
              c,
              u,
              c,
            )
            if (poss) {
              for (let n = 0; n < 9; n++) {
                if (n != r && n != u) {
                  if (
                    cellsContainNakedTripleForHouse('col', r, c, u, c, n, c)
                  ) {
                    for (let x = 0; x < 9; x++) {
                      if (x != r && x != n && x != u) {
                        if (
                          removeTripleMatchesFromOtherCells(
                            r,
                            c,
                            u,
                            c,
                            n,
                            c,
                            x,
                            c,
                          )
                        ) {
                          possibleValuesRemoved = true
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
      if (openCellsInGrid > 5 && !selected.gridPair && !selected.gridTriple) {
        //go through grid
        let rowStart = Math.floor(r / 3) * 3
        let colStart = Math.floor(c / 3) * 3
        for (let ru = rowStart; ru < rowStart + 3; ru++) {
          for (let cu = colStart; cu < colStart + 3; cu++) {
            if (!(r == ru && c == cu)) {
              //check union
              let poss = cellsContainPossibleNakedTripleForHouse(
                'grid',
                r,
                c,
                ru,
                cu,
              )
              if (poss) {
                for (let rn = rowStart; rn < rowStart + 3; rn++) {
                  for (let cn = colStart; cn < colStart + 3; cn++) {
                    if (
                      !(r == rn && c == cn) &&
                      !(r == ru && c == cu) &&
                      !(ru == rn && cu == cn)
                    ) {
                      //check match
                      if (
                        cellsContainNakedTripleForHouse(
                          'grid',
                          r,
                          c,
                          ru,
                          cu,
                          rn,
                          cn,
                        )
                      ) {
                        for (let rx = rowStart; rx < rowStart + 3; rx++) {
                          for (let cx = colStart; cx < colStart + 3; cx++) {
                            if (
                              !(rx == r && cx == c) &&
                              !(rx == rn && cx == cn) &&
                              !(rx == ru && cx == cu)
                            ) {
                              if (
                                removeTripleMatchesFromOtherCells(
                                  r,
                                  c,
                                  ru,
                                  cu,
                                  rn,
                                  cn,
                                  rx,
                                  cx,
                                )
                              ) {
                                possibleValuesRemoved = true
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
    return possibleValuesRemoved
  }

  /**
   * Combines the possible values for two cells that have possible values and
   * returns the union of possible values if there are 3 or less possible values
   * and the cells are not already part of a pair or triple of the given type
   * @param  {String} type type of comparison (row, col, or grid)
   * @param  {Number} r selected row index
   * @param  {Number} c selected column index
   * @param  {Number} ru union row index
   * @param  {Number} cu union column index
   * @returns {Number[]|Boolean} returns either a union of the possible values from two cells or false if they can not be part of a tripple
   */
  function cellsContainPossibleNakedTripleForHouse(type, r, c, ru, cu) {
    let select1 = workPuzzle[r][c]
    let select2 = workPuzzle[ru][cu]
    if (
      !(r == ru && c == cu) &&
      !select1.value &&
      !select2.value &&
      select1.possibleValues &&
      select1.possibleValues.length > 0 &&
      select2.possibleValues &&
      select2.possibleValues.length > 0 &&
      !select1[`${type}Pair`] &&
      !select2[`${type}Pair`] &&
      !select1[`${type}Triple`] &&
      !select2[`${type}Triple`]
    ) {
      var union = [
        ...new Set([...select1.possibleValues, ...select2.possibleValues]),
      ]
      if (union.length <= 3 && union.length > 0) {
        return union
      } else {
        return false
      }
    } else {
      return false
    }
  }
  /**
   * Combines the possible values for two cells that have possible values and
   * returns the union of possible values if there are 4 or less possible values
   * and the cells are not already part of a pair or triple or quad of the given type
   * @param  {String} type type of comparison (row, col, or grid)
   * @param  {Number} r selected row index
   * @param  {Number} c selected column index
   * @param  {Number} ru union row index
   * @param  {Number} cu union column index
   * @returns {Number[]|Boolean} returns either a union of the possible values from
   * two cells or false if they can not be part of a quad
   */
  function twoCellsContainPossibleNakedQuadForHouse(type, r, c, ru, cu) {
    if (r == ru && c == cu) {
      return false
    }
    let select1 = workPuzzle[r][c]
    let select2 = workPuzzle[ru][cu]
    if (
      !select1.value &&
      !select2.value &&
      select1.possibleValues &&
      select1.possibleValues.length > 0 &&
      select2.possibleValues &&
      select2.possibleValues.length > 0 &&
      !select1[`${type}Pair`] &&
      !select2[`${type}Pair`] &&
      !select1[`${type}Triple`] &&
      !select2[`${type}Triple`] &&
      !select1[`${type}Quad`] &&
      !select2[`${type}Quad`]
    ) {
      var union = [
        ...new Set([...select1.possibleValues, ...select2.possibleValues]),
      ]
      if (union.length <= 4 && union.length > 0) {
        return union
      } else {
        return false
      }
    } else {
      return false
    }
  }
  /**
   * Combines the possible values for two cells that have possible values and
   * returns the union of possible values if there are 4 or less possible values
   * and the cells are not already part of a pair or triple or quad of the given type
   * @param  {String} type type of comparison (row, col, or grid)
   * @param  {Number} r selected row index
   * @param  {Number} c selected column index
   * @param  {Number} ru union row index
   * @param  {Number} cu union column index
   * @param  {Number} rt union row index
   * @param  {Number} ct union column index
   * @returns {Number[]|Boolean} returns either a union of the possible values from
   * two cells or false if they can not be part of a quad
   */
  function threeCellsContainPossibleNakedQuadForHouse(
    type,
    r,
    c,
    ru,
    cu,
    rt,
    ct,
  ) {
    if (
      (r == ru && c == cu) ||
      (r == rt && c == ct) ||
      (ru == rt && cu == ct)
    ) {
      return false
    }
    let select1 = workPuzzle[r][c]
    let select2 = workPuzzle[ru][cu]
    let select3 = workPuzzle[rt][ct]
    if (
      !(r == ru && c == cu) &&
      !select1.value &&
      !select2.value &&
      !select3.value &&
      select1.possibleValues &&
      select1.possibleValues.length > 0 &&
      select2.possibleValues &&
      select2.possibleValues.length > 0 &&
      select3.possibleValues &&
      select3.possibleValues.length > 0 &&
      !select1[`${type}Pair`] &&
      !select2[`${type}Pair`] &&
      !select3[`${type}Pair`] &&
      !select1[`${type}Triple`] &&
      !select2[`${type}Triple`] &&
      !select3[`${type}Triple`] &&
      !select1[`${type}Quad`] &&
      !select2[`${type}Quad`] &&
      !select3[`${type}Quad`]
    ) {
      var union = [
        ...new Set([
          ...select1.possibleValues,
          ...select2.possibleValues,
          ...select3.possibleValues,
        ]),
      ]
      if (union.length <= 4 && union.length > 0) {
        return union
      } else {
        return false
      }
    } else {
      return false
    }
  }
  /**
   * if the three cells contain possible values and are not part of pairs or triples already
   * and if the comparison cell does not contain possible values that are not in the union of the
   * possile values of the first two cells we mark them as a triple and return true
   * @param  {String} type type of comparison (row, col, or grid)
   * @param  {Number} r first cell row index
   * @param  {Number} c first cell column index
   * @param  {Number} ru union cell row index
   * @param  {Number} cu union cell column index
   * @param  {Number} rn comparison cell row index
   * @param  {Number} cn comparison cell column index
   * @return {Boolean} returns true if the cells contain a triple
   */
  function cellsContainNakedTripleForHouse(type, r, c, ru, cu, rn, cn) {
    let select1 = workPuzzle[r][c]
    let select2 = workPuzzle[ru][cu]
    let compare = workPuzzle[rn][cn]
    if (
      !(r == rn && c == cn) &&
      !(r == ru && c == cu) &&
      !(ru == rn && cu == cn) &&
      !select1.value &&
      !select2.value &&
      !compare.value &&
      select1.possibleValues &&
      select1.possibleValues.length > 0 &&
      select2.possibleValues &&
      select2.possibleValues.length > 0 &&
      compare.possibleValues &&
      compare.possibleValues.length > 0 &&
      !select1[`${type}Pair`] &&
      !select2[`${type}Pair`] &&
      !compare[`${type}Pair`] &&
      !select1[`${type}Triple`] &&
      !select2[`${type}Triple`] &&
      !compare[`${type}Triple`]
    ) {
      var union = [
        ...new Set([...select1.possibleValues, ...select2.possibleValues]),
      ]
      if (
        compare.possibleValues.filter((x) => !union.includes(x)).length == 0
      ) {
        select1[`${type}Triple`] = true
        select2[`${type}Triple`] = true
        compare[`${type}Triple`] = true
        return true
      } else {
        return false
      }
    } else {
      return false
    }
  }

  /**
   * if the four cells contain possible values and are not part of pairs or triples or quads already
   * and if the comparison cell does not contain possible values that are not in the union of the
   * possile values of the first three cells we mark them as a quad and return true
   * @param  {String} type type of comparison (row, col, or grid)
   * @param  {Number} r first cell row index
   * @param  {Number} c first cell column index
   * @param  {Number} ru union cell row index
   * @param  {Number} cu union cell column index
   * @param  {Number} rn comparison cell row index
   * @param  {Number} cn comparison cell column index
   * @param  {Number} rq comparison cell row index
   * @param  {Number} cq comparison cell column index
   * @return {Boolean} returns true if the cells contain a triple
   */
  function cellsContainNakedQuadForHouse(type, r, c, ru, cu, rn, cn, rq, cq) {
    if (
      (r == ru && c == cu) ||
      (r == rn && c == cn) ||
      (r == rq && c == cq) ||
      (ru == rn && cu == cn) ||
      ru == rq ||
      cu == cq ||
      (rn == rq && cn == cq)
    ) {
      return false
    }
    let select1 = workPuzzle[r][c]
    let select2 = workPuzzle[ru][cu]
    let select3 = workPuzzle[rn][cn]
    let compare = workPuzzle[rq][cq]
    if (
      !select1.value &&
      !select2.value &&
      !select3.value &&
      !compare.value &&
      select1.possibleValues &&
      select1.possibleValues.length > 0 &&
      select2.possibleValues &&
      select2.possibleValues.length > 0 &&
      select3.possibleValues &&
      select3.possibleValues.length > 0 &&
      compare.possibleValues &&
      compare.possibleValues.length > 0 &&
      !select1[`${type}Pair`] &&
      !select2[`${type}Pair`] &&
      !select3[`${type}Pair`] &&
      !compare[`${type}Pair`] &&
      !select1[`${type}Triple`] &&
      !select2[`${type}Triple`] &&
      !select3[`${type}Triple`] &&
      !compare[`${type}Triple`] &&
      !select1[`${type}Quad`] &&
      !select2[`${type}Quad`] &&
      !select3[`${type}Quad`] &&
      !compare[`${type}Quad`]
    ) {
      var union = [
        ...new Set([
          ...select1.possibleValues,
          ...select2.possibleValues,
          ...select3.possibleValues,
        ]),
      ]
      if (
        compare.possibleValues.filter((x) => !union.includes(x)).length == 0
      ) {
        select1[`${type}Quad`] = true
        select2[`${type}Quad`] = true
        select3[`${type}Quad`] = true
        compare[`${type}Quad`] = true
        return true
      } else {
        return false
      }
    } else {
      return false
    }
  }
  /**
   * after making sure the exclusion cell does not match one of the cells in the quad
   * we make sure the exclusion doesn't have a value, and does have possible values
   * we get the union of the first four cells, and for each possible value in the union
   * we check for matches in the exclusion cell.  If we find a match we remove it as a
   * possible value from the exclusion cell.  If we removed possibilities we return true
   * @param  {String} type type of comparison (row, col, or grid)
   * @param  {Number} r first cell row index
   * @param  {Number} c first cell column index
   * @param  {Number} ru second cell row index
   * @param  {Number} cu second cell column index
   * @param  {Number} rn third cell row index
   * @param  {Number} cn third cell column index
   * @param  {Number} rt third cell row index
   * @param  {Number} console.table(object); third cell column index
   * @param  {Number} rx exclusion cell row index
   * @param  {Number} cx exclusion cell column index
   * @param {Boolean} returns true if possible values were removed
   */
  function removeQuadMatchesFromOtherCells(
    r,
    c,
    ru,
    cu,
    rn,
    cn,
    rt,
    ct,
    rx,
    cx,
  ) {
    if (
      (rx == r && cx == c) ||
      (rx == ru && cx == cu) ||
      (rx == rn && cx == cn) ||
      (rx == rt && cx == ct)
    ) {
      return false
    }
    var possibleValuesRemoved = false
    let select1 = workPuzzle[r][c]
    let select2 = workPuzzle[ru][cu]
    let select3 = workPuzzle[rn][cn]
    let select4 = workPuzzle[rt][ct]
    let exclusion = workPuzzle[rx][cx]
    if (
      !exclusion.value &&
      exclusion.possibleValues &&
      exclusion.possibleValues.length > 0
    ) {
      var union = [
        ...new Set([
          ...select1.possibleValues,
          ...select2.possibleValues,
          ...select3.possibleValues,
          ...select4.possibleValues,
        ]),
      ]
      var removed = []
      for (let i = 0; i < union.length; i++) {
        let v = union[i]
        if (removePossibleValueFromCell(rx, cx, v)) {
          removed.push(v)
        }
      }
      if (removed.length > 0) {
        possibleValuesRemoved = true
      }
    }
    return possibleValuesRemoved
  }
  /**
   * for each cell in the grid we check the cell to see if it is part of a
   * quad (checkCellForQuad)
   * @return {Boolean} returns true if possible values were removed
   */
  function findNakedQuads() {
    console.log('findNakedQuads')
    var possibleValuesRemoved = false
    //for each row
    for (let r = 0; r < 9; r++) {
      //for each column
      for (let c = 0; c < 9; c++) {
        //possible values for that cell
        if (checkCellForNakedQuads(r, c)) {
          possibleValuesRemoved = true
        }
      }
    }
    return possibleValuesRemoved
  }
  /**
   * if this cell has > 1 <=4 possibleValues we check the other cells in the row column or grid
   * to see if any of them have possible values that would be a possible quad
   * if so we check the rest of the values in that row column or grid to see if there is indeed a quad
   * if so we remove those possible values from the other cells in the row column or grid
   * @param  {Number} r row index
   * @param  {Number} c column index
   * @return {Boolean} returns true if possible values were removed
   */
  function checkCellForNakedQuads(r, c) {
    var possibleValuesRemoved = false
    let selected = workPuzzle[r][c]
    let subgrid = Math.floor(r / 3) * 3 + Math.floor(c / 3)
    var openCellsInGrid = openCellsInHouse('grid', subgrid)
    var openCellsInRow = openCellsInHouse('row', r)
    var openCellsInCol = openCellsInHouse('col', c)
    if (
      !selected.value &&
      selected.possibleValues &&
      selected.possibleValues.length <= 4 &&
      selected.possibleValues.length > 1
    ) {
      if (
        openCellsInRow > 6 &&
        !selected.rowPair &&
        !selected.rowTriple &&
        !selected.rowQuad
      ) {
        for (let n = 0; n < 9; n++) {
          if (c == n) {
            continue
          }
          let poss = twoCellsContainPossibleNakedQuadForHouse('row', r, c, r, n)
          if (poss) {
            for (let t = 0; t < 9; t++) {
              if (c == t || n == t) {
                continue
              }
              let poss3 = threeCellsContainPossibleNakedQuadForHouse(
                'row',
                r,
                c,
                r,
                n,
                r,
                t,
              )
              if (poss3) {
                for (let q = 0; q < 9; q++) {
                  if (c == q || n == q || t == q) {
                    continue
                  }
                  if (
                    cellsContainNakedQuadForHouse('row', r, c, r, n, r, t, r, q)
                  ) {
                    for (let x = 0; x < 9; x++) {
                      if (x == c || x == n || x == t || x == q) {
                        continue
                      }
                      if (
                        removeQuadMatchesFromOtherCells(
                          r,
                          c,
                          r,
                          n,
                          r,
                          t,
                          r,
                          q,
                          r,
                          x,
                        )
                      ) {
                        possibleValuesRemoved = true
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
      if (
        openCellsInCol > 6 &&
        !selected.colPair &&
        !selected.colTriple &&
        !selected.colQuad
      ) {
        for (let n = 0; n < 9; n++) {
          if (r == n) {
            continue
          }
          let poss = twoCellsContainPossibleNakedQuadForHouse('col', r, c, n, c)
          if (poss) {
            for (let t = 0; t < 9; t++) {
              if (r == t || n == t) {
                continue
              }
              let poss3 = threeCellsContainPossibleNakedQuadForHouse(
                'col',
                r,
                c,
                n,
                c,
                t,
                c,
              )
              if (poss3) {
                for (let q = 0; q < 9; q++) {
                  if (c == q || n == q || t == q) {
                    continue
                  }
                  if (
                    cellsContainNakedQuadForHouse('col', r, c, n, c, t, c, q, c)
                  ) {
                    for (let x = 0; x < 9; x++) {
                      if (x == c || x == n || x == t || x == q) {
                        continue
                      }
                      if (
                        removeQuadMatchesFromOtherCells(
                          r,
                          c,
                          u,
                          c,
                          n,
                          c,
                          t,
                          c,
                          x,
                          c,
                        )
                      ) {
                        possibleValuesRemoved = true
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
      //grid
      if (
        openCellsInGrid > 6 &&
        !selected.gridPair &&
        !selected.gridTriple &&
        !selected.gridQuad
      ) {
        //go through grid
        let rowStart = Math.floor(r / 3) * 3
        let colStart = Math.floor(c / 3) * 3
        for (let ru = rowStart; ru < rowStart + 3; ru++) {
          for (let cu = colStart; cu < colStart + 3; cu++) {
            if (r == ru && c == cu) {
              continue
            }
            let poss = twoCellsContainPossibleNakedQuadForHouse(
              'grid',
              r,
              c,
              ru,
              cu,
            )
            if (!poss) {
              continue
            }
            for (let rn = rowStart; rn < rowStart + 3; rn++) {
              for (let cn = colStart; cn < colStart + 3; cn++) {
                if ((r == rn && c == cn) || (ru == rn && cu == cn)) {
                  continue
                }
                let poss3 = threeCellsContainPossibleNakedQuadForHouse(
                  'col',
                  r,
                  c,
                  ru,
                  cu,
                  rn,
                  cn,
                )
                if (!poss3) {
                  continue
                }
                for (let rq = rowStart; rq < rowStart + 3; rq++) {
                  for (let cq = colStart; cq < colStart + 3; cq++) {
                    if (
                      (r == rq && c == cq) ||
                      (ru == rq && cu == cq) ||
                      (rn == rq && cn == cq)
                    ) {
                      continue
                    }
                    if (
                      cellsContainNakedQuadForHouse(
                        'col',
                        r,
                        c,
                        ru,
                        cu,
                        rn,
                        cn,
                        rq,
                        cq,
                      )
                    ) {
                      for (let rx = rowStart; rx < rowStart + 3; rx++) {
                        for (let cx = colStart; cx < colStart + 3; cx++) {
                          if (
                            (r == rx && c == cx) ||
                            (ru == rx && cu == cx) ||
                            (rn == rx && cn == cx) ||
                            (rq == rx && cq == cx)
                          ) {
                            continue
                          }
                          if (
                            removeQuadMatchesFromOtherCells(
                              r,
                              c,
                              ru,
                              cu,
                              rn,
                              cn,
                              rq,
                              cq,
                              rx,
                              cx,
                            )
                          ) {
                            possibleValuesRemoved = true
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }

  /**
   * resets the possibleNumbers and looks for pairs and hidden pairs
   * @return {Boolean} returns true if possible values were removed
   */
  function checkForHiddenSinglesPairsAndRestrictedValues(
    singles,
    pairs,
    triples,
    quads,
    restricted,
  ) {
    console.log('hidden and restricted', {
      singles,
      pairs,
      triples,
      quads,
      restricted,
    })
    if (!singles && !pairs && !triples && !quads && !restricted) {
      return false
    }
    initializePossibleNumberPositions()
    setPossibleNumberPositions()
    var possibleValuesRemoved = false
    if (markHiddenValuesAndFindHiddenSingles(singles)) {
      possibleValuesRemoved = true
    }
    if (
      (pairs || triples || quads) &&
      checkForHiddenPairsTriplesAndQuads(pairs, triples, quads)
    ) {
      possibleValuesRemoved = true
    }
    if (restricted && findValuesLimitedToACellOrRowWithinASubgrid()) {
      possibleValuesRemoved = true
    }
    return possibleValuesRemoved
  }

  /**
   * goes through each cell in the puzzle and looks for pairs (getCellPair)
   */
  function setPossibleNumberPositions() {
    console.log('setPossibleNumberPositions')
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        setPossibleNumberPositionsForCell(r, c)
      }
    }
  }
  /**
   * checks selected cell possibleValues to see if it is limited to a pair
   * - if so add number to cellPairs array
   * - if possibleValue for cell matches number increase the number in the
   * possibleNumbers object
   * @param  {Number} r row index
   * @param  {Number} c column index
   */
  function setPossibleNumberPositionsForCell(r, c) {
    var selected = workPuzzle[r][c]
    clearPairs(r, c)
    //if cell does not have a selected value
    if (!selected.value) {
      // get subgrid number for cell
      let subgrid = Math.floor(r / 3) * 3 + Math.floor(c / 3)
      //for each number 1 - 9
      for (var i = 1; i < 10; i++) {
        //if that number is a possibility for the cell
        if (selected.possibleValues.includes(i)) {
          //and the cell has 2 or less possible values
          if (selected.possibleValues.length <= 2) {
            //add number to cellPair array
            selected.cellPairs.push(i)
          }
          //increment the number of cells the number could possibly be in
          possibleNumberPositions.row[r][i - 1] += 1
          possibleNumberPositions.col[c][i - 1] += 1
          possibleNumberPositions.grid[subgrid][i - 1] += 1
          possibleNumberPositions.gridRow[subgrid][r][i - 1] += 1
          possibleNumberPositions.gridColumn[subgrid][c][i - 1] += 1
        }
      }
    }
  }

  /**
   * clears the pairs for each type (cell, row, col, and grid)
   * @param  {Number} r row index
   * @param  {Number} c column index
   */
  function clearPairs(r, c) {
    var selected = workPuzzle[r][c]
    selected.cellPairs = []
    selected.rowPairs = []
    selected.colPairs = []
    selected.gridPairs = []
    selected.rowTriples = []
    selected.colTriples = []
    selected.gridTriples = []
    selected.rowQuads = []
    selected.colQuads = []
    selected.gridQuads = []
  }

  /**
   * for each row, column, and subgrid we check the possible number positions to see if
   * there is a number that has 1 or 2 posible positions we either remove other possible values
   * if this is the only spot the number can be in, or if there are two places we add it to
   * the pair type array (rowPairs, colPairs, gridPairs)
   * then we check for hidden matches
   * @return {Boolean} returns true if possible values were removed
   */
  function markHiddenValuesAndFindHiddenSingles(singles) {
    console.log('markHiddenValuesAndFindHiddenSingles')
    var possibleValuesRemoved = false
    //go through to find hidden pairs
    for (let r = 0; r < 9; r++) {
      for (let n = 0; n < 9; n++) {
        //rows
        if (possibleNumberPositions.row[r][n] > 0) {
          if (possibleNumberPositions.row[r][n] <= 4) {
            for (let i = 0; i < 9; i++) {
              if (
                workPuzzle[r][i].value == null &&
                workPuzzle[r][i].possibleValues.includes(n + 1)
              ) {
                if (
                  possibleNumberPositions.row[r][n] == 1 &&
                  workPuzzle[r][i].possibleValues.length > 1
                ) {
                  // there is only one possble spot and this is it
                  if (singles && removeExcessValues(r, i, [n + 1])) {
                    possibleValuesRemoved = true
                  }
                }
                if (
                  possibleNumberPositions.row[r][n] <= 2 &&
                  !workPuzzle[r][i].rowPairs.includes(n + 1)
                ) {
                  workPuzzle[r][i].rowPairs.push(n + 1)
                }

                if (
                  possibleNumberPositions.row[r][n] <= 3 &&
                  !workPuzzle[r][i].rowTriples.includes(n + 1)
                ) {
                  workPuzzle[r][i].rowTriples.push(n + 1)
                }
                if (
                  possibleNumberPositions.row[r][n] <= 4 &&
                  !workPuzzle[r][i].rowQuads.includes(n + 1)
                ) {
                  workPuzzle[r][i].rowQuads.push(n + 1)
                }
                // console.log({
                //   r,
                //   c: i,
                //   n: n + 1,
                //   cell: workPuzzle[r][i],
                //   value: workPuzzle[r][i].value,
                //   possibilities: possibleNumberPositions.row[r][n],
                // });
              }
            }
          }
        }
        //columns
        if (possibleNumberPositions.col[r][n] > 0) {
          if (possibleNumberPositions.col[r][n] <= 4) {
            for (let i = 0; i < 9; i++) {
              if (
                workPuzzle[i][r].value == null &&
                workPuzzle[i][r].possibleValues.includes(n + 1)
              ) {
                if (
                  possibleNumberPositions.col[r][n] == 1 &&
                  workPuzzle[i][r].possibleValues.length > 1
                ) {
                  // there is only one possble spot and this is it
                  if (singles && removeExcessValues(i, r, [n + 1])) {
                    possibleValuesRemoved = true
                  }
                }
                if (
                  possibleNumberPositions.col[r][n] <= 2 &&
                  !workPuzzle[i][r].colPairs.includes(n + 1)
                ) {
                  workPuzzle[i][r].colPairs.push(n + 1)
                }
                if (
                  possibleNumberPositions.col[r][n] <= 3 &&
                  !workPuzzle[i][r].colTriples.includes(n + 1)
                ) {
                  workPuzzle[i][r].colTriples.push(n + 1)
                }
                if (
                  possibleNumberPositions.col[r][n] <= 4 &&
                  !workPuzzle[i][r].colQuads.includes(n + 1)
                ) {
                  workPuzzle[i][r].colQuads.push(n + 1)
                }
              }
            }
          }
        }
        // grid
        if (possibleNumberPositions.grid[r][n] > 0) {
          if (possibleNumberPositions.grid[r][n] <= 4) {
            let colStart = Math.floor(r % 3) * 3
            let rowStart = Math.floor(r / 3) * 3
            for (let rn = rowStart; rn < rowStart + 3; rn++) {
              for (let cn = colStart; cn < colStart + 3; cn++) {
                if (
                  workPuzzle[rn][cn].value == null &&
                  workPuzzle[rn][cn].possibleValues.includes(n + 1)
                ) {
                  if (
                    possibleNumberPositions.grid[r][n] == 1 &&
                    workPuzzle[rn][cn].possibleValues.length > 1
                  ) {
                    // there is only one possble spot and this is it
                    if (singles && removeExcessValues(rn, cn, [n + 1])) {
                      possibleValuesRemoved = true
                    }
                  }
                  if (
                    possibleNumberPositions.grid[r][n] <= 2 &&
                    !workPuzzle[rn][cn].gridPairs.includes(n + 1)
                  ) {
                    workPuzzle[rn][cn].gridPairs.push(n + 1)
                  }
                  if (
                    possibleNumberPositions.grid[r][n] <= 3 &&
                    !workPuzzle[rn][cn].gridTriples.includes(n + 1)
                  ) {
                    workPuzzle[rn][cn].gridTriples.push(n + 1)
                  }
                  if (
                    possibleNumberPositions.grid[r][n] <= 4 &&
                    !workPuzzle[rn][cn].gridQuads.includes(n + 1)
                  ) {
                    workPuzzle[rn][cn].gridQuads.push(n + 1)
                  }
                }
              }
            }
          }
        }
      }
    }
    return possibleValuesRemoved
  }

  /**
   * for each cell in the grid, and for each type (row, col or grid)
   * if the cell has more than one possible value but has two numbers in its typePair
   * we will check for hidden pair matches
   * @return {Boolean} returns true if possible values were removed
   */
  function checkForHiddenPairsTriplesAndQuads(pairs, triples, quads) {
    var possibleValuesRemoved = false
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        var openCellsInRow = openCellsInHouse('row', r)
        var openCellsInCol = openCellsInHouse('col', c)
        if (
          workPuzzle[r][c].value ||
          workPuzzle[r][c].possibleValues.length < 2
        ) {
          continue
        }
        for (let n = 0; n < 9; n++) {
          if (c != n && !workPuzzle[r][n].value) {
            if (
              workPuzzle[r][c].rowPairs.length == 2 &&
              workPuzzle[r][n].rowPairs.length == 2
            ) {
              if (pairs && checkCellsForHiddenPairMatch('row', r, c, r, n)) {
                possibleValuesRemoved = true
              }
            }
            if (openCellsInRow > 5 && (triples || quads)) {
              for (let t = 0; t < 9; t++) {
                if (c == t || n == t || workPuzzle[r][t].value) {
                  continue
                }
                if (
                  workPuzzle[r][c].rowTriples.length <= 3 &&
                  workPuzzle[r][n].rowTriples.length <= 3 &&
                  workPuzzle[r][t].rowTriples.length <= 3
                ) {
                  if (
                    triples &&
                    checkCellsForHiddenTripleMatch('row', r, r, c, r, n, r, t)
                  ) {
                    possibleValuesRemoved = true
                  }
                }
                if (openCellsInRow > 6 && quads) {
                  for (let q = 0; q < 9; q++) {
                    if (c == q || n == q || t == q || workPuzzle[r][q].value) {
                      continue
                    }
                    if (
                      workPuzzle[r][c].rowQuads.length <= 4 &&
                      workPuzzle[r][n].rowQuads.length <= 4 &&
                      workPuzzle[r][t].rowQuads.length <= 4 &&
                      workPuzzle[r][q].rowQuads.length <= 4
                    ) {
                      if (
                        checkCellsForHiddenQuadMatch(
                          'row',
                          r,
                          r,
                          c,
                          r,
                          n,
                          r,
                          t,
                          r,
                          q,
                        )
                      ) {
                        possibleValuesRemoved = true
                      }
                    }
                  }
                }
              }
            }
          }
          if (r != n && !workPuzzle[n][c].value) {
            if (
              workPuzzle[r][c].colPairs.length == 2 &&
              workPuzzle[n][c].colPairs.length == 2
            ) {
              if (pairs && checkCellsForHiddenPairMatch('col', r, c, n, c)) {
                possibleValuesRemoved = true
              }
            }
            if (openCellsInCol > 5 && (triples || quads)) {
              for (let t = 0; t < 9; t++) {
                if (r == t || n == t || workPuzzle[t][c].value) {
                  continue
                }
                if (
                  workPuzzle[r][c].colTriples.length <= 3 &&
                  workPuzzle[n][c].colTriples.length <= 3 &&
                  workPuzzle[t][c].colTriples.length <= 3
                ) {
                  if (
                    triples &&
                    checkCellsForHiddenTripleMatch('col', c, r, c, n, c, t, c)
                  ) {
                    possibleValuesRemoved = true
                  }
                }
                if (openCellsInCol > 6 && quads) {
                  for (let q = 0; q < 9; q++) {
                    if (r == q || n == q || t == q || workPuzzle[q][c].value) {
                      continue
                    }
                    if (
                      workPuzzle[r][c].colQuads.length <= 4 &&
                      workPuzzle[n][c].colQuads.length <= 4 &&
                      workPuzzle[t][c].colQuads.length <= 4 &&
                      workPuzzle[q][c].colQuads.length <= 4
                    ) {
                      if (
                        checkCellsForHiddenQuadMatch(
                          'col',
                          c,
                          r,
                          c,
                          n,
                          c,
                          t,
                          c,
                          q,
                          c,
                        )
                      ) {
                        possibleValuesRemoved = true
                      }
                    }
                  }
                }
              }
            }
          }
        }
        let subgrid = Math.floor(r / 3) * 3 + Math.floor(c / 3)
        var openCellsInGrid = openCellsInHouse('grid', subgrid)
        let rowStart = Math.floor(r / 3) * 3
        let colStart = Math.floor(c / 3) * 3
        for (let rn = rowStart; rn < rowStart + 3; rn++) {
          for (let cn = colStart; cn < colStart + 3; cn++) {
            if (r == rn || c == cn || workPuzzle[rn][cn].value) {
              continue
            }
            if (
              workPuzzle[r][c].gridPairs.length == 2 &&
              workPuzzle[rn][cn].gridPairs.length == 2
            ) {
              if (pairs && checkCellsForHiddenPairMatch('grid', r, c, rn, cn)) {
                possibleValuesRemoved = true
              }
            }
            if (openCellsInGrid > 5 && (triples || quads)) {
              for (let rt = rowStart; rt < rowStart + 3; rt++) {
                for (let ct = colStart; ct < colStart + 3; ct++) {
                  if (
                    (r == rt && c == ct) ||
                    (rn == rt && cn == ct) ||
                    workPuzzle[rt][ct].value
                  ) {
                    continue
                  }
                  if (
                    workPuzzle[r][c].gridTriples.length <= 3 &&
                    workPuzzle[rn][cn].gridTriples.length <= 3 &&
                    workPuzzle[rt][ct].gridTriples.length <= 3
                  ) {
                    if (
                      triples &&
                      checkCellsForHiddenTripleMatch(
                        'grid',
                        subgrid,
                        r,
                        c,
                        rn,
                        cn,
                        rt,
                        ct,
                      )
                    ) {
                      possibleValuesRemoved = true
                    }
                  }
                  if (openCellsInGrid > 6 && quads) {
                    for (let rq = rowStart; rq < rowStart + 3; rq++) {
                      for (let cq = colStart; cq < colStart + 3; cq++) {
                        if (
                          (c == cq && r == rq) ||
                          (cn == cq && rn == rq) ||
                          (ct == cq && rt == rq) ||
                          workPuzzle[rq][cq].value
                        ) {
                          continue
                        }
                        if (
                          workPuzzle[r][c].gridQuads.length <= 4 &&
                          workPuzzle[rn][cn].gridQuads.length <= 4 &&
                          workPuzzle[rt][ct].gridQuads.length <= 4 &&
                          workPuzzle[rq][cq].gridQuads.length <= 4
                        ) {
                          if (
                            checkCellsForHiddenQuadMatch(
                              'grid',
                              subgrid,
                              r,
                              c,
                              rn,
                              cn,
                              rt,
                              ct,
                              rq,
                              cq,
                            )
                          ) {
                            possibleValuesRemoved = true
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
    return possibleValuesRemoved
  }

  /**
   * if neither of the cells have values, and their type pair array has two values
   * we check to see if the arrays match
   * if so we remove the other possible values from both cells
   * @param  {String} type type of comparison (row, col, or grid)
   * @param  {Number} r row index
   * @param  {Number} c column index
   * @param  {Number} rn comparison cell row index
   * @param  {Number} cn comparison cell column index
   * @return {Boolean} returns true if possible values were removed
   */
  function checkCellsForHiddenPairMatch(type, r, c, rn, cn) {
    var possibleValuesRemoved = false
    let selected = workPuzzle[r][c]
    let compare = workPuzzle[rn][cn]
    let selectedArray = selected[`${type}Pairs`]
    let compareArray = compare[`${type}Pairs`]
    if (
      !selected.value &&
      !compare.value &&
      selectedArray.length == 2 &&
      compareArray.length == 2
    ) {
      var union = [...new Set([...selectedArray, ...compareArray])]
      if (union.length == 2) {
        selected[`${type}Pair`] = true
        compare[`${type}Pair`] = true
        if (removeExcessValues(r, c, selectedArray)) {
          possibleValuesRemoved = true
        }
        if (removeExcessValues(rn, cn, compareArray)) {
          possibleValuesRemoved = true
        }
      }
    }
    return possibleValuesRemoved
  }
  function openCellsInHouse(type, index) {
    var openCells = 9
    for (let i = 0; i < 9; i++) {
      if (type == 'row') {
        if (workPuzzle[index][i].value) {
          openCells--
        }
      }
      if (type == 'col') {
        if (workPuzzle[i][index].value) {
          openCells--
        }
      }
    }
    if (type == 'grid') {
      let rowStart = Math.floor(index / 3) * 3
      let colStart = (index % 3) * 3
      for (let gr = rowStart; gr < rowStart + 3; gr++) {
        for (let gc = colStart; gc < colStart + 3; gc++) {
          if (workPuzzle?.[gr]?.[gc]?.value) {
            openCells--
          }
        }
      }
    }
    return openCells
  }
  /**
   * if neither of the cells have values, and they are not in a pair
   * and their type triple arrays have three or less values
   * we check to see if the union of the arrays only have 3 values
   * if so we remove the other possible values all of the cells
   * @param  {String} type type of comparison (row, col, or grid)
   * @param  {Number} r row index
   * @param  {Number} c column index
   * @param  {Number} rn comparison cell row index
   * @param  {Number} cn comparison cell column index
   * @param  {Number} rt third cell row index
   * @param  {Number} ct third cell column index
   * @return {Boolean} returns true if possible values were removed
   */
  function checkCellsForHiddenTripleMatch(
    type,
    typeIndex,
    r,
    c,
    rn,
    cn,
    rt,
    ct,
  ) {
    var possibleValuesRemoved = false
    //make sure we are not looking at duplicate cells
    if (
      !(r == rn && c == cn) &&
      !(r == rt && c == ct) &&
      !(rn == rt && cn == ct)
    ) {
      let selected = workPuzzle[r][c]
      let compare = workPuzzle[rn][cn]
      let third = workPuzzle[rt][ct]
      if (
        !selected.value &&
        !compare.value &&
        !third.value &&
        !selected[`${type}Pair`] &&
        !compare[`${type}Pair`] &&
        !third[`${type}Pair`] &&
        !selected[`${type}Triple`] &&
        !compare[`${type}Triple`] &&
        !third[`${type}Triple`]
      ) {
        let selectedArray = selected[`${type}Triples`]
        let compareArray = compare[`${type}Triples`]
        let thirdArray = third[`${type}Triples`]
        if (
          selectedArray.length <= 3 &&
          compareArray.length <= 3 &&
          thirdArray.length <= 3
        ) {
          var union = [
            ...new Set([...selectedArray, ...compareArray, ...thirdArray]),
          ]
          if (union.length == 3) {
            var concat = selectedArray.concat(compareArray, thirdArray)
            var occ = concat.reduce((obj, e) => {
              obj[e] = (obj[e] || 0) + 1
              return obj
            }, {})
            // we actually need to make sure the counts for each
            // value match the count in the possibleNumbers array
            //possibleNumberPositions.row[r][n]
            var matches = true
            for (let x = 0; x < union.length; x++) {
              let number = union[x]
              if (
                possibleNumberPositions[type][typeIndex][number - 1] !=
                occ[number]
              ) {
                matches = false
              }
            }
            if (matches) {
              console.log(
                type,
                r,
                c,
                rn,
                cn,
                rt,
                ct,
                selectedArray,
                compareArray,
                thirdArray,
                union,
                concat,
                occ,
                {
                  [union[0]]:
                    possibleNumberPositions[type][typeIndex][union[0] - 1],
                },
                {
                  [union[1]]:
                    possibleNumberPositions[type][typeIndex][union[1] - 1],
                },
                {
                  [union[2]]:
                    possibleNumberPositions[type][typeIndex][union[2] - 1],
                },
              )
              console.log('hidden triple match!')
              selected[`${type}Triple`] = true
              compare[`${type}Triple`] = true
              third[`${type}Triple`] = true
              if (removeExcessValues(r, c, selectedArray)) {
                possibleValuesRemoved = true
              }
              if (removeExcessValues(rn, cn, compareArray)) {
                possibleValuesRemoved = true
              }
              if (removeExcessValues(rt, ct, thirdArray)) {
                possibleValuesRemoved = true
              }
            }
          }
        }
      }
    }
    return possibleValuesRemoved
  }
  /**
   * if neither of the cells have values, and they are not in a pair
   * and their type triple arrays have three or less values
   * we check to see if the union of the arrays only have 3 values
   * if so we remove the other possible values all of the cells
   * @param  {String} type type of comparison (row, col, or grid)
   * @param  {Number} r row index
   * @param  {Number} c column index
   * @param  {Number} rn comparison cell row index
   * @param  {Number} cn comparison cell column index
   * @param  {Number} rt third cell row index
   * @param  {Number} ct third cell column index
   * @param  {Number} rq fourth cell row index
   * @param  {Number} cq fourth cell column index
   * @return {Boolean} returns true if possible values were removed
   */
  function checkCellsForHiddenQuadMatch(
    type,
    typeIndex,
    r,
    c,
    rn,
    cn,
    rt,
    ct,
    rq,
    cq,
  ) {
    var possibleValuesRemoved = false
    //make sure we are not looking at dupliate cells
    if (
      !(r == rn && c == cn) &&
      !(r == rt && c == ct) &&
      !(rn == rt && cn == ct) &&
      !(r == rq && c == cq) &&
      !(rn == rq && cn == cq) &&
      !(rt == rq && ct == cq)
    ) {
      let selected = workPuzzle[r][c]
      let compare = workPuzzle[rn][cn]
      let third = workPuzzle[rt][ct]
      let fourth = workPuzzle[rq][cq]
      if (
        !selected.value &&
        !compare.value &&
        !third.value &&
        !fourth.value &&
        !selected[`${type}Pair`] &&
        !compare[`${type}Pair`] &&
        !third[`${type}Pair`] &&
        !fourth[`${type}Pair`] &&
        !selected[`${type}Triple`] &&
        !compare[`${type}Triple`] &&
        !third[`${type}Triple`] &&
        !fourth[`${type}Triple`] &&
        !selected[`${type}Quad`] &&
        !compare[`${type}Quad`] &&
        !third[`${type}Quad`] &&
        !fourth[`${type}Quad`]
      ) {
        let selectedArray = selected[`${type}Quads`]
        let compareArray = compare[`${type}Quads`]
        let thirdArray = third[`${type}Quads`]
        let fourthArray = fourth[`${type}Quads`]
        if (
          selectedArray.length <= 4 &&
          compareArray.length <= 4 &&
          thirdArray.length <= 4 &&
          fourthArray.length <= 4
        ) {
          var union = [
            ...new Set([
              ...selectedArray,
              ...compareArray,
              ...thirdArray,
              ...fourthArray,
            ]),
          ]
          if (union.length == 4) {
            var concat = selectedArray.concat(
              compareArray,
              thirdArray,
              fourthArray,
            )
            var occ = concat.reduce((obj, e) => {
              obj[e] = (obj[e] || 0) + 1
              return obj
            }, {})
            var matches = true
            for (let x = 0; x < union.length; x++) {
              let number = union[x]
              if (
                possibleNumberPositions[type][typeIndex][number - 1] !=
                occ[number]
              ) {
                matches = false
              }
            }
            if (matches) {
              console.log(
                type,
                r,
                c,
                rn,
                cn,
                rt,
                ct,
                rq,
                cq,
                selectedArray,
                compareArray,
                thirdArray,
                fourthArray,
                union,
                concat,
                occ,
                {
                  [union[0]]:
                    possibleNumberPositions[type][typeIndex][union[0] - 1],
                },
                {
                  [union[1]]:
                    possibleNumberPositions[type][typeIndex][union[1] - 1],
                },
                {
                  [union[2]]:
                    possibleNumberPositions[type][typeIndex][union[2] - 1],
                },
                {
                  [union[3]]:
                    possibleNumberPositions[type][typeIndex][union[3] - 1],
                },
              )
              console.log('hidden quad match!')
              selected[`${type}Quad`] = true
              compare[`${type}Quad`] = true
              third[`${type}Quad`] = true
              fourth[`${type}Quad`] = true
              if (removeExcessValues(r, c, selectedArray)) {
                possibleValuesRemoved = true
              }
              if (removeExcessValues(rn, cn, compareArray)) {
                possibleValuesRemoved = true
              }
              if (removeExcessValues(rt, ct, thirdArray)) {
                possibleValuesRemoved = true
              }
              if (removeExcessValues(rq, cq, fourthArray)) {
                possibleValuesRemoved = true
              }
            }
          }
        }
      }
    }
    return possibleValuesRemoved
  }
  /**
   * @return {Boolean} returns true if possible values were removed
   */
  function findValuesLimitedToACellOrRowWithinASubgrid() {
    console.log('findValuesLimitedToACellOrRowWithinASubgrid')
    //for each grid in the puzzle
    var removedPossibleValuesFromCells = false
    for (let g = 0; g < 9; g++) {
      let colStart = Math.floor(g % 3) * 3
      let rowStart = Math.floor(g / 3) * 3
      // console.log({ g, colStart, rowStart });
      let possibleRowsForValueInGrid = _.range(9).map(function () {
        return 0
      })
      let possibleColumnsForValueInGrid = _.range(9).map(function () {
        return 0
      })
      //for the subGridRow we check the possible rows for this grid
      for (let rn = rowStart; rn < rowStart + 3; rn++) {
        //for each number 1-9
        for (var n = 0; n < 9; n++) {
          // if the row or grid doesn't have any positions there is already
          //a match, and we will skip checking
          if (
            possibleNumberPositions.row[rn][n] > 0 &&
            possibleNumberPositions.grid[g][n] > 0
          ) {
            //if this row does have a possible spot we increment the possible rows
            if (possibleNumberPositions.gridRow[g][rn][n] > 0) {
              possibleRowsForValueInGrid[n]++
            }
            //we are also checking if the number of possible spots matches
            //the number of possible spots for the row itself
            //if so we can exclude it from the other positions in this grid
            if (
              possibleNumberPositions.gridRow[g][rn][n] != 0 &&
              possibleNumberPositions.gridRow[g][rn][n] ==
                possibleNumberPositions.row[rn][n]
            ) {
              //if so we need to remove that value as a possible value from any
              //other cells in the grid
              for (let rx = rowStart; rx < rowStart + 3; rx++) {
                for (let cx = colStart; cx < colStart + 3; cx++) {
                  //skip our selcted row
                  if (!(rx == rn)) {
                    if (removePossibleValueFromCell(rx, cx, n + 1)) {
                      removedPossibleValuesFromCells = true
                    }
                  }
                }
              }
            }
          }
        }
      }
      //for the subGridColumn we check the possible columns for this grid
      for (let cn = colStart; cn < colStart + 3; cn++) {
        //for each number 1-9
        for (var n = 0; n < 9; n++) {
          // if the column or grid doesn't have any positions there is already
          //a match, and we will skip checking
          if (
            possibleNumberPositions.col[cn][n] > 0 &&
            possibleNumberPositions.grid[g][n] > 0
          ) {
            //if this column does have a possible spot we increment the possible columns
            if (possibleNumberPositions.gridColumn[g][cn][n] > 0) {
              possibleColumnsForValueInGrid[n]++
            }
            //we are also checking if the number of possible spots matches
            //the number of possible spots for the column itself
            //if so we can exclude it from the other positions in this grid
            if (
              possibleNumberPositions.gridColumn[g][cn][n] != 0 &&
              possibleNumberPositions.gridColumn[g][cn][n] ==
                possibleNumberPositions.col[cn][n]
            ) {
              //if so we need to remove that value as a possible value from any
              //other cells in the grid
              for (let rx = rowStart; rx < rowStart + 3; rx++) {
                for (let cx = colStart; cx < colStart + 3; cx++) {
                  //skip our selcted columns
                  if (!(cx == cn)) {
                    if (removePossibleValueFromCell(rx, cx, n + 1)) {
                      removedPossibleValuesFromCells = true
                    }
                  }
                }
              }
            }
          }
        }
      }
      for (let i = 0; i < 9; i++) {
        if (possibleRowsForValueInGrid[i] == 1) {
          //this value is limited to one row in the grid
          //so we need to remove it from the rest of the cells in that row
          for (let rn = rowStart; rn < rowStart + 3; rn++) {
            //which row is it in?
            if (possibleNumberPositions.gridRow[g][rn][i] > 0) {
              for (let c = 0; c < 9; c++) {
                if (c < colStart || c > colStart + 2) {
                  if (removePossibleValueFromCell(rn, c, i + 1)) {
                    removedPossibleValuesFromCells = true
                  }
                }
              }
            }
          }
        }
        if (possibleColumnsForValueInGrid[i] == 1) {
          //this value is limited to one column in the grid
          //so we need to remove it from the rest of the cells in that column

          for (let cn = colStart; cn < colStart + 3; cn++) {
            //which column is it in?
            if (possibleNumberPositions.gridColumn[g][cn][i] > 0) {
              for (let r = 0; r < 9; r++) {
                if (r < rowStart || r > rowStart + 2) {
                  if (removePossibleValueFromCell(r, cn, i + 1)) {
                    removedPossibleValuesFromCells = true
                  }
                }
              }
            }
          }
        }
      }
      if (removedPossibleValuesFromCells) {
        // we need to recalculate things
        console.log('grid/row/column exclusions applied')
        // findNakedSinglesAndNakedPairs();
        // findNakedTriples();
        // checkForHiddenSinglesPairsAndRestrictedValues();
      }
    }
    return removedPossibleValuesFromCells
  }

  /**
   * if the cell only has one possible value, we remove that value as
   * a possibility from other cells in the row column and grid
   * @param  {Number} r row index
   * @param  {Number} c column index
   * @return {Boolean} returns true if possible values were removed
   */
  function removeValueOfSingleFromSeenCells(r, c) {
    let selected = workPuzzle[r][c]
    var valuesRemoved = false
    if (
      !selected.value &&
      selected.possibleValues &&
      selected.possibleValues.length == 1
    ) {
      for (let n = 0; n < 9; n++) {
        if (removeMatchingValuesFromExcludedCell(r, c, r, n)) {
          valuesRemoved = true
        }
        if (removeMatchingValuesFromExcludedCell(r, c, n, c)) {
          valuesRemoved = true
        }
      }
      let rowStart = Math.floor(r / 3) * 3
      let colStart = Math.floor(c / 3) * 3
      for (let rx = rowStart; rx < rowStart + 3; rx++) {
        for (let cx = colStart; cx < colStart + 3; cx++) {
          if (!(rx == r && cx == c)) {
            if (removeMatchingValuesFromExcludedCell(r, c, rx, cx)) {
              valuesRemoved = true
            }
          }
        }
      }
    }
    return valuesRemoved
  }
  /**
   * for each possible value in selected cell,
   * we remove that as a possible value from the exclusion cell
   * if we removed possible values we recheck for pairs and triples and checkForHiddenSinglesPairsAndRestrictedValues
   * @param  {Number} r selected row index
   * @param  {Number} c selected column index
   * @param  {Number} rx exclusion row index
   * @param  {Number} cx exclusion column index
   * @return {Object[]|Boolean} returns array of row,column,value objects that were removed, or false if no match was found
   */
  function removeMatchingValuesFromExcludedCell(r, c, rx, cx) {
    let selected = workPuzzle[r][c]
    let exclusion = workPuzzle[rx][cx]
    if (
      !(rx == r && cx == c) &&
      !exclusion.value &&
      exclusion.possibleValues &&
      exclusion.possibleValues.length > 0
    ) {
      var matches = []
      for (let i = 0; i < selected.possibleValues.length; i++) {
        if (removePossibleValueFromCell(rx, cx, selected.possibleValues[i])) {
          matches.push({ r: rx, c: cx, v: selected.possibleValues[i] })
        }
      }
      if (matches.length > 0) {
        // checkCellForNakedSinglesAndNakedPairs(rx, cx);
        // checkCellForNakedTriples(rx, cx);
        // checkForHiddenSinglesPairsAndRestrictedValues();
        return matches
      } else {
        return false
      }
    }
    return false
  }

  /**
   * removed the value from the possible values in the specified cell
   * @param  {Number} r row index
   * @param  {Number} c column index
   * @param  {Number} v value to remove
   * @return {Boolean} true if value was removed
   */

  function removePossibleValueFromCell(r, c, v) {
    let selected = workPuzzle[r][c]
    let index = selected.possibleValues.indexOf(v)
    if (index != -1) {
      selected.possibleValues.splice(index, 1)
      return true
    } else {
      return false
    }
  }

  /**
   * after making sure the exclusion cell does not match one of the cells in the triple
   * we make sure the exclusion doesn't have a value, and does have possible values
   * we get the union of the first two cells, and for each possible value in the union
   * we check for matches in the exclusion cell.  If we find a match we remove it as a
   * possible value from the exclusion cell.  If we removed possibilities we recheck
   * for pairs, triples and recalculate pairs
   * @param  {String} type type of comparison (row, col, or grid)
   * @param  {Number} r first cell row index
   * @param  {Number} c first cell column index
   * @param  {Number} ru second cell row index
   * @param  {Number} cu second cell column index
   * @param  {Number} rn third cell row index
   * @param  {Number} cn third cell column index
   * @param  {Number} rx exclusion cell row index
   * @param  {Number} cx exclusion cell column index
   * @param {Boolean} returns true if possible values were removed
   */
  function removeTripleMatchesFromOtherCells(r, c, ru, cu, rn, cn, rx, cx) {
    if (
      (rx == r && cx == c) ||
      (rx == ru && cx == cu) ||
      (rx == rn && cx == cn)
    ) {
      return false
    }
    var possibleValuesRemoved = false
    let select1 = workPuzzle[r][c]
    let select2 = workPuzzle[ru][cu]
    let select3 = workPuzzle[rn][cn]
    let exclusion = workPuzzle[rx][cx]
    if (
      !exclusion.value &&
      exclusion.possibleValues &&
      exclusion.possibleValues.length > 0
    ) {
      var union = [
        ...new Set([
          ...select1.possibleValues,
          ...select2.possibleValues,
          ...select3.possibleValues,
        ]),
      ]
      var removed = []
      for (let i = 0; i < union.length; i++) {
        let v = union[i]
        if (removePossibleValueFromCell(rx, cx, v)) {
          removed.push(v)
        }
      }
      if (removed.length > 0) {
        possibleValuesRemoved = true
      }
    }
    return possibleValuesRemoved
  }

  /**
   * for the specified cell we check if there are possible values that are not in the keep array
   * if there are, we remove the values from the possible values and return all values that were
   * removed and then we check the cell for pairs tripples and checkForHiddenSinglesPairsAndRestrictedValues
   * @param  {Number} r row index
   * @param  {Number} c column index
   * @param  {Number[]} keep array of values to keep
   * @return {Number[]|Boolean} an array of numbers removed, or false if none were removed
   */
  function removeExcessValues(r, c, keep) {
    let selected = workPuzzle[r][c]
    var removed = []
    var toRemove = selected.possibleValues.filter((v) => {
      return !keep.includes(v)
    })
    for (let i = 0; i < toRemove.length; i++) {
      let v = toRemove[i]
      if (removePossibleValueFromCell(r, c, v)) {
        removed.push(v)
      }
    }
    if (removed.length > 0) {
      return removed
    } else {
      return false
    }
  }

  /**
   * attempts to solve naked and hidden singles
   * @returns {Object} returns puzzle and number of emptySpaces
   */
  function solve() {
    history.value.push(JSON.parse(JSON.stringify(workPuzzle)))
    future.value = []
    var emptySpaces = 81
    var previousSpaces = 99
    // let possibleNumberPositions = {}
    workPuzzle = puzzle.value
    // puzzle.value = workPuzzle
    while (emptySpaces > 0 && previousSpaces != emptySpaces) {
      previousSpaces = emptySpaces
      emptySpaces = 0
      possibleNumberPositions = {}
      console.log('calculating possibilities')
      initializePossibleNumberPositions()
      resetNeededNumbers()
      // getInitialPossibilities()
      //
      for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
          if (workPuzzle?.[r]?.[c] && !workPuzzle?.[r][c].value) {
            resetPairsAndTriples(r, c)

            var nonPossibilities = {}
            for (let i = 0; i < 9; i++) {
              if (workPuzzle[r][i].value) {
                nonPossibilities[workPuzzle[r][i].value] = true
              }
              if (workPuzzle[i][c].value) {
                nonPossibilities[workPuzzle[i][c].value] = true
              }
            }
            let rowStart = Math.floor(r / 3) * 3
            let colStart = Math.floor(c / 3) * 3
            for (let gr = rowStart; gr < rowStart + 3; gr++) {
              for (let gc = colStart; gc < colStart + 3; gc++) {
                if (workPuzzle?.[gr]?.[gc]?.value) {
                  nonPossibilities[workPuzzle[gr][gc].value] = true
                }
              }
            }
            let takenNumbers = Object.keys(nonPossibilities)
            // console.log({ takenNumbers, nonPossibilities });
            workPuzzle[r][c].possibleValues = []
            workPuzzle[r][c].rawPossibleValues = []
            if (takenNumbers.length != 8) {
              emptySpaces++
            }
            for (var i = 1; i < 10; i++) {
              if (takenNumbers.indexOf(String(i)) < 0) {
                workPuzzle[r][c].rawPossibleValues.push(i)
                workPuzzle[r][c].possibleValues.push(i)
              }
            }
          } else if (workPuzzle?.[r]?.[c]?.value) {
            //the value is set, so we need one less of that number
            neededNumbers[workPuzzle?.[r][c].value - 1]--
          }
        }
      }
      processPossibleValuesInGrid()
      for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
          workPuzzle[r][c].numberComplete =
            workPuzzle[r][c].value &&
            neededNumbers[workPuzzle[r][c].value - 1] == 0
          workPuzzle[r][c].pairs = _.union(
            workPuzzle[r][c].rowPairs,
            workPuzzle[r][c].colPairs,
            workPuzzle[r][c].gridPairs,
            workPuzzle[r][c].cellPairs,
          )
        }
      }
      console.log(`empty spaces before: ${emptySpaces}`)
      for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
          if (
            workPuzzle[r][c].value == null &&
            workPuzzle[r][c].possibleValues.length == 1
          ) {
            workPuzzle[r][c].value = workPuzzle[r][c].possibleValues[0]
            emptySpaces--
          }
        }
      }
      for (let r = 0; r < 9; r++) {
        for (let n = 0; n < 9; n++) {
          // console.log(possibleNumberPositions)
          if (possibleNumberPositions.row[r][n] == 1) {
            //   console.log('row: ' + (r + 1), 'num: ' + (n + 1))
            for (let i = 0; i < 9; i++) {
              if (workPuzzle[r][i].value == n + 1) {
                break
              }
              if (
                workPuzzle[r][i].value == null &&
                workPuzzle[r][i].possibleValues.includes(n + 1)
              ) {
                console.log(r, i, n, workPuzzle[r][i])
                workPuzzle[r][i].value = n + 1
                emptySpaces--
                break
              }
            }
          }
          if (possibleNumberPositions.col[r][n] == 1) {
            //   console.log('column: ' + (r + 1), 'num: ' + (n + 1))
            for (let i = 0; i < 9; i++) {
              if (workPuzzle[i][r].value == n + 1) {
                break
              }
              if (
                workPuzzle[i][r].value == null &&
                workPuzzle[i][r].possibleValues.includes(n + 1)
              ) {
                workPuzzle[i][r].value = n + 1
                emptySpaces--
                break
              }
            }
          }
          //   let subgrid = Math.floor(r / 3) * 3 + Math.floor(c / 3)
          if (possibleNumberPositions.grid[r][n] == 1) {
            // console.log('subgrid: ' + (r + 1), 'num: ' + (n + 1))
            let colStart = Math.floor(r % 3) * 3
            let rowStart = Math.floor(r / 3) * 3
            //   console.log(colStart, rowStart)
            for (let r = rowStart; r < rowStart + 3; r++) {
              for (let c = colStart; c < colStart + 3; c++) {
                if (workPuzzle[r][c].value == n + 1) {
                  break
                }
                if (
                  workPuzzle[r][c].value == null &&
                  workPuzzle[r][c].possibleValues.includes(n + 1)
                ) {
                  // console.log(colStart, rowStart, workPuzzle[r][c], c, r, n + 1)
                  workPuzzle[r][c].value = n + 1
                  emptySpaces--
                  break
                }
              }
            }
          }
        }
      }
      console.log(workPuzzle)
      console.log(`empty spaces after: ${emptySpaces}`)
      // console.log(workPuzzle)
      puzzle.value = workPuzzle
    }
    calculatePossibilities()
    return { puzzle: workPuzzle, emptySpaces: emptySpaces }
  }
  return { calculatePossibilities, solve }
}
