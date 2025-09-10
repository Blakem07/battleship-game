import Gameboard from "./Gameboard";

export default class UI {
  #shipPlacementOrientation;

  constructor() {
    this.playerGrid = document.querySelector("#player-grid");
    this.computerGrid = document.querySelector("#computer-grid");

    this.cellHighlightCount = 5;
    this.#shipPlacementOrientation = "horizontal";

    this.createShipPopup();
  }

  get shipPlacementOrientation() {
    return this.#shipPlacementOrientation;
  }

  set shipPlacementOrientation(_) {
    this.#shipPlacementOrientation =
      this.#shipPlacementOrientation === "horizontal"
        ? "vertical"
        : "horizontal";
  }

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

  /**
   * Returns the cell element at the specified row and column within the grid container.
   *
   * @param {HTMLElement} gridContainer - The container element holding the grid cells.
   * @param {number} row - The zero-based row index of the desired cell.
   * @param {number} col - The zero-based column index of the desired cell.
   * @returns {HTMLElement | null} The cell element matching the given row and column, or null if not found.
   */
  getCell(gridContainer, row, col) {
    const selector = `.grid-cell[data-row="${row}"][data-col="${col}"]`;
    return gridContainer.querySelector(selector);
  }

  getCellGroup(gridContainer, row, col) {
    let rowPosition = row;
    let colPosition = col;

    const cellGroup = [];

    for (let count = 0; count < this.cellHighlightCount; count++) {
      const cell = this.getCell(gridContainer, rowPosition, colPosition);

      if (cell) cellGroup.push(cell); // Handles edge cases

      if (this.#shipPlacementOrientation == "horizontal") colPosition++;
      if (this.#shipPlacementOrientation == "vertical") rowPosition++;
    }

    return cellGroup;
  }

  addGridHoverListeners(gridContainer) {
    const cells = gridContainer.querySelectorAll(".grid-cell");

    cells.forEach((cell) => {
      cell.addEventListener("mouseenter", () => {
        cell.classList.add("hover-effect");
      });

      cell.addEventListener("mouseleave", () => {
        cell.classList.remove("hover-effect");
      });
    });
  }

  createShipPopup() {
    const HTMLBody = document.querySelector("body");
    const popup = document.createElement("div");

    popup.id = "placeShipPopup";
    popup.classList.add("popup");

    // Header
    const header = document.createElement("h2");
    header.textContent = "Place Your Ships";
    popup.append(header);

    // Ship Selection

    const shipSelectionDiv = document.createElement("div");
    shipSelectionDiv.id = "shipSelection";
    shipSelectionDiv.textContent = "Place Your...";
    popup.append(shipSelectionDiv);

    // Placement Orientation

    const orientationSwitch = this.createOrientationSwitch();
    popup.append(orientationSwitch);

    // Ship Placement Grid

    const placementGridDiv = document.createElement("div");
    placementGridDiv.id = "shipPlacement";
    placementGridDiv.classList.add("grid-small");
    this.populateGrid(placementGridDiv, {
      row: Gameboard.BOARD_ROWS,
      col: Gameboard.BOARD_COLS,
      createCell: this.createCell,
    });
    this.addGridHoverListeners(placementGridDiv);
    popup.append(placementGridDiv);

    // Blur Overlay
    const overlay = document.createElement("div");
    overlay.id = "placeShipOverlay";
    overlay.append(popup);

    HTMLBody.append(overlay);

    return popup;
  }

  /**
   * Creates and returns a DOM element containing a pair of radio buttons
   * for selecting orientation: "Horizontal" or "Vertical".
   *
   * - Each radio button is associated with a label.
   * - Both inputs share the same 'name' attribute ("orientation") so only one can be selected at a time.
   * - The returned <div> can be appended to the DOM wherever needed.
   *
   * @returns {HTMLDivElement} A <div> containing labeled radio buttons for orientation selection.
   */
  createOrientationSwitch() {
    const div = document.createElement("div");
    div.id = "orientationSwitch";

    const horizontalLabel = document.createElement("label");
    horizontalLabel.textContent = "Horizontal";
    div.appendChild(horizontalLabel);

    const verticalLabel = document.createElement("label");
    verticalLabel.textContent = "Vertical";
    div.appendChild(verticalLabel);

    const horizontalSwitch = document.createElement("input");
    horizontalSwitch.id = "horizontalSwitch";
    horizontalSwitch.type = "radio";
    horizontalSwitch.checked = "checked";
    horizontalSwitch.name = "orientation";
    this.addSwitchClickListener(horizontalSwitch);
    horizontalLabel.appendChild(horizontalSwitch);

    const verticalSwitch = document.createElement("input");
    verticalSwitch.id = "verticalSwitch";
    verticalSwitch.type = "radio";
    verticalSwitch.name = "orientation";
    this.addSwitchClickListener(verticalSwitch);
    verticalLabel.appendChild(verticalSwitch);

    return div;
  }

  /**
   * Adds a click event listener to the given input element.
   * When clicked, this toggles the shipPlacementOrientation property via its setter.
   *
   * @param {HTMLElement} inputEle - The input element to attach the click listener to.
   * @returns {HTMLElement} The same input element, with the listener attached.
   */
  addSwitchClickListener(inputEle) {
    inputEle.addEventListener("click", () => {
      this.shipPlacementOrientation = "_"; // Toggles setter
    });

    return inputEle;
  }
}
