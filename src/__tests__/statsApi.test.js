const { parseStatsResponse, formatDateForApi, getDateRange } = require("../api/statsApi");

describe("parseStatsResponse", () => {
  it("should parse valid API response", () => {
    const response = {
      data: [
        {
          impCnt: 10000,
          clkCnt: 500,
          ccnt: 15,
          salesAmt: 30000,
          revenueAmt: 150000,
          ctr: 5.0,
          cpc: 60,
          crto: 3.0,
        },
      ],
    };

    const result = parseStatsResponse(response);
    expect(result.impressions).toBe(10000);
    expect(result.clicks).toBe(500);
    expect(result.conversions).toBe(15);
    expect(result.cost).toBe(30000);
    expect(result.revenue).toBe(150000);
  });

  it("should return zeros for empty response", () => {
    const result = parseStatsResponse(null);
    expect(result.impressions).toBe(0);
    expect(result.clicks).toBe(0);
    expect(result.conversions).toBe(0);
  });

  it("should return zeros for empty data array", () => {
    const result = parseStatsResponse({ data: [] });
    expect(result.impressions).toBe(0);
  });
});

describe("formatDateForApi", () => {
  it("should format date as YYYY-MM-DD", () => {
    const result = formatDateForApi(new Date("2026-04-02"));
    expect(result).toBe("2026-04-02");
  });

  it("should pad single digit months and days", () => {
    const result = formatDateForApi(new Date("2026-01-05"));
    expect(result).toBe("2026-01-05");
  });
});

describe("getDateRange", () => {
  it("should return same date for today", () => {
    const { start, end } = getDateRange("today");
    expect(start).toBe(end);
  });

  it("should return same date for yesterday", () => {
    const { start, end } = getDateRange("yesterday");
    expect(start).toBe(end);
    expect(start).not.toBe(formatDateForApi(new Date()));
  });

  it("should return 7-day range for week", () => {
    const { start, end } = getDateRange("week");
    const diff = (new Date(end) - new Date(start)) / (1000 * 60 * 60 * 24);
    expect(diff).toBe(7);
  });

  it("should return ~30-day range for month", () => {
    const { start, end } = getDateRange("month");
    const diff = (new Date(end) - new Date(start)) / (1000 * 60 * 60 * 24);
    expect(diff).toBeGreaterThanOrEqual(28);
    expect(diff).toBeLessThanOrEqual(31);
  });
});
