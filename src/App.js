import { UI, GameController, Player, Computer, Gameboard } from "./classes";

/**
 * Main app setup function.
 * Initializes players, game controller, and UI.
 * Responsible for bootstrapping game state and rendering the grids.
 */
function App() {
  const { playerBoard, computerBoard } = setupBoards();
  const { player, computer } = setupPlayers(playerBoard, computerBoard);
  const gameController = setupGameController(player, computer);
  const ui = setupUI();

  ui.createShipPopup(
    player.placeShip.bind(player),
    playerBoard.verifyShipPlacement.bind(playerBoard)
  );
  renderGrids(ui);

  ui.displayWinner("Player");
}

/**
 * Creates and initializes gameboard instances for the player and computer.
 *
 * @returns {Object} An object containing the player's and computer's gameboards.
 */
function setupBoards() {
  const playerBoard = new Gameboard();
  const computerBoard = new Gameboard();

  return { playerBoard, computerBoard };
}

/**
 * Initializes player-related objects with their gameboards.
 *
 * @param {Gameboard} playerBoard - Gameboard instance for the human player
 * @param {Gameboard} computerBoard - Gameboard instance for the computer player
 * @returns {Object} An object containing the player and computer instances.
 */
function setupPlayers(playerBoard, computerBoard) {
  const player = new Player(playerBoard);
  const computerPlayer = new Player(computerBoard);
  const computer = new Computer(computerPlayer);

  return { player, computer };
}

/**
 * Creates and initializes the GameController instance.
 *
 * @returns {GameController} A new GameController object.
 */
function setupGameController() {
  const gameController = new GameController();

  return gameController;
}

/**
 * Creates and initializes the UI instance.
 *
 * @returns {UI} A new UI object responsible for managing the user interface.
 */
function setupUI() {
  const ui = new UI();

  return ui;
}

/**
 * Renders the player and computer grids in the DOM using the provided UI instance.
 *
 * Uses the default 10x10 Battleship board dimensions defined by the Gameboard class.
 * Each grid is populated with cells created by the UI's createCell method.
 *
 * @param {UI} uiInstance - The UI object responsible for DOM manipulation.
 */
function renderGrids(uiInstance) {
  const defaultGridSetup = {
    row: Gameboard.BOARD_ROWS,
    col: Gameboard.BOARD_COLS,
    createCell: uiInstance.createCell,
  };

  uiInstance.populateGrid(uiInstance.playerGrid, defaultGridSetup);
  uiInstance.populateGrid(uiInstance.computerGrid, defaultGridSetup);
}

export default App;
