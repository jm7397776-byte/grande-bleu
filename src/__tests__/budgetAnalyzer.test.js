const {
  analyzeDailyPerformance,
  evaluatePerformance,
  calculateOptimalBudget,
  round,
} = require("../budget/budgetAnalyzer");

describe("round", () => {
  it("should round to 2 decimal places", () => {
    expect(round(3.14159)).toBe(3.14);
    expect(round(2.005)).toBe(2.01);
  });
});

describe("analyzeDailyPerformance", () => {
  const goodData = {
    impressions: 10000,
    clicks: 500,
    conversions: 15,
    cost: 30000,
    revenue: 150000,
  };

  it("should calculate all metrics correctly", () => {
    const result = analyzeDailyPerformance(goodData);
    expect(result.metrics.ctr).toBe(5);
    expect(result.metrics.conversionRate).toBe(3);
    expect(result.metrics.cpc).toBe(60);
    expect(result.metrics.cpa).toBe(2000);
    expect(result.metrics.roas).toBe(500);
  });

  it("should calculate budget utilization", () => {
    const result = analyzeDailyPerformance(goodData);
    expect(result.budget.daily).toBe(50000);
    expect(result.budget.spent).toBe(30000);
    expect(result.budget.remaining).toBe(20000);
    expect(result.budget.utilizationRate).toBe(60);
  });

  it("should evaluate performance grade", () => {
    const result = analyzeDailyPerformance(goodData);
    expect(result.status.grade).toBe("A");
  });

  it("should handle zero impressions", () => {
    const result = analyzeDailyPerformance({
      impressions: 0,
      clicks: 0,
      conversions: 0,
      cost: 0,
      revenue: 0,
    });
    expect(result.metrics.ctr).toBe(0);
    expect(result.metrics.conversionRate).toBe(0);
  });

  it("should throw when data is missing", () => {
    expect(() => analyzeDailyPerformance(null)).toThrow("일별 데이터가 필요");
  });
});

describe("evaluatePerformance", () => {
  it("should give A grade for excellent performance", () => {
    const result = evaluatePerformance(5, 3, 10000, 500);
    expect(result.grade).toBe("A");
    expect(result.strengths.length).toBe(4);
  });

  it("should give D grade for poor performance", () => {
    const result = evaluatePerformance(0.5, 0.1, 50000, 50);
    expect(result.grade).toBe("D");
    expect(result.issues.length).toBe(4);
  });

  it("should identify specific issues", () => {
    const result = evaluatePerformance(1, 3, 10000, 500);
    expect(result.issues.some((i) => i.includes("CTR"))).toBe(true);
  });
});

describe("calculateOptimalBudget", () => {
  it("should recommend budget based on historical data", () => {
    const historicalData = [
      { clicks: 100, cost: 10000, conversions: 5, revenue: 50000 },
      { clicks: 120, cost: 12000, conversions: 6, revenue: 60000 },
      { clicks: 80, cost: 8000, conversions: 4, revenue: 40000 },
    ];

    const result = calculateOptimalBudget(historicalData);
    expect(result).toHaveProperty("currentDailyBudget", 50000);
    expect(result).toHaveProperty("recommendedDailyBudget");
    expect(result.recommendedDailyBudget).toBeGreaterThan(0);
    expect(result.analysisBasedOn).toBe("3일간 데이터");
  });

  it("should throw when no data provided", () => {
    expect(() => calculateOptimalBudget([])).toThrow("과거 성과 데이터가 필요");
  });
});
