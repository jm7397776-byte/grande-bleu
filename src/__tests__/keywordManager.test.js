const {
  createKeyword,
  generateKeywordSuggestions,
  calculateBidRecommendation,
  adjustBids,
} = require("../keyword/keywordManager");

describe("createKeyword", () => {
  it("should create a keyword with defaults", () => {
    const kw = createKeyword({ keyword: "제주 요트투어" });
    expect(kw.keyword).toBe("제주 요트투어");
    expect(kw.matchType).toBe("exact");
    expect(kw.bid).toBe(200);
    expect(kw.groupName).toBe("기본그룹");
    expect(kw.status).toBe("active");
  });

  it("should accept custom bid and match type", () => {
    const kw = createKeyword({
      keyword: "요트대여",
      matchType: "broad",
      bid: 1500,
      groupName: "차터그룹",
    });
    expect(kw.matchType).toBe("broad");
    expect(kw.bid).toBe(1500);
    expect(kw.groupName).toBe("차터그룹");
  });

  it("should throw when keyword is missing", () => {
    expect(() => createKeyword({})).toThrow("키워드는 필수");
  });

  it("should throw for invalid match type", () => {
    expect(() =>
      createKeyword({ keyword: "test", matchType: "invalid" }),
    ).toThrow("매치타입은");
  });

  it("should throw when bid is below minimum", () => {
    expect(() =>
      createKeyword({ keyword: "test", bid: 50 }),
    ).toThrow("최소 입찰가");
  });

  it("should throw when bid exceeds maximum", () => {
    expect(() =>
      createKeyword({ keyword: "test", bid: 5000 }),
    ).toThrow("최대 입찰가");
  });
});

describe("generateKeywordSuggestions", () => {
  it("should generate core and extended keywords", () => {
    const suggestions = generateKeywordSuggestions();
    expect(suggestions.core.length).toBeGreaterThan(0);
    expect(suggestions.extended.length).toBeGreaterThan(0);
    expect(suggestions.total).toBe(
      suggestions.core.length + suggestions.extended.length,
    );
  });

  it("should include area + service combinations", () => {
    const suggestions = generateKeywordSuggestions();
    expect(suggestions.core).toContain("제주 요트투어");
  });

  it("should include modifier combinations", () => {
    const suggestions = generateKeywordSuggestions();
    expect(suggestions.extended).toContain("요트투어 가격");
  });
});

describe("calculateBidRecommendation", () => {
  it("should recommend bid for medium competition", () => {
    const rec = calculateBidRecommendation("요트투어", "medium");
    expect(rec.recommendedBid).toBeGreaterThanOrEqual(200);
    expect(rec.recommendedBid).toBeLessThanOrEqual(3000);
  });

  it("should recommend lower bid for low competition", () => {
    const low = calculateBidRecommendation("요트투어", "low");
    const high = calculateBidRecommendation("요트투어", "high");
    expect(low.recommendedBid).toBeLessThan(high.recommendedBid);
  });

  it("should throw for invalid competition level", () => {
    expect(() =>
      calculateBidRecommendation("test", "extreme"),
    ).toThrow("경쟁도는");
  });
});

describe("adjustBids", () => {
  it("should increase bid for high-performing keywords", () => {
    const keywords = [createKeyword({ keyword: "제주 요트투어", bid: 1000 })];
    const perfData = {
      "제주 요트투어": { ctr: 8, conversionRate: 5, cpa: 5000 },
    };
    const adjusted = adjustBids(keywords, perfData);
    expect(adjusted[0].adjustment).toBe("인상");
    expect(adjusted[0].bid).toBeGreaterThan(1000);
  });

  it("should decrease bid for low-performing keywords", () => {
    const keywords = [createKeyword({ keyword: "요트대여", bid: 1000 })];
    const perfData = {
      "요트대여": { ctr: 0.5, conversionRate: 0, cpa: 50000 },
    };
    const adjusted = adjustBids(keywords, perfData);
    expect(adjusted[0].adjustment).toBe("인하");
    expect(adjusted[0].bid).toBeLessThan(1000);
  });

  it("should maintain bid when no performance data", () => {
    const keywords = [createKeyword({ keyword: "신규키워드", bid: 500 })];
    const adjusted = adjustBids(keywords, {});
    expect(adjusted[0].adjustment).toBe("유지");
  });
});
