/**
 * @jest-environment jsdom
 */

import Gameboard from "../classes/Gameboard.js";
import UI from "../classes/UI.js";

describe("UI Class Tests", () => {
  let ui;

  let createCellMock;
  let placeShipMock;

  let rows;
  let cols;
  let VALID_ROW;
  let VALID_COL;

  let gridContainer;

  beforeEach(() => {
    ui = new UI();

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
});
