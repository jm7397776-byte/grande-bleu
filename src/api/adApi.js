const client = require("./naverClient");

function listCampaigns() {
  return client.get("/ncc/campaigns");
}

function listAdGroups(campaignId) {
  return client.get(`/ncc/adgroups?nccCampaignId=${campaignId}`);
}

function listAds(adGroupId) {
  return client.get(`/ncc/ads?nccAdgroupId=${adGroupId}`);
}

function createAd(adGroupId, adCopy) {
  const body = {
    nccAdgroupId: adGroupId,
    type: "TEXT_45",
    ad: {
      pc: {
        subject: adCopy.title,
        description: adCopy.description,
      },
      mobile: {
        subject: adCopy.title,
        description: adCopy.description,
      },
      displayUrl: adCopy.displayUrl || "",
    },
    inspectRequestMsg: "",
  };

  return client.post("/ncc/ads", body);
}

function updateAd(adId, adCopy) {
  return client.put(`/ncc/ads/${adId}`, {
    nccAdId: adId,
    ad: {
      pc: {
        subject: adCopy.title,
        description: adCopy.description,
      },
      mobile: {
        subject: adCopy.title,
        description: adCopy.description,
      },
    },
    inspectRequestMsg: "",
  });
}

function updateAdStatus(adId, status) {
  const validStatuses = ["PAUSED", "ENABLED"];
  if (!validStatuses.includes(status)) {
    throw new Error(`상태는 ${validStatuses.join(", ")} 중 하나여야 합니다.`);
  }

  return client.put(`/ncc/ads/${adId}`, {
    nccAdId: adId,
    userLock: status === "PAUSED",
  });
}

function deleteAd(adId) {
  return client.del(`/ncc/ads/${adId}`);
}

function updateDailyBudget(campaignId, budget) {
  return client.put(`/ncc/campaigns/${campaignId}`, {
    nccCampaignId: campaignId,
    dailyBudget: budget,
  });
}

module.exports = {
  listCampaigns,
  listAdGroups,
  listAds,
  createAd,
  updateAd,
  updateAdStatus,
  deleteAd,
  updateDailyBudget,
};
