const client = require("./naverClient");

function getCampaignStats(campaignId, startDate, endDate) {
  return client.get(
    `/stats?id=${campaignId}&fields=["clkCnt","impCnt","ctr","cpc","ccnt","crto","convAmt","viewCnt","salesAmt","revenueAmt"]&timeRange={"since":"${startDate}","until":"${endDate}"}`,
  );
}

function getAdGroupStats(adGroupId, startDate, endDate) {
  return client.get(
    `/stats?id=${adGroupId}&fields=["clkCnt","impCnt","ctr","cpc","ccnt","crto","convAmt","salesAmt"]&timeRange={"since":"${startDate}","until":"${endDate}"}`,
  );
}

function getKeywordStats(keywordId, startDate, endDate) {
  return client.get(
    `/stats?id=${keywordId}&fields=["clkCnt","impCnt","ctr","cpc","ccnt","crto","salesAmt"]&timeRange={"since":"${startDate}","until":"${endDate}"}`,
  );
}

function parseStatsResponse(apiResponse) {
  if (!apiResponse || !apiResponse.data || apiResponse.data.length === 0) {
    return {
      impressions: 0,
      clicks: 0,
      conversions: 0,
      cost: 0,
      revenue: 0,
    };
  }

  const data = apiResponse.data[0];
  return {
    impressions: data.impCnt || 0,
    clicks: data.clkCnt || 0,
    conversions: data.ccnt || 0,
    cost: data.salesAmt || 0,
    revenue: data.revenueAmt || data.convAmt || 0,
    ctr: data.ctr || 0,
    cpc: data.cpc || 0,
    conversionRate: data.crto || 0,
  };
}

function formatDateForApi(date) {
  const d = new Date(date);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function getDateRange(period = "today") {
  const now = new Date();
  let start;
  let end = formatDateForApi(now);

  if (period === "today") {
    start = end;
  } else if (period === "yesterday") {
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    start = formatDateForApi(yesterday);
    end = start;
  } else if (period === "week") {
    const weekAgo = new Date(now);
    weekAgo.setDate(weekAgo.getDate() - 7);
    start = formatDateForApi(weekAgo);
  } else if (period === "month") {
    const monthAgo = new Date(now);
    monthAgo.setMonth(monthAgo.getMonth() - 1);
    start = formatDateForApi(monthAgo);
  } else {
    start = end;
  }

  return { start, end };
}

module.exports = {
  getCampaignStats,
  getAdGroupStats,
  getKeywordStats,
  parseStatsResponse,
  formatDateForApi,
  getDateRange,
};
