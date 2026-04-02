const { business, performanceTargets } = require("../data/config");

const eventCalendar = [
  { name: "설날", period: [1, 2], type: "holiday" },
  { name: "발렌타인데이", period: [2, 14], type: "event" },
  { name: "화이트데이", period: [3, 14], type: "event" },
  { name: "벚꽃시즌", period: [3, 20], type: "season", durationDays: 30 },
  { name: "어린이날", period: [5, 5], type: "holiday" },
  { name: "어버이날", period: [5, 8], type: "event" },
  { name: "여름 성수기", period: [6, 15], type: "season", durationDays: 75 },
  { name: "추석", period: [9, 15], type: "holiday" },
  { name: "가을시즌", period: [9, 20], type: "season", durationDays: 45 },
  { name: "크리스마스", period: [12, 24], type: "event" },
  { name: "연말연시", period: [12, 28], type: "holiday", durationDays: 7 },
];

function detectSeason(monthlySearchVolumes) {
  if (!monthlySearchVolumes || monthlySearchVolumes.length < 2) {
    throw new Error("최소 2개월 이상의 검색량 데이터가 필요합니다.");
  }

  const current = monthlySearchVolumes[monthlySearchVolumes.length - 1];
  const previous = monthlySearchVolumes[monthlySearchVolumes.length - 2];
  const avg =
    monthlySearchVolumes.reduce((sum, v) => sum + v.volume, 0) /
    monthlySearchVolumes.length;

  const changeRate = previous.volume > 0
    ? ((current.volume - previous.volume) / previous.volume) * 100
    : 0;

  const vsAvg = avg > 0 ? ((current.volume - avg) / avg) * 100 : 0;

  let season;
  if (changeRate > 30 && vsAvg > 20) {
    season = "peak";
  } else if (changeRate > 10) {
    season = "rising";
  } else if (changeRate < -20 && vsAvg < -15) {
    season = "off";
  } else if (changeRate < -5) {
    season = "declining";
  } else {
    season = "stable";
  }

  return {
    currentMonth: current.month,
    currentVolume: current.volume,
    previousVolume: previous.volume,
    averageVolume: Math.round(avg),
    changeRate: round(changeRate),
    vsAverage: round(vsAvg),
    season,
  };
}

function calculateOptimalDiscount(currentMetrics, targetRoas = performanceTargets.roas) {
  if (!currentMetrics || !currentMetrics.revenue || !currentMetrics.cost) {
    throw new Error("현재 성과 데이터(revenue, cost)가 필요합니다.");
  }

  const { revenue, cost, conversions } = currentMetrics;
  const currentRoas = (revenue / cost) * 100;
  const revenuePerConversion = conversions > 0 ? revenue / conversions : 0;

  const maxDiscountRate =
    currentRoas > targetRoas
      ? round(((currentRoas - targetRoas) / currentRoas) * 100)
      : 0;

  const recommendedDiscount = round(maxDiscountRate * 0.7);

  const discountOptions = [];
  for (let rate = 5; rate <= Math.floor(maxDiscountRate); rate += 5) {
    const discountedRevenue = revenue * (1 - rate / 100);
    const projectedRoas = round((discountedRevenue / cost) * 100);
    const projectedRevenuePerConv = round(revenuePerConversion * (1 - rate / 100));

    discountOptions.push({
      discountRate: rate,
      projectedRoas,
      projectedRevenuePerConversion: projectedRevenuePerConv,
      viable: projectedRoas >= targetRoas,
    });
  }

  return {
    currentRoas: round(currentRoas),
    targetRoas,
    maxDiscountRate,
    recommendedDiscount,
    discountOptions,
    revenuePerConversion: Math.round(revenuePerConversion),
  };
}

