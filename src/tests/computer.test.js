import Computer from "../classes/Computer";

test("Computer is intialized with an instance of player.", () => {
  const mockPlayer = {};
  const computer = new Computer(mockPlayer);

  expect(computer.player).toBe(mockPlayer);
});

// Tests for attack method

test("Computer.randomAttack method calls player.attack and returns its results.", () => {
  const mockPlayer = { attack: jest.fn().mockReturnValue("attack result") };
  const computer = new Computer(mockPlayer);
  const mockOpponent = {};

  jest
    .spyOn(computer, "getRandomInt")
    .mockReturnValueOnce(3)
    .mockReturnValueOnce(7);

  const result = computer.randomAttack(mockOpponent);

  expect(computer.getRandomInt).toHaveBeenCalledTimes(2);
  expect(computer.getRandomInt).toHaveBeenCalledWith(0, 10);
  expect(computer.player.attack).toHaveBeenCalledWith(mockOpponent, 3, 7);
  expect(result).toBe("attack result");
});

// Tests for getRandomInt

test("Computer.getRandomInt returns a number between two constraints.", () => {
  const computer = new Computer();

  const lowerLimit = 0;
  const upperLimit = 10;

  expect(computer.getRandomInt(upperLimit, lowerLimit)).toBeGreaterThan(
    lowerLimit
  );

  expect(computer.getRandomInt(upperLimit, lowerLimit)).toBeLessThan(
    upperLimit
  );
});
