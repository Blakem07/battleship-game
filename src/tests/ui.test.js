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

  let gridContainer;

  beforeEach(() => {
    ui = new UI();

    createCellMock = jest.fn(() => document.createElement("div"));

    rows = Gameboard.BOARD_ROWS; // 10
    cols = Gameboard.BOARD_COLS; // 10

    gridContainer = document.createElement("div");
  });
  afterEach(() => {
    jest.restoreAllMocks();
  });

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

  test("UI.createCell element returns a div element.", () => {
    const cell = ui.createCell(0, 0);

    expect(cell instanceof HTMLElement).toBe(true);
  });
});
