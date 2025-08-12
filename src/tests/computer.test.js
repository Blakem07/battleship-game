import Computer from "../classes/Computer";

test("Computer is intialized with an instance of player.", () => {
  const mockPlayer = {};
  const computer = new Computer(mockPlayer);

  expect(computer.player).toBe(mockPlayer);
});

// Tests for attack method

test("Computer.randomAttack method calls player.attack with random values.", () => {
  const mockPlayer = {attack: jest.fn()};
  const computer = new Computer();

  randomNumber =
});
