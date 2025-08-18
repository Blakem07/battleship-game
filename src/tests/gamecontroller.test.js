import GameController from "../classes/GameController";

test("GameController is initialized with references to Player1 and Computer.", () => {
  const mockPlayer = {};
  const mockComputer = {};

  const gameController = new GameController(mockPlayer, mockComputer);

  expect(gameController.player1).toBe(mockPlayer);
  expect(gameController.computer).toBe(mockComputer);
});
