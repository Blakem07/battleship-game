import { UI, GameController, Player, Computer, Gameboard } from "./classes";

/**
 * Main app setup function.
 * Initializes players, game controller, and UI.
 * Responsible for bootstrapping game state and rendering the grids.
 */
function App() {
  const { playerBoard, computerBoard } = setupBoards();
  const { player, computer } = setupPlayers(playerBoard, computerBoard);
  const gameController = setupGameController();
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

export default App;
