import { UI, GameController, Player, Computer, Gameboard } from "./classes";

/**
 * Main app setup function.
 * Initializes players, game controller, and UI.
 * Responsible for bootstrapping game state and rendering the grids.
 */
function App() {
  const { player, computer } = setupPlayers();
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

export default App;
