const { add, subtract } = require("../index");

describe("add", () => {
  it("should add two numbers", () => {
    expect(add(1, 2)).toBe(3);
  });

  it("should handle negative numbers", () => {
    expect(add(-1, -2)).toBe(-3);
  });
});

describe("subtract", () => {
  it("should subtract two numbers", () => {
    expect(subtract(5, 3)).toBe(2);
  });

  it("should handle negative results", () => {
    expect(subtract(1, 5)).toBe(-4);
  });
});
