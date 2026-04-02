const {
  detectSeason,
  calculateOptimalDiscount,
  getUpcomingEvents,
  generatePromotionPlan,
  detectPerformanceDrop,
  translateSeason,
} = require("../promotion/promotionPlanner");

describe("detectSeason", () => {
  it("should detect peak season", () => {
    const data = [
      { month: "2026-01", volume: 5000 },
      { month: "2026-02", volume: 5500 },
      { month: "2026-03", volume: 8000 },
    ];
    const result = detectSeason(data);
    expect(result.season).toBe("peak");
    expect(result.changeRate).toBeGreaterThan(30);
  });

  it("should detect rising season", () => {
    const data = [
      { month: "2026-01", volume: 5000 },
      { month: "2026-02", volume: 5000 },
      { month: "2026-03", volume: 5800 },
    ];
    const result = detectSeason(data);
    expect(result.season).toBe("rising");
  });

  it("should detect off season", () => {
    const data = [
      { month: "2026-06", volume: 10000 },
      { month: "2026-07", volume: 9000 },
      { month: "2026-08", volume: 6000 },
    ];
    const result = detectSeason(data);
    expect(result.season).toBe("off");
  });

  it("should detect stable season", () => {
    const data = [
      { month: "2026-01", volume: 5000 },
      { month: "2026-02", volume: 5000 },
      { month: "2026-03", volume: 5100 },
    ];
    const result = detectSeason(data);
    expect(result.season).toBe("stable");
  });

  it("should throw when insufficient data", () => {
    expect(() => detectSeason([{ month: "2026-01", volume: 5000 }])).toThrow(
      "최소 2개월",
    );
  });
});

describe("calculateOptimalDiscount", () => {
  it("should calculate discount options when ROAS is high", () => {
    const metrics = { revenue: 500000, cost: 100000, conversions: 20 };
    const result = calculateOptimalDiscount(metrics);
    expect(result.currentRoas).toBe(500);
    expect(result.maxDiscountRate).toBeGreaterThan(0);
    expect(result.discountOptions.length).toBeGreaterThan(0);
  });

  it("should return 0 discount when ROAS is at target", () => {
    const metrics = { revenue: 300000, cost: 100000, conversions: 10 };
    const result = calculateOptimalDiscount(metrics);
    expect(result.maxDiscountRate).toBe(0);
    expect(result.recommendedDiscount).toBe(0);
  });

  it("should mark viable/not viable options", () => {
    const metrics = { revenue: 600000, cost: 100000, conversions: 20 };
    const result = calculateOptimalDiscount(metrics);
    expect(result.discountOptions.length).toBeGreaterThan(0);
    expect(result.discountOptions.every((o) => typeof o.viable === "boolean")).toBe(true);
    expect(result.discountOptions.every((o) => o.projectedRoas > 0)).toBe(true);
  });

  it("should throw when data is missing", () => {
    expect(() => calculateOptimalDiscount(null)).toThrow("성과 데이터");
  });
});

describe("getUpcomingEvents", () => {
  it("should find events within range", () => {
    const date = new Date("2026-02-10");
    const events = getUpcomingEvents(date, 7);
    const valentines = events.find((e) => e.name === "발렌타인데이");
    expect(valentines).toBeDefined();
    expect(valentines.daysUntil).toBe(4);
  });

  it("should return empty when no events nearby", () => {
    const date = new Date("2026-04-10");
    const events = getUpcomingEvents(date, 5);
    expect(events).toHaveLength(0);
  });

  it("should include prep start recommendation", () => {
    const date = new Date("2026-05-01");
    const events = getUpcomingEvents(date, 10);
    const childrenDay = events.find((e) => e.name === "어린이날");
    expect(childrenDay).toBeDefined();
    expect(childrenDay.prepStartRecommended).toBeDefined();
  });
});

