import Ship from "./Ship";
import Gameboard from "./Gameboard";

export default class UI {
  #currentShipIndex;
  #shipPlacementOrientation;
  #playerShipPositions;
  #playerAttackPosition;

  constructor() {
    this.playerGrid = document.querySelector("#player-grid");
    this.computerGrid = document.querySelector("#computer-grid");

    this.#currentShipIndex = 0;
    this.shipsToPlace = [...Ship.VALID_NAMES];

    this.cellHighlightCount = 5;
    this.#shipPlacementOrientation = "horizontal";

    this.#playerShipPositions = [];

    this.#playerAttackPosition = null;
  }

  /**
   * Records the player's attack position on the grid.
   *
   * This method stores the given `row` and `col` as the player's most recent attack position.
   * It uses a private field (`#playerAttackPosition`) to ensure that the attack position
   * is encapsulated and cannot be accessed directly from outside the class.
   *
   * @param {number} row - The row index of the attack position on the grid.
   * @param {number} col - The column index of the attack position on the grid.
   */
  recordPlayerAttack(row, col) {
    this.#playerAttackPosition = { row, col };
  }

  /**
   * Records the position, ship name, and direction of a ship placement.
   *
   * Assumes that `this.currentShip` and `this.shipPlacementOrientation` are
   * already set before calling this method.
   *
   * @param {number} row - The row coordinate of the ship placement.
   * @param {number} col - The column coordinate of the ship placement.
   */
  recordShipPosition(row, col) {
    const shipPosition = {
      row,
      col,
      shipName: this.currentShip,
      direction: this.shipPlacementOrientation,
    };

    this.#playerShipPositions.push(shipPosition);
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

  getPlayerAttackPosition() {
    const position = this.#playerAttackPosition;
    this.#playerAttackPosition = null;

    return position;
  }

  getPlayerShipPositions() {
    return this.#playerShipPositions;
  }

  get playerAttackPosition() {
    return this.#playerAttackPosition;
  }

  get playerShipPositions() {
    return this.#playerShipPositions;
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
   * Attatches handlers depening on grid id.
   *
   * @param {HTMLElement} gridContainer - The grid DOM element.
   * @param {Function} verifyShipPlacementFn - Dependency Injection.
   */
  addGridClickListeners(gridContainer, verifyShipPlacementFn) {
    const isShipPlacementGrid = gridContainer.id === "shipPlacement";
    const isOpponentGrid = gridContainer.id === "computer-grid";

    if (!isShipPlacementGrid && !isOpponentGrid) return;

    const handler = isShipPlacementGrid
      ? this.handleRecordShipClick.bind(this)
      : this.handleRecordAttackClick.bind(this);

    for (let row = 0; row < Gameboard.BOARD_ROWS; row++) {
      for (let col = 0; col < Gameboard.BOARD_COLS; col++) {
        const cell = this.getCell(gridContainer, row, col);

        cell.addEventListener("click", () => {
          handler(row, col, verifyShipPlacementFn);
        });
      }
    }
  }

  /**
   * Handles a single click event for placing a ship on the gameboard.
   * Verifies the placement, records the ship position if valid, and advances to the next ship.
   *
   * @param {number} row - The row index of the clicked cell.
   * @param {number} col - The column index of the clicked cell.
   * @param {Function} verifyShipPlacementFn - Function to check if the ship can be placed at the given location.
   */
  handleRecordShipClick(row, col, verifyShipPlacementFn) {
    const isValidPlacement = verifyShipPlacementFn(
      row,
      col,
      this.currentShip,
      this.shipPlacementOrientation,
      Ship.VALID_LENGTHS[this.currentShip]
    );

    if (!isValidPlacement) return;

    this.recordShipPosition(row, col);

    this.markCellsAsPlaced(row, col);
    this.advanceToNextShip();
  }

  handleRecordAttackClick(row, col) {
    this.recordPlayerAttack(row, col);
  }

  /**
   * Adds a 'hit' or 'miss' class to a grid cell based on attack result.
   *
   * Selects the player's or computer's grid depending on `currentTurn`, then
   * marks the cell at (`row`, `col`) as hit or miss. If the cell doesn't exist, does nothing.
   *
   * @param {number} row - Row index of the target cell.
   * @param {number} col - Column index of the target cell.
   * @param {'player'|'computer'} currentTurn - Whose grid to update.
   * @param {boolean} isHit - True if attack was a hit; false if a miss.
   * @returns {void}
   */
  markCellBasedOnHit(row, col, currentTurn, isHit) {
    const grid =
      currentTurn == "player"
        ? document.querySelector("#player-grid")
        : document.querySelector("#computer-grid");

    const cell = this.getCell(grid, row, col);

    if (!cell) return;

    if (isHit) {
      cell.classList.add("hit");
      cell.classList.remove("miss");
    } else {
      cell.classList.add("miss");
      cell.classList.remove("hit");
    }
  }

  /**
   * Adds the 'placed' CSS class to all grid cells corresponding to the given row and column
   * in both the ship placement popup (#placeShipPopup) and the main player grid (#player-grid).
   * Assumes that valid row and column values are provided.
   *
   * @param {number} row - The row index of the cells to mark.
   * @param {number} col - The column index of the cells to mark.
   */
  markCellsAsPlaced(row, col) {
    const placeShipPopup = document.querySelector("#placeShipPopup");
    const playerGrid = document.querySelector("#player-grid");

    const popupCells = placeShipPopup
      ? this.getCellGroup(placeShipPopup, row, col)
      : [];
    const playerCells = playerGrid
      ? this.getCellGroup(playerGrid, row, col)
      : [];

    const allCells = [...popupCells, ...playerCells];

    for (const cell of allCells) {
      cell.classList.add("placed");
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
   * It also attaches necessary event listeners for hover effects and click events.
   *
   * It is called when the user clicks a valid placement cell.
   * @returns {HTMLElement} The DOM element representing the popup (for possible later reference or removal).
   */
  createShipPopup(verifyShipPlacementFn) {
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
    this.addGridClickListeners(placementGridDiv, verifyShipPlacementFn);
    popup.append(placementGridDiv);

    // Blur Overlay
    const overlay = this.createBlurOverlay();
    overlay.id = "placeShipOverlay";
    overlay.append(popup);

    HTMLBody.append(overlay);

    return popup;
  }

  /**
   * Displays the winner announcement popup on the screen.
   *
   * This method creates a popup element containing winner information
   * and an overlay to blur the background. It appends the popup to the overlay.
   *
   * @param {string} winner - The name or identifier of the winner to display.
   */
  displayWinner(winner) {
    const popup = this.createWinnerPopup(winner);
    const overlay = this.createBlurOverlay();

    overlay.append(popup);
  }

  /**
   * Creates a popup element displaying the winner's name.
   *
   * This method generates a <div> element with a header (<h1>) containing
   * the provided winner's name. The popup is assigned the ID "winnerPopup".
   *
   * @param {string} winner - The name or identifier of the winner.
   * @returns {HTMLDivElement} The DOM element representing the winner popup.
   */
  createWinnerPopup(winner) {
    const popup = document.createElement("div");
    const header = document.createElement("h1");

    header.textContent = `${winner} Won!`;

    popup.append(header);
    popup.id = "winnerPopup";

    return popup;
  }

  createPlayAgainButton() {
    const button = document.createElement("button");

    button.textContent = "Play Again";

    return button;
  }

  /**
   * Creates and appends a blur overlay to the document body.
   *
   * This method generates a <div> element with the class "blurOverlay",
   * appends it to the <body>, and returns the overlay element.
   * The overlay is typically used to dim or blur the background
   * when displaying modal content like a winner popup.
   *
   * @returns {HTMLDivElement} The DOM element representing the blur overlay.
   */
  createBlurOverlay() {
    const HTMLBody = document.querySelector("body");
    const overlay = document.createElement("div");

    overlay.classList.add("blurOverlay");

    HTMLBody.append(overlay);

    return overlay;
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
