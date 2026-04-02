const client = require("./naverClient");

function getKeywordStats(keywords) {
  const params = new URLSearchParams();
  params.append("siteId", "");
  params.append("biztpId", "0");
  params.append("hintKeywords", keywords.join(","));
  params.append("event", "0");
  params.append("month", "0");
  params.append("showDetail", "1");

  return client.get(`/keywordstool?${params.toString()}`);
}

function listKeywords(adGroupId) {
  return client.get(`/ncc/keywords?nccAdgroupId=${adGroupId}`);
}

function createKeywords(adGroupId, keywords) {
  const body = keywords.map((kw) => ({
    nccAdgroupId: adGroupId,
    keyword: kw.keyword,
    bidAmt: kw.bid,
    useGroupBidAmt: !kw.bid,
  }));

  return client.post("/ncc/keywords", body);
}

function updateKeywordBid(keywordId, newBid) {
  return client.put(`/ncc/keywords/${keywordId}`, {
    nccKeywordId: keywordId,
    bidAmt: newBid,
  });
}

function updateKeywordStatus(keywordId, status) {
  const validStatuses = ["PAUSED", "ENABLED"];
  if (!validStatuses.includes(status)) {
    throw new Error(`상태는 ${validStatuses.join(", ")} 중 하나여야 합니다.`);
  }

  return client.put(`/ncc/keywords/${keywordId}`, {
    nccKeywordId: keywordId,
    userLock: status === "PAUSED",
  });
}

function deleteKeyword(keywordId) {
  return client.del(`/ncc/keywords/${keywordId}`);
}

module.exports = {
  getKeywordStats,
  listKeywords,
  createKeywords,
  updateKeywordBid,
  updateKeywordStatus,
  deleteKeyword,
};