function getUpcomingEvents(date = new Date(), lookAheadDays = 30) {
  const upcoming = [];
  const currentDate = new Date(date);

  for (let dayOffset = 0; dayOffset <= lookAheadDays; dayOffset++) {
    const checkDate = new Date(currentDate);
    checkDate.setDate(checkDate.getDate() + dayOffset);
    const month = checkDate.getMonth() + 1;
    const day = checkDate.getDate();

    for (const event of eventCalendar) {
      if (event.period[0] === month && event.period[1] === day) {
        upcoming.push({
          ...event,
          date: `${month}/${day}`,
          daysUntil: dayOffset,
          prepStartRecommended: Math.max(0, dayOffset - 7),
        });
      }
    }
  }

  return upcoming;
}

function generatePromotionPlan(seasonData, performanceData, date = new Date()) {
  const upcomingEvents = getUpcomingEvents(date);
  const discountAnalysis = calculateOptimalDiscount(performanceData);
  const plans = [];

  if (seasonData.season === "peak" || seasonData.season === "rising") {
    plans.push({
      type: "성수기 대응",
      priority: "high",
      strategy: seasonData.season === "peak" ? "수익 극대화" : "선점",
      actions: [
        `검색량 ${seasonData.changeRate > 0 ? "+" : ""}${seasonData.changeRate}% 변화 감지`,
        seasonData.season === "peak"
          ? "입찰가 상향 (경쟁 심화 대비)"
          : "얼리버드 프로모션으로 선점",
        seasonData.season === "peak"
          ? "프리미엄 카피 강조 (가격보다 품질)"
          : `얼리버드 ${Math.min(discountAnalysis.recommendedDiscount, 15)}% 할인 추천`,
      ],
      suggestedDiscount:
        seasonData.season === "peak"
          ? 0
          : Math.min(discountAnalysis.recommendedDiscount, 15),
      duration: seasonData.season === "peak" ? "성수기 종료까지" : "2주",
    });
  }

  if (seasonData.season === "off" || seasonData.season === "declining") {
    plans.push({
      type: "비수기 대응",
      priority: "high",
      strategy: "수요 창출",
      actions: [
        `검색량 ${seasonData.changeRate}% 하락 감지`,
        `${discountAnalysis.recommendedDiscount}% 할인 프로모션 추천`,
        "특가/한정 프로모션 카피 자동 생성",
        "타겟 키워드 확장 (연관 레저 키워드 추가)",
      ],
      suggestedDiscount: discountAnalysis.recommendedDiscount,
      duration: "비수기 종료까지",
    });
  }

  if (seasonData.season === "stable") {
    plans.push({
      type: "안정기 운영",
      priority: "medium",
      strategy: "효율 최적화",
      actions: [
        "현재 성과 유지",
        "카피 A/B 테스트 지속",
        "저성과 키워드 정리",
      ],
      suggestedDiscount: 0,
      duration: "지속",
    });
  }

  for (const event of upcomingEvents) {
    const eventDiscount = Math.min(discountAnalysis.recommendedDiscount, 20);
    plans.push({
      type: `이벤트: ${event.name}`,
      priority: event.daysUntil <= 7 ? "urgent" : "medium",
      strategy: "이벤트 마케팅",
      actions: [
        `${event.name} D-${event.daysUntil}`,
        event.daysUntil > 7
          ? "이벤트 카피 사전 준비"
          : "이벤트 카피 즉시 적용",
        `${event.name} 한정 ${eventDiscount}% 할인 카피 생성`,
        `"${event.name} 특별 ${business.services[0]}" 키워드 추가`,
      ],
      suggestedDiscount: eventDiscount,
      duration: event.durationDays ? `${event.durationDays}일` : "3일",
    });
  }

  return {
    analysisDate: date.toISOString().split("T")[0],
    seasonStatus: seasonData.season,
    searchTrend: `${seasonData.changeRate > 0 ? "+" : ""}${seasonData.changeRate}%`,
    discountCapacity: discountAnalysis.maxDiscountRate,
    plans,
    summary: buildPromotionSummary(plans, seasonData, discountAnalysis),
    generatedAt: new Date().toISOString(),
  };
}

