import Gameboard from "../classes/Gameboard.js";
import UI from "../classes/UI.js";

describe("UI Class Tests", () => {
  let ui;

  beforeEach(() => {
    ui = new UI();
  });
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("UI.populateGrid calls createCell for the correct amount rows and cols.", () => {
    const createCellMock = jest.fn();

    const rows = Gameboard.BOARD_ROWS; // 10
    const cols = Gameboard.BOARD_COLS; // 10

    ui.populateGrid({ row: rows, col: cols, createCell: createCellMock });

    expect(createCellMock).toHaveBeenCalledTimes(rows * cols);
    expect(createCellMock).toHaveBeenCalledWith(0, 0); // First
    expect(createCellMock).toHaveBeenCalledWith(rows - 1, cols - 1); // Last
  });
});
