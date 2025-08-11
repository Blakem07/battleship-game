import Player from "../classes/Player";
import Gameboard from "../classes/Gameboard";

test("Player object initializes with a reference to their gameboard.", () => {
  const gameboard = new Gameboard();
  const player = new Player(gameboard);

  expect(player.gameboard).toBe(gameboard);
});
