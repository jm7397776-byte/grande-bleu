const { updateKeywordStatus } = require("../api/keywordApi");

describe("updateKeywordStatus", () => {
  it("should throw for invalid status", () => {
    expect(() => updateKeywordStatus("kw-123", "DELETED")).toThrow("상태는");
  });
});
