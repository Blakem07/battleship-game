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

  /**
   * Creates a grid cell element with row and column data attributes.
   *
   * @param {number} row - The row index of the cell.
   * @param {number} col - The column index of the cell.
   * @returns {HTMLElement} A div element representing a grid cell,
   *                       with dataset attributes for row and column,
   *                       and a CSS class "grid-cell" applied.
   */
  createCell(row, col) {
    const cell = document.createElement("div");

    cell.dataset.row = row;
    cell.dataset.col = col;
    cell.classList.add("grid-cell");

    return cell;
  }

  /**
   * Places click event listeners on all cells within a grid which
   * causes the placeShip callback to be called.
   *
   * @param {HTMLElement} gridContainer - 2D DOM Structure
   * @param {Function} callback - Function to be called when a cell is clicked (e.g., placeShip or attackShip)
   */
  addGridClickListeners(gridContainer, callback) {
    for (let row = 0; row < Gameboard.BOARD_ROWS; row++) {
      for (let col = 0; col < Gameboard.BOARD_COLS; col++) {
        const cell = gridContainer.children[row].children[col];

        cell.addEventListener("click", () => {
          callback(row, col);
        });
      }
    }
  }
}