function detectPerformanceDrop(dailyMetrics) {
  if (!dailyMetrics || dailyMetrics.length < 3) {
    throw new Error("최소 3일 이상의 성과 데이터가 필요합니다.");
  }

  const recent = dailyMetrics.slice(-3);
  const earlier = dailyMetrics.slice(0, -3);

  if (earlier.length === 0) {
    return { detected: false, reason: "비교 데이터 부족" };
  }

  const recentAvgCtr =
    recent.reduce((s, d) => s + d.ctr, 0) / recent.length;
  const earlierAvgCtr =
    earlier.reduce((s, d) => s + d.ctr, 0) / earlier.length;

  const recentAvgConv =
    recent.reduce((s, d) => s + d.conversionRate, 0) / recent.length;
  const earlierAvgConv =
    earlier.reduce((s, d) => s + d.conversionRate, 0) / earlier.length;

  const ctrDrop = earlierAvgCtr > 0
    ? round(((recentAvgCtr - earlierAvgCtr) / earlierAvgCtr) * 100)
    : 0;
  const convDrop = earlierAvgConv > 0
    ? round(((recentAvgConv - earlierAvgConv) / earlierAvgConv) * 100)
    : 0;

  const alerts = [];
  if (ctrDrop < -15) {
    alerts.push(`CTR ${ctrDrop}% 하락 → 광고 카피 교체 필요`);
  }
  if (convDrop < -20) {
    alerts.push(`전환율 ${convDrop}% 하락 → 랜딩페이지 또는 프로모션 점검 필요`);
  }

  return {
    detected: alerts.length > 0,
    ctrChange: ctrDrop,
    conversionChange: convDrop,
    alerts,
    recommendation: alerts.length > 0
      ? "긴급 프로모션 또는 카피 교체 권장"
      : "정상 범위",
  };
}

function buildPromotionSummary(plans, seasonData, discountAnalysis) {
  const lines = [
    `═══════════════════════════════════════`,
    `  ${business.name} 프로모션 기획 보고서`,
    `═══════════════════════════════════════`,
    ``,
    `▶ 시즌 분석`,
    `  현재: ${translateSeason(seasonData.season)}`,
    `  검색량 변화: ${seasonData.changeRate > 0 ? "+" : ""}${seasonData.changeRate}% (전월 대비)`,
    `  평균 대비: ${seasonData.vsAverage > 0 ? "+" : ""}${seasonData.vsAverage}%`,
    ``,
    `▶ 할인 여력`,
    `  현재 ROAS: ${discountAnalysis.currentRoas}%`,
    `  최대 할인 가능: ${discountAnalysis.maxDiscountRate}%`,
    `  권장 할인율: ${discountAnalysis.recommendedDiscount}%`,
    ``,
    `▶ 프로모션 플랜 (${plans.length}건)`,
  ];

  for (const plan of plans) {
    const priorityIcon =
      plan.priority === "urgent" ? "🔴" : plan.priority === "high" ? "🟡" : "🟢";
    lines.push(`  ${priorityIcon} [${plan.type}] ${plan.strategy}`);
    lines.push(`     기간: ${plan.duration} | 할인: ${plan.suggestedDiscount}%`);
    for (const action of plan.actions) {
      lines.push(`     - ${action}`);
    }
    lines.push(``);
  }

  lines.push(`───────────────────────────────────────`);
  return lines.join("\n");
}

function translateSeason(season) {
  const map = {
    peak: "성수기 (검색량 급증)",
    rising: "상승기 (검색량 증가 중)",
    stable: "안정기",
    declining: "하락기 (검색량 감소 중)",
    off: "비수기 (검색량 급감)",
  };
  return map[season] || season;
}

function round(value) {
  return Math.round(value * 100) / 100;
}

module.exports = {
  detectSeason,
  calculateOptimalDiscount,
  getUpcomingEvents,
  generatePromotionPlan,
  detectPerformanceDrop,
  eventCalendar,
  translateSeason,
};
