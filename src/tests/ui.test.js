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
  });
  afterEach(() => {
    jest.restoreAllMocks();
  });

  // Tests for populate grid

  test("UI.populateGrid calls createCell for the correct amount rows and cols.", () => {
    ui.populateGrid(gridContainer, {
      row: rows,
      col: cols,
      createCell: createCellMock,
    });

    expect(createCellMock).toHaveBeenCalledTimes(rows * cols);
    expect(createCellMock).toHaveBeenCalledWith(0, 0); // First
    expect(createCellMock).toHaveBeenCalledWith(rows - 1, cols - 1); // Last
  });

  test("UI.populateGrid has the grid recieve the correct number of row elements.", () => {
    ui.populateGrid(gridContainer, {
      row: rows,
      col: cols,
      createCell: createCellMock,
    });

    expect(gridContainer.children.length).toEqual(rows);
  });

  test("UI.populateGrid has the grid recieve the correct number of rows and columns", () => {
    ui.populateGrid(gridContainer, {
      row: rows,
      col: cols,
      createCell: createCellMock,
    });

    expect(gridContainer.children.length).toEqual(rows);

    Array.from(gridContainer.children).forEach((row) => {
      expect(row.children.length).toEqual(cols);
    });
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
    ui.populateGrid(gridContainer, {
      row: rows,
      col: cols,
      createCell: createCellMock,
    });

    const callback = placeShipMock;

    ui.addGridClickListeners(gridContainer, callback);

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const event = new MouseEvent("click", { bubbles: true });
        gridContainer.children[row].children[col].dispatchEvent(event);
      }
    }

    expect(callback).toHaveBeenCalledTimes(rows * cols);
    expect(callback).toHaveBeenCalledWith(0, 0);
    expect(callback).toHaveBeenCalledWith(rows - 1, cols - 1);
  });

  test("UI.addGridHoverListeners delegates hover effects to all cells within a grid container.", () => {
    const gridContainer = document.createElement("div");

    ui.populateGrid(gridContainer, {
      row: Gameboard.BOARD_ROWS,
      col: Gameboard.BOARD_COLS,
      createCell: ui.createCell,
    });

    ui.addGridHoverListeners(gridContainer);

    for (let row = 0; row < Gameboard.BOARD_ROWS; row++) {
      for (let col = 0; col < Gameboard.BOARD_COLS; col++) {
        const cell = gridContainer.children[row].children[col];

        const enterCellEvent = new MouseEvent("mouseenter", { bubbles: true });
        const leaveCellEvent = new MouseEvent("mouseleave", { bubbles: true });

        cell.dispatchEvent(enterCellEvent);
        expect(Array.from(cell.classList)).toContain("hover-effect");

        cell.dispatchEvent(leaveCellEvent);
        expect(Array.from(cell.classList)).not.toContain("hover-effect");
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

  test.skip("UI.createShipPopup renders grid cells and delegates placeShip click events", () => {
    ui.createShipPopup();

    // Check grid population
    expect(populateGridSpy).toHaveBeenCalledTimes(1);
    expect(createCellSpy).toHaveBeenCalledTimes(rows * cols);
    expect(createCellSpy).toHaveBeenCalledWith(0, 0); // First
    expect(createCellSpy).toHaveBeenCalledWith(rows - 1, cols - 1); // Last

    // Check event delegation
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

  // Tests for addSwitchClickListener

  test("UI.addSwitchClickListener inputs call calls the orientation setter.", () => {
    const { horizontalInput, verticalInput } = createSwitchMock();

    ui.addSwitchClickListener(verticalInput);
    ui.addSwitchClickListener(horizontalInput);

    verticalInput.dispatchEvent(new Event("click"));
    expect(ui.shipPlacementOrientation).toEqual("vertical"); // Default is horizontal

    horizontalInput.dispatchEvent(new Event("click"));
    expect(ui.shipPlacementOrientation).toEqual("horizontal");

    expect(orientationSetterSpy).toHaveBeenCalledTimes(2);
  });
});
