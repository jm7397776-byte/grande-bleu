const { business, adSettings } = require("../data/config");

function createKeyword({ keyword, matchType = "exact", bid, groupName }) {
  if (!keyword) {
    throw new Error("키워드는 필수입니다.");
  }

  const validMatchTypes = ["exact", "phrase", "broad"];
  if (!validMatchTypes.includes(matchType)) {
    throw new Error(`매치타입은 ${validMatchTypes.join(", ")} 중 하나여야 합니다.`);
  }

  const finalBid = bid || adSettings.minCpc;
  if (finalBid < adSettings.minCpc) {
    throw new Error(`최소 입찰가는 ${adSettings.minCpc}원입니다.`);
  }
  if (finalBid > adSettings.maxCpc) {
    throw new Error(`최대 입찰가는 ${adSettings.maxCpc}원입니다.`);
  }

  return {
    keyword,
    matchType,
    bid: finalBid,
    groupName: groupName || "기본그룹",
    status: "active",
    qualityScore: null,
    createdAt: new Date().toISOString(),
  };
}

function generateKeywordSuggestions() {
  const baseKeywords = [];

  for (const service of business.services) {
    baseKeywords.push(service);

    for (const area of business.targetAreas) {
      baseKeywords.push(`${area} ${service}`);
      baseKeywords.push(`${area}${service}`);
    }
  }

  const modifiers = ["가격", "추천", "예약", "후기", "할인", "이벤트", "비용"];
  const extendedKeywords = [];

  for (const service of business.services) {
    for (const modifier of modifiers) {
      extendedKeywords.push(`${service} ${modifier}`);
    }

    for (const area of business.targetAreas) {
      for (const modifier of modifiers.slice(0, 3)) {
        extendedKeywords.push(`${area} ${service} ${modifier}`);
      }
    }
  }

  return {
    core: baseKeywords,
    extended: extendedKeywords,
    total: baseKeywords.length + extendedKeywords.length,
    generatedAt: new Date().toISOString(),
  };
}

function calculateBidRecommendation(keyword, competitionLevel = "medium") {
  const levels = {
    low: { multiplier: 0.3, range: [adSettings.minCpc, adSettings.maxCpc * 0.3] },
    medium: { multiplier: 0.6, range: [adSettings.maxCpc * 0.3, adSettings.maxCpc * 0.7] },
    high: { multiplier: 1.0, range: [adSettings.maxCpc * 0.7, adSettings.maxCpc] },
  };

  const level = levels[competitionLevel];
  if (!level) {
    throw new Error("경쟁도는 low, medium, high 중 하나여야 합니다.");
  }

  const recommendedBid = Math.round(adSettings.maxCpc * level.multiplier);

  return {
    keyword,
    competitionLevel,
    recommendedBid: Math.max(adSettings.minCpc, recommendedBid),
    bidRange: {
      min: Math.round(level.range[0]),
      max: Math.round(level.range[1]),
    },
  };
}

function adjustBids(keywords, performanceData) {
  return keywords.map((kw) => {
    const perf = performanceData[kw.keyword];
    if (!perf) {
      return { ...kw, adjustment: "유지", reason: "성과 데이터 없음" };
    }

    const { ctr, conversionRate, cpa } = perf;

    if (ctr > 5 && conversionRate > 3) {
      const newBid = Math.min(Math.round(kw.bid * 1.2), adSettings.maxCpc);
      return { ...kw, bid: newBid, adjustment: "인상", reason: "고성과 키워드" };
    }

    if (ctr < 1 || cpa > adSettings.maxCpc * 10) {
      const newBid = Math.max(Math.round(kw.bid * 0.7), adSettings.minCpc);
      return { ...kw, bid: newBid, adjustment: "인하", reason: "저성과 키워드" };
    }

    return { ...kw, adjustment: "유지", reason: "적정 성과" };
  });
}

module.exports = {
  createKeyword,
  generateKeywordSuggestions,
  calculateBidRecommendation,
  adjustBids,
};
