const keywordApi = require("./keywordApi");
const adApi = require("./adApi");
const statsApi = require("./statsApi");
const { adjustBids, generateKeywordSuggestions } = require("../keyword/keywordManager");
const { generateAdCopy, generateAbTest } = require("../adcopy/adCopyGenerator");
const { generateDailyReport } = require("../report/reportGenerator");
const {
  detectSeason,
  generatePromotionPlan,
  detectPerformanceDrop,
} = require("../promotion/promotionPlanner");

async function runDailyAutomation(campaignId) {
  const results = { timestamp: new Date().toISOString(), actions: [] };

  const { start, end } = statsApi.getDateRange("yesterday");
  const rawStats = await statsApi.getCampaignStats(campaignId, start, end);
  const dailyData = statsApi.parseStatsResponse(rawStats);
  results.actions.push({ step: "성과 수집", status: "완료", data: dailyData });

  const report = generateDailyReport(start, dailyData);
  results.actions.push({ step: "일간 보고서 생성", status: "완료", grade: report.status.grade });

  const adGroups = await adApi.listAdGroups(campaignId);
  for (const group of adGroups) {
    const keywords = await keywordApi.listKeywords(group.nccAdgroupId);

    const perfData = {};
    for (const kw of keywords) {
      const kwStats = await statsApi.getKeywordStats(kw.nccKeywordId, start, end);
      const parsed = statsApi.parseStatsResponse(kwStats);
      perfData[kw.keyword] = {
        ctr: parsed.ctr,
        conversionRate: parsed.conversionRate,
        cpa: parsed.clicks > 0 && parsed.conversions > 0 ? parsed.cost / parsed.conversions : 0,
      };
    }

    const adjusted = adjustBids(
      keywords.map((kw) => ({ keyword: kw.keyword, bid: kw.bidAmt })),
      perfData,
    );

    for (const adj of adjusted) {
      if (adj.adjustment !== "유지") {
        const original = keywords.find((kw) => kw.keyword === adj.keyword);
        if (original) {
          await keywordApi.updateKeywordBid(original.nccKeywordId, adj.bid);
        }
      }
    }

    results.actions.push({
      step: `입찰가 조정 (${group.name || group.nccAdgroupId})`,
      status: "완료",
      adjustments: adjusted.filter((a) => a.adjustment !== "유지").length,
    });
  }

  return results;
}

async function runWeeklyAutomation(campaignId) {
  const results = { timestamp: new Date().toISOString(), actions: [] };

  const { start, end } = statsApi.getDateRange("week");
  await statsApi.getCampaignStats(campaignId, start, end);

  const suggestions = generateKeywordSuggestions();
  const searchStats = await keywordApi.getKeywordStats(suggestions.core.slice(0, 20));

  if (searchStats && searchStats.keywordList) {
    const highVolume = searchStats.keywordList.filter(
      (kw) => kw.monthlyPcQcCnt + kw.monthlyMobileQcCnt > 1000,
    );
    results.actions.push({
      step: "키워드 발굴",
      status: "완료",
      found: highVolume.length,
    });
  }

  const dailyMetrics = [];
  const now = new Date();
  for (let i = 7; i >= 1; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dateStr = statsApi.formatDateForApi(date);
    const dayStats = await statsApi.getCampaignStats(campaignId, dateStr, dateStr);
    const parsed = statsApi.parseStatsResponse(dayStats);
    dailyMetrics.push({
      ctr: parsed.ctr,
      conversionRate: parsed.conversionRate,
    });
  }

  const dropCheck = detectPerformanceDrop(dailyMetrics);
  if (dropCheck.detected) {
    results.actions.push({
      step: "성과 하락 감지",
      status: "경고",
      alerts: dropCheck.alerts,
    });
  }

  const adGroups = await adApi.listAdGroups(campaignId);
  for (const group of adGroups) {
    const ads = await adApi.listAds(group.nccAdgroupId);

    if (ads.length > 0) {
      const adPerformances = [];
      for (const ad of ads) {
        const adStats = await statsApi.getAdGroupStats(ad.nccAdId, start, end);
        const parsed = statsApi.parseStatsResponse(adStats);
        adPerformances.push({ ad, stats: parsed });
      }

      adPerformances.sort((a, b) => b.stats.ctr - a.stats.ctr);

      if (adPerformances.length >= 2) {
        const worst = adPerformances[adPerformances.length - 1];
        if (worst.stats.ctr < adPerformances[0].stats.ctr * 0.5) {
          await adApi.deleteAd(worst.ad.nccAdId);

          const serviceName = group.name || "요트투어";
          const newCopy = generateAdCopy(serviceName);
          await adApi.createAd(group.nccAdgroupId, newCopy);

          results.actions.push({
            step: `소재 교체 (${group.name || group.nccAdgroupId})`,
            status: "완료",
            removed: worst.ad.nccAdId,
            newTitle: newCopy.title,
          });
        }
      }
    }
  }

  return results;
}

async function runMonthlyAutomation(campaignId, monthlySearchVolumes) {
  const results = { timestamp: new Date().toISOString(), actions: [] };

  const { start, end } = statsApi.getDateRange("month");
  const rawStats = await statsApi.getCampaignStats(campaignId, start, end);
  const monthlyData = statsApi.parseStatsResponse(rawStats);

  const seasonData = detectSeason(monthlySearchVolumes);
  results.actions.push({ step: "시즌 분석", status: seasonData.season });

  const promotionPlan = generatePromotionPlan(seasonData, monthlyData);
  results.actions.push({
    step: "프로모션 기획",
    status: "완료",
    plans: promotionPlan.plans.length,
    summary: promotionPlan.summary,
  });

  const adGroups = await adApi.listAdGroups(campaignId);
  for (const group of adGroups) {
    const serviceName = group.name || "요트투어";
    const abTest = generateAbTest(serviceName);
    await adApi.createAd(group.nccAdgroupId, abTest.control);
    await adApi.createAd(group.nccAdgroupId, abTest.test);

    results.actions.push({
      step: `A/B 테스트 시작 (${serviceName})`,
      status: "완료",
      variantA: abTest.control.title,
      variantB: abTest.test.title,
    });
  }

  return results;
}

module.exports = {
  runDailyAutomation,
  runWeeklyAutomation,
  runMonthlyAutomation,
};
