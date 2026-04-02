const business = {
  name: "그랑블루요트",
  nameEn: "Grande Bleu Yacht",
  category: "요트투어",
  location: "제주",
  services: ["요트투어", "선셋크루즈", "요트파티", "요트대여", "낚시투어"],
  targetAreas: ["제주", "제주도", "서귀포", "제주시"],
  competitorKeywords: ["제주요트", "제주배낚시", "제주보트투어"],
  landingUrl: "https://grandebleu.kr",
};

const adSettings = {
  dailyBudget: 50000,
  maxCpc: 3000,
  minCpc: 200,
  defaultBidStrategy: "manual",
  targetRoas: 300,
  businessChannel: "네이버 파워링크",
};

const performanceTargets = {
  ctr: 3.0,
  conversionRate: 2.0,
  cpa: 15000,
  roas: 300,
};

module.exports = { business, adSettings, performanceTargets };
