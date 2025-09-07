/**
 * @jest-environment jsdom
 */

import Gameboard from "../classes/Gameboard.js";
import UI from "../classes/UI.js";

describe("UI Class Tests", () => {
  let ui;

  let createCellMock;

  let rows;
  let cols;
  let VALID_ROW;
  let VALID_COL;

  let gridContainer;

  beforeEach(() => {
    ui = new UI();

    createCellMock = jest.fn(() => document.createElement("div"));

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
});
