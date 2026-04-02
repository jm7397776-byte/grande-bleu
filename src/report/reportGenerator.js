const { analyzeDailyPerformance } = require("../budget/budgetAnalyzer");
const { business, adSettings } = require("../data/config");

function generateDailyReport(date, dailyData) {
  if (!date) {
    throw new Error("날짜는 필수입니다.");
  }

  const analysis = analyzeDailyPerformance(dailyData);

  const report = {
    type: "daily",
    date,
    business: business.name,
    channel: adSettings.businessChannel,
    ...analysis,
    summary: buildDailySummary(date, analysis),
    generatedAt: new Date().toISOString(),
  };

  return report;
}

function generateWeeklyReport(startDate, endDate, dailyDataList) {
  if (!dailyDataList || dailyDataList.length === 0) {
    throw new Error("주간 데이터가 필요합니다.");
  }

  const totals = dailyDataList.reduce(
    (acc, d) => ({
      impressions: acc.impressions + d.impressions,
      clicks: acc.clicks + d.clicks,
      conversions: acc.conversions + d.conversions,
      cost: acc.cost + d.cost,
      revenue: acc.revenue + d.revenue,
    }),
    { impressions: 0, clicks: 0, conversions: 0, cost: 0, revenue: 0 },
  );

  const analysis = analyzeDailyPerformance(totals);

  const dailyBreakdown = dailyDataList.map((d, i) => ({
    day: i + 1,
    ...analyzeDailyPerformance(d).metrics,
  }));

  const bestDay = dailyBreakdown.reduce((best, day) =>
    day.roas > best.roas ? day : best,
  );
  const worstDay = dailyBreakdown.reduce((worst, day) =>
    day.roas < worst.roas ? day : worst,
  );

  return {
    type: "weekly",
    period: { start: startDate, end: endDate },
    business: business.name,
    channel: adSettings.businessChannel,
    totalMetrics: analysis.metrics,
    status: analysis.status,
    dailyBreakdown,
    insights: {
      bestDay: { day: bestDay.day, roas: bestDay.roas },
      worstDay: { day: worstDay.day, roas: worstDay.roas },
      avgDailyCost: Math.round(totals.cost / dailyDataList.length),
      totalDays: dailyDataList.length,
    },
    summary: buildWeeklySummary(startDate, endDate, analysis, bestDay, worstDay),
    generatedAt: new Date().toISOString(),
  };
}

function generateMonthlyReport(month, weeklyDataList) {
  if (!weeklyDataList || weeklyDataList.length === 0) {
    throw new Error("월간 데이터가 필요합니다.");
  }

  const totals = weeklyDataList.reduce(
    (acc, d) => ({
      impressions: acc.impressions + d.impressions,
      clicks: acc.clicks + d.clicks,
      conversions: acc.conversions + d.conversions,
      cost: acc.cost + d.cost,
      revenue: acc.revenue + d.revenue,
    }),
    { impressions: 0, clicks: 0, conversions: 0, cost: 0, revenue: 0 },
  );

  const analysis = analyzeDailyPerformance(totals);

  return {
    type: "monthly",
    month,
    business: business.name,
    channel: adSettings.businessChannel,
    totalMetrics: analysis.metrics,
    status: analysis.status,
    weeklyBreakdown: weeklyDataList.map((d, i) => ({
      week: i + 1,
      ...analyzeDailyPerformance(d).metrics,
    })),
    summary: buildMonthlySummary(month, analysis),
    generatedAt: new Date().toISOString(),
  };
}

function buildDailySummary(date, analysis) {
  const { metrics, budget, status } = analysis;
  const lines = [
    `═══════════════════════════════════════`,
    `  ${business.name} 일일 광고 성과 보고서`,
    `  ${date} | ${adSettings.businessChannel}`,
    `═══════════════════════════════════════`,
    ``,
    `▶ 핵심 지표`,
    `  노출수: ${metrics.impressions.toLocaleString()}회`,
    `  클릭수: ${metrics.clicks.toLocaleString()}회 (CTR ${metrics.ctr}%)`,
    `  전환수: ${metrics.conversions}건 (전환율 ${metrics.conversionRate}%)`,
    `  비용: ${metrics.cost.toLocaleString()}원 (CPC ${metrics.cpc.toLocaleString()}원)`,
    `  매출: ${metrics.revenue.toLocaleString()}원 (ROAS ${metrics.roas}%)`,
    ``,
    `▶ 예산`,
    `  일예산: ${budget.daily.toLocaleString()}원`,
    `  소진: ${budget.spent.toLocaleString()}원 (${budget.utilizationRate}%)`,
    `  잔여: ${budget.remaining.toLocaleString()}원`,
    ``,
    `▶ 평가: ${status.grade}등급`,
  ];

  if (status.strengths.length > 0) {
    lines.push(`  [강점]`);
    for (const s of status.strengths) {
      lines.push(`    ✅ ${s}`);
    }
  }
  if (status.issues.length > 0) {
    lines.push(`  [개선필요]`);
    for (const issue of status.issues) {
      lines.push(`    ⚠️ ${issue}`);
    }
  }

  lines.push(``, `───────────────────────────────────────`);
  return lines.join("\n");
}

function buildWeeklySummary(startDate, endDate, analysis, bestDay, worstDay) {
  const { metrics, status } = analysis;
  const lines = [
    `═══════════════════════════════════════`,
    `  ${business.name} 주간 광고 성과 보고서`,
    `  ${startDate} ~ ${endDate}`,
    `═══════════════════════════════════════`,
    ``,
    `▶ 주간 합계`,
    `  노출: ${metrics.impressions.toLocaleString()} | 클릭: ${metrics.clicks.toLocaleString()} | 전환: ${metrics.conversions}`,
    `  비용: ${metrics.cost.toLocaleString()}원 | 매출: ${metrics.revenue.toLocaleString()}원`,
    `  CTR: ${metrics.ctr}% | 전환율: ${metrics.conversionRate}% | ROAS: ${metrics.roas}%`,
    ``,
    `▶ 인사이트`,
    `  최고 성과일: ${bestDay.day}일차 (ROAS ${bestDay.roas}%)`,
    `  최저 성과일: ${worstDay.day}일차 (ROAS ${worstDay.roas}%)`,
    ``,
    `▶ 평가: ${status.grade}등급`,
    `───────────────────────────────────────`,
  ];
  return lines.join("\n");
}

function buildMonthlySummary(month, analysis) {
  const { metrics, status } = analysis;
  const lines = [
    `═══════════════════════════════════════`,
    `  ${business.name} ${month} 월간 보고서`,
    `═══════════════════════════════════════`,
    ``,
    `  총 노출: ${metrics.impressions.toLocaleString()}`,
    `  총 클릭: ${metrics.clicks.toLocaleString()} (CTR ${metrics.ctr}%)`,
    `  총 전환: ${metrics.conversions} (전환율 ${metrics.conversionRate}%)`,
    `  총 비용: ${metrics.cost.toLocaleString()}원`,
    `  총 매출: ${metrics.revenue.toLocaleString()}원 (ROAS ${metrics.roas}%)`,
    ``,
    `  종합 평가: ${status.grade}등급`,
    `───────────────────────────────────────`,
  ];
  return lines.join("\n");
}

module.exports = {
  generateDailyReport,
  generateWeeklyReport,
  generateMonthlyReport,
};