describe("generatePromotionPlan", () => {
  const peakSeason = {
    season: "peak",
    changeRate: 45,
    vsAverage: 30,
    currentVolume: 12000,
  };

  const offSeason = {
    season: "off",
    changeRate: -35,
    vsAverage: -25,
    currentVolume: 3000,
  };

  const stableSeason = {
    season: "stable",
    changeRate: 2,
    vsAverage: 0,
    currentVolume: 6000,
  };

  const performanceData = {
    revenue: 500000,
    cost: 100000,
    conversions: 20,
  };

  it("should generate peak season plan", () => {
    const plan = generatePromotionPlan(peakSeason, performanceData, new Date("2026-04-01"));
    expect(plan.seasonStatus).toBe("peak");
    expect(plan.plans.length).toBeGreaterThan(0);
    expect(plan.plans[0].type).toBe("성수기 대응");
    expect(plan.summary).toContain("프로모션 기획 보고서");
  });

  it("should generate off season plan with discount", () => {
    const plan = generatePromotionPlan(offSeason, performanceData, new Date("2026-11-01"));
    const offPlan = plan.plans.find((p) => p.type === "비수기 대응");
    expect(offPlan).toBeDefined();
    expect(offPlan.suggestedDiscount).toBeGreaterThan(0);
  });

  it("should generate stable season plan", () => {
    const plan = generatePromotionPlan(stableSeason, performanceData, new Date("2026-04-01"));
    const stablePlan = plan.plans.find((p) => p.type === "안정기 운영");
    expect(stablePlan).toBeDefined();
    expect(stablePlan.suggestedDiscount).toBe(0);
  });

  it("should include event plans when events are upcoming", () => {
    const plan = generatePromotionPlan(stableSeason, performanceData, new Date("2026-05-01"));
    const eventPlan = plan.plans.find((p) => p.type.includes("어린이날"));
    expect(eventPlan).toBeDefined();
  });

  it("should include summary text", () => {
    const plan = generatePromotionPlan(peakSeason, performanceData, new Date("2026-04-01"));
    expect(plan.summary).toContain("시즌 분석");
    expect(plan.summary).toContain("할인 여력");
    expect(plan.summary).toContain("그랑블루요트");
  });
});

describe("detectPerformanceDrop", () => {
  it("should detect CTR drop", () => {
    const metrics = [
      { ctr: 5, conversionRate: 3 },
      { ctr: 5, conversionRate: 3 },
      { ctr: 5, conversionRate: 3 },
      { ctr: 4, conversionRate: 3 },
      { ctr: 3, conversionRate: 3 },
      { ctr: 2, conversionRate: 3 },
    ];
    const result = detectPerformanceDrop(metrics);
    expect(result.detected).toBe(true);
    expect(result.ctrChange).toBeLessThan(0);
    expect(result.alerts.some((a) => a.includes("CTR"))).toBe(true);
  });

  it("should detect conversion drop", () => {
    const metrics = [
      { ctr: 5, conversionRate: 4 },
      { ctr: 5, conversionRate: 4 },
      { ctr: 5, conversionRate: 4 },
      { ctr: 5, conversionRate: 2 },
      { ctr: 5, conversionRate: 1.5 },
      { ctr: 5, conversionRate: 1 },
    ];
    const result = detectPerformanceDrop(metrics);
    expect(result.detected).toBe(true);
    expect(result.alerts.some((a) => a.includes("전환율"))).toBe(true);
  });

  it("should return no alerts for stable performance", () => {
    const metrics = [
      { ctr: 5, conversionRate: 3 },
      { ctr: 5, conversionRate: 3 },
      { ctr: 5, conversionRate: 3 },
      { ctr: 5, conversionRate: 3 },
      { ctr: 5, conversionRate: 3 },
      { ctr: 5, conversionRate: 3 },
    ];
    const result = detectPerformanceDrop(metrics);
    expect(result.detected).toBe(false);
  });

  it("should throw when insufficient data", () => {
    expect(() => detectPerformanceDrop([{ ctr: 5, conversionRate: 3 }])).toThrow(
      "최소 3일",
    );
  });
});

describe("translateSeason", () => {
  it("should translate all season types", () => {
    expect(translateSeason("peak")).toContain("성수기");
    expect(translateSeason("rising")).toContain("상승기");
    expect(translateSeason("stable")).toContain("안정기");
    expect(translateSeason("declining")).toContain("하락기");
    expect(translateSeason("off")).toContain("비수기");
  });
});
