const { adSettings, performanceTargets } = require("../data/config");

function analyzeDailyPerformance(dailyData) {
  if (!dailyData || dailyData.impressions === undefined) {
    throw new Error("일별 데이터가 필요합니다.");
  }

  const { impressions, clicks, conversions, cost, revenue } = dailyData;

  const ctr = impressions > 0 ? (clicks / impressions) * 100 : 0;
  const conversionRate = clicks > 0 ? (conversions / clicks) * 100 : 0;
  const cpc = clicks > 0 ? cost / clicks : 0;
  const cpa = conversions > 0 ? cost / conversions : 0;
  const roas = cost > 0 ? (revenue / cost) * 100 : 0;
  const remainingBudget = adSettings.dailyBudget - cost;

  return {
    metrics: {
      impressions,
      clicks,
      conversions,
      cost,
      revenue,
      ctr: round(ctr),
      conversionRate: round(conversionRate),
      cpc: Math.round(cpc),
      cpa: Math.round(cpa),
      roas: round(roas),
    },
    budget: {
      daily: adSettings.dailyBudget,
      spent: cost,
      remaining: remainingBudget,
      utilizationRate: round((cost / adSettings.dailyBudget) * 100),
    },
    status: evaluatePerformance(ctr, conversionRate, cpa, roas),
  };
}

function evaluatePerformance(ctr, conversionRate, cpa, roas) {
  const issues = [];
  const strengths = [];

  if (ctr < performanceTargets.ctr) {
    issues.push(`CTR ${round(ctr)}%로 목표(${performanceTargets.ctr}%) 미달 → 광고문 개선 필요`);
  } else {
    strengths.push(`CTR ${round(ctr)}%로 목표 달성`);
  }

  if (conversionRate < performanceTargets.conversionRate) {
    issues.push(
      `전환율 ${round(conversionRate)}%로 목표(${performanceTargets.conversionRate}%) 미달 → 랜딩페이지 개선 필요`,
    );
  } else {
    strengths.push(`전환율 ${round(conversionRate)}%로 목표 달성`);
  }

  if (cpa > performanceTargets.cpa) {
    issues.push(
      `CPA ${Math.round(cpa)}원으로 목표(${performanceTargets.cpa}원) 초과 → 입찰가 조정 필요`,
    );
  } else {
    strengths.push(`CPA ${Math.round(cpa)}원으로 목표 이내`);
  }

  if (roas < performanceTargets.roas) {
    issues.push(`ROAS ${round(roas)}%로 목표(${performanceTargets.roas}%) 미달`);
  } else {
    strengths.push(`ROAS ${round(roas)}%로 목표 달성`);
  }

  const overallScore = strengths.length;
  let grade;
  if (overallScore === 4) {
    grade = "A";
  } else if (overallScore >= 3) {
    grade = "B";
  } else if (overallScore >= 2) {
    grade = "C";
  } else {
    grade = "D";
  }

  return { grade, strengths, issues };
}

function calculateOptimalBudget(historicalData) {
  if (!historicalData || historicalData.length === 0) {
    throw new Error("과거 성과 데이터가 필요합니다.");
  }

  const totalClicks = historicalData.reduce((sum, d) => sum + d.clicks, 0);
  const totalCost = historicalData.reduce((sum, d) => sum + d.cost, 0);
  const totalConversions = historicalData.reduce((sum, d) => sum + d.conversions, 0);
  const totalRevenue = historicalData.reduce((sum, d) => sum + d.revenue, 0);
  const days = historicalData.length;

  const avgCpc = totalClicks > 0 ? totalCost / totalClicks : 0;
  const avgConvRate = totalClicks > 0 ? totalConversions / totalClicks : 0;
  const avgRevenuePerConv = totalConversions > 0 ? totalRevenue / totalConversions : 0;

  const targetDailyConversions = performanceTargets.cpa > 0
    ? adSettings.dailyBudget / performanceTargets.cpa
    : 0;

  const optimalDailyBudget = avgConvRate > 0
    ? Math.round((targetDailyConversions / avgConvRate) * avgCpc)
    : adSettings.dailyBudget;

  return {
    currentDailyBudget: adSettings.dailyBudget,
    recommendedDailyBudget: optimalDailyBudget,
    avgCpc: Math.round(avgCpc),
    avgConversionRate: round(avgConvRate * 100),
    avgRevenuePerConversion: Math.round(avgRevenuePerConv),
    projectedDailyConversions: round(targetDailyConversions),
    analysisBasedOn: `${days}일간 데이터`,
  };
}

function round(value) {
  return Math.round(value * 100) / 100;
}

module.exports = {
  analyzeDailyPerformance,
  evaluatePerformance,
  calculateOptimalBudget,
  round,
};
