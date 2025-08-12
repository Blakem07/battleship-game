import Computer from "../classes/Computer";

test("Computer is intialized with an instance of player.", () => {
  const mockPlayer = {};
  const computer = new Computer(mockPlayer);

  expect(computer.player).toBe(mockPlayer);
});
