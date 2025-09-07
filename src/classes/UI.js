import Gameboard from "./Gameboard";

export default class UI {
  constructor() {}

  /**
   * Populates a container element with a grid of elements.=
   *
   * @param {HTMLElement} gridContainer - The DOM element to which the grid rows will be appended.
   * @param {Object} options - Configuration options for the grid.
   * @param {number} options.row - The number of rows to create.
   * @param {number} options.col - The number of columns to create per row.
   * @param {function(number, number): HTMLElement} options.createCell -
   *        A callback function that returns a cell element given the row and column indices.
   */
  populateGrid(
    gridContainer,
    { row: rows, col: cols, createCell: createCell }
  ) {
    for (let row = 0; row < rows; row++) {
      const rowCell = document.createElement("div");

      for (let col = 0; col < cols; col++) {
        const colCell = createCell(row, col);
        rowCell.append(colCell);
      }

      gridContainer.append(rowCell);
    }
  }

  createCell(row, col) {
    const cell = document.createElement("div");

    return cell;
  }
}
