import Ship from "./Ship";
import Gameboard from "./Gameboard";

export default class UI {
  #currentShipIndex;
  #shipPlacementOrientation;

  constructor() {
    this.playerGrid = document.querySelector("#player-grid");
    this.computerGrid = document.querySelector("#computer-grid");

    this.#currentShipIndex = 0;
    this.shipsToPlace = [...Ship.VALID_NAMES];

    this.cellHighlightCount = 5;
    this.#shipPlacementOrientation = "horizontal";
  }

  /**
   * Advances to the next ship in the placement sequence.
   * Updates the UI prompt to indicate the next ship to be placed.
   * Resets the cell highlight count based on the length of the current ship.
   * If all ships have been placed, sets the current ship index to null and resets highlight count.
   */
  advanceToNextShip() {
    const shipSelectionDiv = document.querySelector("#shipSelection");

    this.#currentShipIndex++;

    if (shipSelectionDiv) {
      shipSelectionDiv.textContent = `Place your ${this.currentShip}`;
    }

    this.cellHighlightCount = Ship.VALID_LENGTHS[this.currentShip];

    if (this.#currentShipIndex >= this.shipsToPlace.length) {
      this.#currentShipIndex = null; // Sets to null at end
      this.cellHighlightCount = 1;

      this.closeShipPopup();
    }
  }

  /**
   * Closes the ship placement popup by hiding its overlay element.
   * Sets the display style of the popup element with ID "placeShipOverlay" to "none".
   */
  closeShipPopup() {
    const popup = document.querySelector("#placeShipOverlay");

    if (popup) {
      placeShipOverlay.style.display = "none";
    }
  }

  get currentShipIndex() {
    return this.#currentShipIndex;
  }

  /**
   * Returns the name of the ship currently being placed.
   * If all ships have been placed, returns null.
   */
  get currentShip() {
    return this.shipsToPlace[this.#currentShipIndex] || null;
  }

  get shipPlacementOrientation() {
    return this.#shipPlacementOrientation;
  }

  set shipPlacementOrientation(orientation) {
    if (orientation === "horizontal" || orientation === "vertical") {
      this.#shipPlacementOrientation = orientation;
    } else {
      throw new Error("Invalid orientation");
    }
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
      for (let col = 0; col < cols; col++) {
        const cell = createCell(row, col);
        gridContainer.append(cell);
      }
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
   * Adds click event listeners to all cells in a grid.
   * Only triggers the callback if the correct grid is used for its purpose.
   *
   * @param {HTMLElement} gridContainer - The grid DOM element.
   * @param {Function} placeShipFn - Dependency Injection.
   * @param {Function} verifyShipPlacementFn - Dependency Injection.
   */
  addGridClickListeners(gridContainer, placeShipFn, verifyShipPlacementFn) {
    const isShipPlacementGrid = gridContainer.id === "shipPlacement";

    for (let row = 0; row < Gameboard.BOARD_ROWS; row++) {
      for (let col = 0; col < Gameboard.BOARD_COLS; col++) {
        const cell = this.getCell(gridContainer, row, col);

        if (isShipPlacementGrid) {
          cell.addEventListener("click", () => {
            this.handlePlaceShipClick(
              row,
              col,
              placeShipFn,
              verifyShipPlacementFn
            );
          });
        }
      }
    }
  }

  /**
   * Handles a single click event for placing a ship on the gameboard.
   * Verifies the placement, places the ship if valid, and advances to the next ship.
   *
   * @param {number} row - The row index of the clicked cell.
   * @param {number} col - The column index of the clicked cell.
   * @param {Function} placeShipFn - Function to place the ship on the board.
   * @param {Function} verifyShipPlacementFn - Function to check if the ship can be placed at the given location.
   */
  handlePlaceShipClick(row, col, placeShipFn, verifyShipPlacementFn) {
    const isValidPlacement = verifyShipPlacementFn(
      row,
      col,
      this.currentShip,
      this.shipPlacementOrientation,
      Ship.VALID_LENGTHS[this.currentShip]
    );

    if (!isValidPlacement) return;

    placeShipFn(row, col, this.currentShip, this.shipPlacementOrientation);
    this.advanceToNextShip();
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

  /**
   * Retrieves a group of cells from the grid starting at the specified row and column,
   * extending in the direction specified by the ship placement orientation.
   *
   * @param {HTMLElement} gridContainer - The container element representing the grid.
   * @param {number} row - The starting row index in the grid.
   * @param {number} col - The starting column index in the grid.
   * @returns {Array<HTMLElement>} An array of cell elements that form the group based on the current cellHighlightCount and orientation.
   */
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

  /**
   * Adds hover event listeners to each grid cell that apply or remove
   * a "hover-effect" class to a group of cells (not just the one hovered).
   *
   * This is used to visually preview multi-cell ship placement
   * by highlighting a group of cells starting from the hovered cell,
   * determined by getCellGroup().
   */
  addGridHoverListeners(gridContainer) {
    const cells = gridContainer.querySelectorAll(".grid-cell");

    cells.forEach((cell) => {
      const row = parseInt(cell.dataset.row, 10);
      const col = parseInt(cell.dataset.col, 10);

      cell.addEventListener("mouseenter", () => {
        const group = this.getCellGroup(gridContainer, row, col);
        group.forEach((c) => c.classList.add("hover-effect"));
      });

      cell.addEventListener("mouseleave", () => {
        const group = this.getCellGroup(gridContainer, row, col);
        group.forEach((c) => c.classList.remove("hover-effect"));
      });
    });
  }

  /**
   * Creates and displays the "Place Your Ships" popup UI for ship placement.
   *
   * This method generates a popup modal that includes:
   * - A header prompting the player to place ships
   * - A ship selection section
   * - An orientation switch (horizontal/vertical)
   * - A grid for ship placement
   *
   * It also attaches necessary event listeners for hover effects and click events
   * that invoke the provided `placeShipFn` when a ship is placed.
   *
   * @param {Function} placeShipFn - A callback function that handles placing a ship on the gameboard.
   *                                 It is called when the user clicks a valid placement cell.
   * @returns {HTMLElement} The DOM element representing the popup (for possible later reference or removal).
   */
  createShipPopup(placeShipFn, verifyShipPlacementFn) {
    const HTMLBody = document.querySelector("body");
    const popup = document.createElement("div");

    popup.id = "placeShipPopup";
    popup.classList.add("popup");

    // Header
    const header = document.createElement("h2");
    header.textContent = "Welcome to Battleship!";
    popup.append(header);

    // Ship Selection

    const shipSelectionDiv = document.createElement("div");
    shipSelectionDiv.id = "shipSelection";
    shipSelectionDiv.textContent = `Place your ${this.currentShip}`;
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
    this.addGridClickListeners(
      placementGridDiv,
      placeShipFn,
      verifyShipPlacementFn
    );
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
    this.addSwitchChangeListener(horizontalSwitch);
    horizontalLabel.appendChild(horizontalSwitch);

    const verticalSwitch = document.createElement("input");
    verticalSwitch.id = "verticalSwitch";
    verticalSwitch.type = "radio";
    verticalSwitch.name = "orientation";
    this.addSwitchChangeListener(verticalSwitch);
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
  addSwitchChangeListener(inputEle) {
    inputEle.addEventListener("change", () => {
      const nextOrientation =
        this.shipPlacementOrientation == "horizontal"
          ? "vertical"
          : "horizontal";

      this.shipPlacementOrientation = nextOrientation; // Toggles setter
    });

    return inputEle;
  }
}
