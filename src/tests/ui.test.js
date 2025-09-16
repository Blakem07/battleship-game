/**
 * @jest-environment jsdom
 */

import Ship from "../classes/Ship.js";
import Gameboard from "../classes/Gameboard.js";
import UI from "../classes/UI.js";

import { validShipPositions } from "../classes/constants.js";

describe("UI Class Tests", () => {
  let ui;

  let orientationSetterSpy;
  let populateGridSpy;
  let createCellSpy;
  let addGridClickListenersSpy;
  let closeShipPopupSpy;
  let markCellsAsPlacedSpy;
  let advanceToNextShipSpy;

  let createSwitchMock;
  let createCellMock;
  let placeShipMock;
  let verifyShipPlacementMock;

  let rows;
  let cols;
  let VALID_ROW;
  let VALID_COL;

  let gridContainer;
  let gridOptions; // Used in ui.populateGrid()
  let createPlayerGrid;

  let horizontalEdgeCells;
  let initialCellPositionsVertical;
  let verticalEdgeCells;

  beforeEach(() => {
    ui = new UI();

    orientationSetterSpy = jest.spyOn(ui, "shipPlacementOrientation", "set");
    populateGridSpy = jest.spyOn(ui, "populateGrid");
    createCellSpy = jest.spyOn(ui, "createCell");
    addGridClickListenersSpy = jest.spyOn(ui, "addGridClickListeners");
    closeShipPopupSpy = jest.spyOn(ui, "closeShipPopup");
    markCellsAsPlacedSpy = jest.spyOn(ui, "markCellsAsPlaced");
    advanceToNextShipSpy = jest.spyOn(ui, "advanceToNextShip");

    createSwitchMock = jest.fn(() => {
      const horizontalInput = document.createElement("input");
      horizontalInput.type = "radio";
      horizontalInput.name = "orientation";

      const verticalInput = document.createElement("input");
      verticalInput.type = "radio";
      verticalInput.name = "orientation";

      return { horizontalInput, verticalInput };
    });
    createCellMock = jest.fn(() => document.createElement("div"));
    placeShipMock = jest.fn();
    verifyShipPlacementMock = jest.fn(() => true);

    rows = Gameboard.BOARD_ROWS; // 10
    cols = Gameboard.BOARD_COLS; // 10
    VALID_ROW = 0;
    VALID_COL = 0;

    gridContainer = document.createElement("div");
    gridOptions = { row: rows, col: cols, createCell: ui.createCell };
    createPlayerGrid = () => {
      const grid = document.createElement("div");
      grid.id = "player-grid";
      ui.populateGrid(grid, gridOptions);
      document.body.appendChild(grid);
      return grid;
    };

    horizontalEdgeCells = [
      { row: 0, col: 0 }, // Top-left corner
      { row: 0, col: 6 }, // Top, near right edge for length 5 segment
      { row: 4, col: 0 }, // Middle-left edge
      { row: 4, col: 6 }, // Middle-right edge
      { row: 9, col: 0 }, // Bottom-left corner
      { row: 9, col: 6 }, // Bottom-right edge
    ];

    initialCellPositionsVertical = [
      { row: 1, col: 0 },
      { row: 2, col: 0 },
      { row: 3, col: 0 },
      { row: 1, col: 5 },
      { row: 2, col: 5 },
      { row: 3, col: 5 },
    ];

    verticalEdgeCells = [
      { row: 7, col: 0 }, // Starts 3 rows from bottom — highlight length 5 goes past bottom edge
      { row: 8, col: 3 }, // Starts 2 rows from bottom — highlight length 5 goes past bottom edge
      { row: 9, col: 5 }, // Starts at last row — highlight length 5 overflows heavily
      { row: 7, col: 7 }, // Near bottom-right edge, overflow expected
      { row: 8, col: 9 }, // Bottom-right corner, overflow expected
    ];
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
    document.body.innerHTML = "";
  });

  // Tests for recordPlayerAttack

  test("UI.recordPlayerAttack stores the attack position using the correct format", () => {
    ui.recordPlayerAttack(VALID_ROW, VALID_COL);

    expect(ui.playerAttackPosition).toEqual({
      row: VALID_COL,
      col: VALID_COL,
    });
  });

  // Tests for recordShipPosition

  test("UI.recordShipPosition stores ship positions using the correct format", () => {
    ui.recordShipPosition(
      VALID_ROW, // 0
      VALID_COL // 0
    );

    expect(ui.playerShipPositions).toEqual([
      {
        row: 0,
        col: 0,
        shipName: Ship.VALID_NAMES[0],
        direction: "horizontal",
      },
    ]);
  });

  // Tests for advanceToNextShip

  test("UI.advanceToNextShip increments ui.#currentShipIndex and sets to null at end.", () => {
    ui.createShipPopup(); // Needed for header text update

    for (let count = 0; count <= Ship.VALID_NAMES.length; count++) {
      if (count != Ship.VALID_NAMES.length) {
        expect(ui.currentShipIndex).toEqual(count);
      } else {
        expect(ui.currentShipIndex).toBeNull();
      }

      ui.advanceToNextShip();
    }

    expect(closeShipPopupSpy).toHaveBeenCalledTimes(1);
  });

  test("UI.advanceToNextShip increments cell highlight count to match the current ship length and sets to 1 at the end.", () => {
    ui.createShipPopup();

    for (let count = 0; count < Ship.VALID_NAMES.length; count++) {
      const currentShip = Ship.VALID_NAMES[count];
      const shipLength = Ship.VALID_LENGTHS[currentShip];

      expect(ui.cellHighlightCount).toEqual(shipLength);

      ui.advanceToNextShip();
    }

    expect(ui.cellHighlightCount).toEqual(1);
  });

  test("UI.advanceToNextShip sets createShipPopup ship selection text to the name of the current ship being placed", () => {
    ui.createShipPopup();

    const expectedHeaderText = Ship.VALID_NAMES.map((name) => {
      return `Place your ${name}`;
    });

    const shipSelectionDiv = document.querySelector("#shipSelection");
    let text = shipSelectionDiv.textContent;

    expect(text).toEqual(expectedHeaderText[0]);

    for (let count = 1; count < Ship.VALID_NAMES.length; count++) {
      ui.advanceToNextShip();

      text = shipSelectionDiv.textContent;

      expect(text).toEqual(expectedHeaderText[count]);
    }
  });

  // Tests for closePlaceShipPopup

  test("UI.closeShipPopup closes the ship popup used to place ships at the start of the game.", () => {
    ui.createShipPopup(placeShipMock, verifyShipPlacementMock);
    const placeShipOverlay = document.querySelector("#placeShipOverlay");

    ui.closeShipPopup();

    const isPopupHidden = placeShipOverlay.style.display === "none";

    expect(isPopupHidden).toBe(true);
  });

  // Tests for get currentShip

  test("UI.currentShip getter returns the correct ship.", () => {
    for (let count = 0; count < Ship.VALID_NAMES.length; count++) {
      expect(ui.currentShip).toEqual(Ship.VALID_NAMES[count]);

      ui.advanceToNextShip();
    }
  });

  // Tests for populate grid

  test("UI.populateGrid calls createCell for the correct amount rows and cols.", () => {
    ui.populateGrid(gridContainer, gridOptions);

    expect(createCellSpy).toHaveBeenCalledTimes(rows * cols);
    expect(createCellSpy).toHaveBeenCalledWith(0, 0); // First
    expect(createCellSpy).toHaveBeenCalledWith(rows - 1, cols - 1); // Last
  });

  test("UI.populateGrid fills the grid with the correct number of cells.", () => {
    ui.populateGrid(gridContainer, gridOptions);

    const amountOfCells = gridContainer.children.length;

    expect(amountOfCells).toEqual(rows * cols);
  });

  // Tests for create cell

  test("UI.createCell element returns a div element.", () => {
    const cell = ui.createCell(VALID_ROW, VALID_COL);

    expect(cell instanceof HTMLElement).toBe(true);
  });

  test("UI.createCell element has the correct data row/col", () => {
    const cell = ui.createCell(VALID_ROW, VALID_COL);

    expect(cell.dataset.row).toEqual(`${VALID_ROW}`);
    expect(cell.dataset.col).toEqual(`${VALID_COL}`);
  });

  test("UI.createCell element has the correct class.", () => {
    const cell = ui.createCell(VALID_ROW, VALID_COL);

    expect(cell.classList[0]).toEqual("grid-cell");
  });

  // Tests for addGridClickListeners

  test("UI.addGridClickListeners each cell calls the expected callback.", () => {
    ui.populateGrid(gridContainer, gridOptions);
    gridContainer.id = "shipPlacement";

    const callback = placeShipMock;

    ui.addGridClickListeners(
      gridContainer,
      placeShipMock,
      verifyShipPlacementMock
    );

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const event = new MouseEvent("click", { bubbles: true });
        const cell = ui.getCell(gridContainer, row, col);

        cell.dispatchEvent(event);
      }
    }

    expect(callback).toHaveBeenCalledTimes(rows * cols);
  });

  // Tests for handlePlaceShipClick

  test("UI.handlePlaceShipClick calls placeShip correctly", () => {
    ui.populateGrid(gridContainer, gridOptions);
    gridContainer.id = "shipPlacement";
    const callback = placeShipMock;

    ui.addGridClickListeners(
      gridContainer,
      placeShipMock,
      verifyShipPlacementMock
    );

    const cell = ui.getCell(gridContainer, VALID_ROW, VALID_COL);
    const event = new MouseEvent("click", { bubbles: true });
    cell.dispatchEvent(event);

    expect(callback).toHaveBeenCalledWith(
      VALID_ROW,
      VALID_COL,
      expect.stringMatching(new RegExp(`^(${Ship.VALID_NAMES.join("|")})$`)),
      expect.stringMatching(/^(horizontal|vertical)$/)
    );
  });

  test("UI.handlePlaceShipClick placeShip does not proceed when verifyShipPlacement returns false", () => {
    ui.populateGrid(gridContainer, gridOptions);
    gridContainer.id = "shipPlacement";

    verifyShipPlacementMock.mockReturnValue(false);

    ui.addGridClickListeners(
      gridContainer,
      placeShipMock,
      verifyShipPlacementMock
    );

    const cell = ui.getCell(gridContainer, VALID_ROW, VALID_COL);
    const event = new MouseEvent("click", { bubbles: true });
    cell.dispatchEvent(event);

    expect(verifyShipPlacementMock).toHaveBeenCalledTimes(1);
    expect(placeShipMock).not.toHaveBeenCalled();
  });

  test("UI.handlePlaceShipClick placeShip proceeds when verifyShipPlacement returns true", () => {
    ui.populateGrid(gridContainer, gridOptions);
    gridContainer.id = "shipPlacement";

    verifyShipPlacementMock.mockReturnValue(true);

    ui.addGridClickListeners(
      gridContainer,
      placeShipMock,
      verifyShipPlacementMock
    );

    const cell = ui.getCell(gridContainer, VALID_ROW, VALID_COL);
    const event = new MouseEvent("click", { bubbles: true });
    cell.dispatchEvent(event);

    expect(verifyShipPlacementMock).toHaveBeenCalledTimes(1);
    expect(placeShipMock).toHaveBeenCalledTimes(1);
    expect(markCellsAsPlacedSpy).toHaveBeenCalledTimes(1);
    expect(advanceToNextShipSpy).toHaveBeenCalledTimes(1);
  });

  // Tests for markCellsAsPlaced

  test("UI.markCellsAsPlaced adds the 'placed' class to the shipPopup cells", () => {
    ui.createShipPopup(placeShipMock, verifyShipPlacementMock);

    const grid = document.querySelector("#placeShipPopup");
    const playerGrid = createPlayerGrid(); // Required because markCellsAsPlaced also affects #player-grid

    ui.markCellsAsPlaced(VALID_ROW, VALID_COL);

    const cellGroup = ui.getCellGroup(grid, VALID_ROW, VALID_COL);

    for (const cell of cellGroup) {
      const isMarked = cell.classList.contains("placed");

      expect(isMarked).toBe(true);
    }
  });

  test("UI.markCellsAsPlaced adds the 'placed' class to the player-grid", () => {
    ui.createShipPopup(placeShipMock, verifyShipPlacementMock);

    const playerGrid = createPlayerGrid();

    ui.markCellsAsPlaced(VALID_ROW, VALID_COL);

    const cellGroup = ui.getCellGroup(playerGrid, VALID_ROW, VALID_COL);

    for (const cell of cellGroup) {
      const isMarked = cell.classList.contains("placed");

      expect(isMarked).toBe(true);
    }
  });

  test("UI.markCellsAsPlaced does not throw if a grid is missing", () => {
    ui.createShipPopup(placeShipMock, verifyShipPlacementMock);

    const grid = document.querySelector("#placeShipPopup");
    // Exclude the player grid

    expect(() => {
      ui.markCellsAsPlaced(VALID_ROW, VALID_COL);
    }).not.toThrow();

    const cellGroup = ui.getCellGroup(grid, VALID_ROW, VALID_COL);

    for (const cell of cellGroup) {
      const isMarked = cell.classList.contains("placed");

      expect(isMarked).toBe(true);
    }
  });

  // Tests for helper: getCell

  test("UI.getCell returns the correct cell", () => {
    ui.populateGrid(gridContainer, gridOptions);

    const firstCell = gridContainer.children[0];
    const lastCell =
      gridContainer.children[Gameboard.BOARD_ROWS * Gameboard.BOARD_COLS - 1];

    expect(ui.getCell(gridContainer, 0, 0)).toBe(firstCell);
    expect(
      ui.getCell(
        gridContainer,
        Gameboard.BOARD_ROWS - 1,
        Gameboard.BOARD_COLS - 1
      )
    ).toBe(lastCell);
  });

  // Tests for helper: getCellGroup

  test("UI.getCellGroup returns the correct horizontal cell group starting at given row and column.", () => {
    ui.populateGrid(gridContainer, gridOptions);

    const initialCellPositions = [
      { row: 0, col: 0 },
      { row: 0, col: 5 },
      { row: 4, col: 0 },
      { row: 4, col: 5 },
      { row: 9, col: 0 },
      { row: 9, col: 5 },
    ];

    initialCellPositions.forEach((position) => {
      const row = position.row;
      const col = position.col;

      const cellGroup = ui.getCellGroup(gridContainer, row, col);

      expect(cellGroup.length).toEqual(ui.cellHighlightCount);

      cellGroup.forEach((cell, index) => {
        const location = col + index; // Moves horizontally from starting cell

        const expectedCell = gridContainer.querySelector(
          `.grid-cell[data-row="${row}"][data-col="${location}"]`
        );
        expect(cell).toEqual(expectedCell);
      });
    });
  });

  test("UI.getCellGroup handles horizontal edge cases correctly.", () => {
    ui.populateGrid(gridContainer, gridOptions);

    horizontalEdgeCells.forEach((position) => {
      const row = position.row;
      const col = position.col;

      const spaceLeft = Gameboard.BOARD_COLS - col;
      const expectedLength = Math.min(ui.cellHighlightCount, spaceLeft);

      const cellGroup = ui.getCellGroup(gridContainer, row, col);

      expect(cellGroup.length).toEqual(expectedLength);
    });
  });

  test("UI.getCellGroup returns the correct vertical cell group starting at the given row and column", () => {
    ui.shipPlacementOrientation = "vertical"; // Toggles vertical

    ui.populateGrid(gridContainer, gridOptions);

    initialCellPositionsVertical.forEach((position) => {
      const row = position.row;
      const col = position.col;

      const cellGroup = ui.getCellGroup(gridContainer, row, col);

      expect(cellGroup.length).toEqual(ui.cellHighlightCount);

      cellGroup.forEach((cell, index) => {
        const location = row + index; // Moves vertically from starting cell

        const expectedCell = gridContainer.querySelector(
          `.grid-cell[data-row="${location}"][data-col="${col}"]`
        );
        expect(cell).toEqual(expectedCell);
      });
    });
  });

  test("UI.getCellGroup handles vertical edge cases correctly.", () => {
    ui.shipPlacementOrientation = "vertical";

    ui.populateGrid(gridContainer, gridOptions);

    verticalEdgeCells.forEach((position) => {
      const row = position.row;
      const col = position.col;

      const spaceLeft = Gameboard.BOARD_ROWS - row;
      const expectedLength = Math.min(ui.cellHighlightCount, spaceLeft);

      const cellGroup = ui.getCellGroup(gridContainer, row, col);

      expect(cellGroup.length).toEqual(expectedLength);
    });
  });

  // Tests for addGridHoverListeners

  test("UI.addGridHoverListeners delegates hover effects to all cells within a grid container.", () => {
    ui.populateGrid(gridContainer, gridOptions);

    ui.addGridHoverListeners(gridContainer);

    for (let row = 0; row < Gameboard.BOARD_ROWS; row++) {
      for (let col = 0; col < Gameboard.BOARD_COLS; col++) {
        const cell = ui.getCell(gridContainer, row, col);

        const enterCellEvent = new MouseEvent("mouseenter", { bubbles: true });
        const leaveCellEvent = new MouseEvent("mouseleave", { bubbles: true });

        cell.dispatchEvent(enterCellEvent);
        expect(Array.from(cell.classList)).toContain("hover-effect");

        cell.dispatchEvent(leaveCellEvent);
        expect(Array.from(cell.classList)).not.toContain("hover-effect");
      }
    }
  });

  test("UI.addGridHoverListeners triggers horizontal hover effects correctly on grid cells", () => {
    ui.populateGrid(gridContainer, gridOptions);

    ui.addGridHoverListeners(gridContainer);

    ui.hoverableCellCount = 5;

    for (let row = 0; row < Gameboard.BOARD_ROWS; row++) {
      for (let col = 0; col < Gameboard.BOARD_COLS; col++) {
        const cell = ui.getCell(gridContainer, row, col);
        const cellGroup = ui.getCellGroup(gridContainer, row, col);

        const enterCellEvent = new MouseEvent("mouseenter", { bubbles: true });
        const leaveCellEvent = new MouseEvent("mouseleave", { bubbles: true });

        cell.dispatchEvent(enterCellEvent);
        cellGroup.forEach((cell) => {
          expect(cell.classList.contains("hover-effect")).toBe(true);
        });

        cell.dispatchEvent(leaveCellEvent);
        cellGroup.forEach((cell) => {
          expect(cell.classList.contains("hover-effect")).toBe(false);
        });
      }
    }
  });

  // Tests for createShipPopup

  test("UI.createShipPopup appends a pop up to the overlay then to the HTML doc.", () => {
    const HTMLBody = document.querySelector("body");
    const popup = ui.createShipPopup();
    const overlay = document.querySelector("#placeShipOverlay");

    const HTMLBodyChildren = Array.from(HTMLBody.children);
    const overlayChildren = Array.from(overlay.children);

    expect(HTMLBodyChildren).toContain(overlay);
    expect(overlayChildren).toContainEqual(popup);
    expect(popup.id).toEqual("placeShipPopup");
    expect(popup.classList).toContain("popup");
  });

  test("UI.createShipPopup creates a pop up div with the correct structure.", () => {
    const popup = ui.createShipPopup();

    const shipSelectionDiv = popup.querySelector("#shipSelection");
    const placementGridDiv = popup.querySelector("#shipPlacement");

    expect(shipSelectionDiv instanceof HTMLElement).toBe(true);
    expect(placementGridDiv instanceof HTMLElement).toBe(true);
  });

  test("UI.createShipPopup renders grid cells and attatches placeShip click events", () => {
    ui.createShipPopup(placeShipMock, verifyShipPlacementMock);

    // Check grid population
    expect(populateGridSpy).toHaveBeenCalledTimes(1);
    expect(createCellSpy).toHaveBeenCalledTimes(rows * cols);
    expect(createCellSpy).toHaveBeenCalledWith(0, 0); // First
    expect(createCellSpy).toHaveBeenCalledWith(rows - 1, cols - 1); // Last

    // Check event
    expect(addGridClickListenersSpy).toHaveBeenCalledTimes(1);
    expect(addGridClickListenersSpy).toHaveBeenCalledWith(
      expect.anything(),
      expect.any(Function),
      expect.any(Function)
    );
  });

  // Tests for createBlurOverlay

  test("UI.createBlurOverlay returns and appends the overlay to the DOM", () => {
    const overlay = ui.createBlurOverlay();

    expect(overlay instanceof HTMLDivElement).toBe(true);
    expect(overlay.classList).toContain("blurOverlay");

    const HTMLBody = document.querySelector("body");
    expect(HTMLBody.children).toContain(overlay);
  });

  // Tests for createOrientationSwitch

  test("UI.createOrientationSwitch returns div html element.", () => {
    const switchElement = ui.createOrientationSwitch();

    expect(switchElement instanceof HTMLElement).toBe(true);
    expect(switchElement.id).toEqual("orientationSwitch");
  });

  test("UI.createOrientationSwitch creates an element with the correct structure.", () => {
    const switchElement = ui.createOrientationSwitch();

    const switchElementChildren = Array.from(switchElement.children);
    const labels = switchElement.querySelectorAll("label");

    expect(switchElementChildren.length).toBeGreaterThan(0); // Fails if no children
    expect(labels.length).toBe(switchElementChildren.length);

    labels.forEach((label) => {
      const input = label.querySelector("input"); // Check that each label contains an input element
      expect(input).not.toBeNull();
    });
  });

  // Tests for addSwitchChangeListener

  test("UI.addSwitchChangeListener inputs call calls the orientation setter.", () => {
    const { horizontalInput, verticalInput } = createSwitchMock();

    ui.addSwitchChangeListener(verticalInput);
    ui.addSwitchChangeListener(horizontalInput);

    verticalInput.dispatchEvent(new Event("change"));
    expect(ui.shipPlacementOrientation).toEqual("vertical"); // Default is horizontal

    horizontalInput.dispatchEvent(new Event("change"));
    expect(ui.shipPlacementOrientation).toEqual("horizontal");

    expect(orientationSetterSpy).toHaveBeenCalledTimes(2);
  });
});
