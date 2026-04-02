const { updateAdStatus } = require("../api/adApi");

describe("updateAdStatus", () => {
  it("should throw for invalid status", () => {
    expect(() => updateAdStatus("ad-123", "DELETED")).toThrow("상태는");
  });
});
