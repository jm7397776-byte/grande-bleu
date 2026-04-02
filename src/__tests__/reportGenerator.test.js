const {
  generateDailyReport,
  generateWeeklyReport,
  generateMonthlyReport,
} = require("../report/reportGenerator");

const sampleDailyData = {
  impressions: 8000,
  clicks: 300,
  conversions: 10,
  cost: 25000,
  revenue: 100000,
};

describe("generateDailyReport", () => {
  it("should generate a complete daily report", () => {
    const report = generateDailyReport("2026-04-01", sampleDailyData);
    expect(report.type).toBe("daily");
    expect(report.date).toBe("2026-04-01");
    expect(report.business).toBe("그랑블루요트");
    expect(report.metrics).toHaveProperty("ctr");
    expect(report.metrics).toHaveProperty("roas");
    expect(report.summary).toContain("일일 광고 성과 보고서");
  });

  it("should include budget information", () => {
    const report = generateDailyReport("2026-04-01", sampleDailyData);
    expect(report.budget.spent).toBe(25000);
    expect(report.budget.remaining).toBe(25000);
  });

  it("should throw when date is missing", () => {
    expect(() => generateDailyReport(null, sampleDailyData)).toThrow(
      "날짜는 필수",
    );
  });

  it("should include performance grade in summary", () => {
    const report = generateDailyReport("2026-04-01", sampleDailyData);
    expect(report.summary).toMatch(/[A-D]등급/);
  });
});

describe("generateWeeklyReport", () => {
  const weeklyData = Array.from({ length: 7 }, (_, i) => ({
    impressions: 5000 + i * 500,
    clicks: 200 + i * 20,
    conversions: 5 + i,
    cost: 20000 + i * 2000,
    revenue: 80000 + i * 10000,
  }));

  it("should generate a weekly report with 7 days", () => {
    const report = generateWeeklyReport("2026-03-25", "2026-03-31", weeklyData);
    expect(report.type).toBe("weekly");
    expect(report.dailyBreakdown).toHaveLength(7);
    expect(report.insights.totalDays).toBe(7);
  });

  it("should identify best and worst days", () => {
    const report = generateWeeklyReport("2026-03-25", "2026-03-31", weeklyData);
    expect(report.insights.bestDay).toHaveProperty("day");
    expect(report.insights.bestDay).toHaveProperty("roas");
    expect(report.insights.worstDay).toHaveProperty("day");
  });

  it("should aggregate total metrics", () => {
    const report = generateWeeklyReport("2026-03-25", "2026-03-31", weeklyData);
    expect(report.totalMetrics.impressions).toBeGreaterThan(0);
    expect(report.totalMetrics.clicks).toBeGreaterThan(0);
  });

  it("should throw when no data", () => {
    expect(() => generateWeeklyReport("2026-03-25", "2026-03-31", [])).toThrow(
      "주간 데이터가 필요",
    );
  });
});

describe("generateMonthlyReport", () => {
  const monthlyData = Array.from({ length: 4 }, (_, i) => ({
    impressions: 30000 + i * 5000,
    clicks: 1200 + i * 200,
    conversions: 30 + i * 5,
    cost: 150000 + i * 20000,
    revenue: 600000 + i * 100000,
  }));

  it("should generate a monthly report", () => {
    const report = generateMonthlyReport("2026-03", monthlyData);
    expect(report.type).toBe("monthly");
    expect(report.month).toBe("2026-03");
    expect(report.weeklyBreakdown).toHaveLength(4);
  });

  it("should include summary text", () => {
    const report = generateMonthlyReport("2026-03", monthlyData);
    expect(report.summary).toContain("월간 보고서");
    expect(report.summary).toContain("그랑블루요트");
  });

  it("should throw when no data", () => {
    expect(() => generateMonthlyReport("2026-03", [])).toThrow(
      "월간 데이터가 필요",
    );
  });
});
