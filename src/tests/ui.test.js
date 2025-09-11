/**
 * @jest-environment jsdom
 */

import Gameboard from "../classes/Gameboard.js";
import UI from "../classes/UI.js";

describe("UI Class Tests", () => {
  let ui;

  let orientationSetterSpy;
  let populateGridSpy;
  let createCellSpy;
  let addGridClickListenersSpy;

  let createSwitchMock;
  let createCellMock;
  let placeShipMock;

  let rows;
  let cols;
  let VALID_ROW;
  let VALID_COL;

  let gridContainer;
  let gridOptions; // Used in ui.populateGrid()

  let horizontalEdgeCells;
  let initialCellPositionsVertical;
  let verticalEdgeCells;

  beforeEach(() => {
    ui = new UI();

    orientationSetterSpy = jest.spyOn(ui, "shipPlacementOrientation", "set");
    populateGridSpy = jest.spyOn(ui, "populateGrid");
    createCellSpy = jest.spyOn(ui, "createCell");
    addGridClickListenersSpy = jest.spyOn(ui, "addGridClickListeners");

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

    rows = Gameboard.BOARD_ROWS; // 10
    cols = Gameboard.BOARD_COLS; // 10
    VALID_ROW = 0;
    VALID_COL = 0;

    gridContainer = document.createElement("div");
    gridOptions = { row: rows, col: cols, createCell: ui.createCell };

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

    const callback = placeShipMock;

    ui.addGridClickListeners(gridContainer, callback);

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const event = new MouseEvent("click", { bubbles: true });
        const cell = ui.getCell(gridContainer, row, col);

        cell.dispatchEvent(event);

        // Assert callback was called with expected row and col
        expect(callback).toHaveBeenCalledWith(row, col);
      }
    }

    expect(callback).toHaveBeenCalledTimes(rows * cols);
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
    ui.createShipPopup(placeShipMock);

    // Check grid population
    expect(populateGridSpy).toHaveBeenCalledTimes(1);
    expect(createCellSpy).toHaveBeenCalledTimes(rows * cols);
    expect(createCellSpy).toHaveBeenCalledWith(0, 0); // First
    expect(createCellSpy).toHaveBeenCalledWith(rows - 1, cols - 1); // Last

    // Check event
    expect(addGridClickListenersSpy).toHaveBeenCalledTimes(1);
    expect(addGridClickListenersSpy).toHaveBeenCalledWith(
      expect.anything(),
      expect.any(Function)
    );
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
