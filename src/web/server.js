require("dotenv").config();
const http = require("http");
const fs = require("fs");
const path = require("path");
const { generateKeywordSuggestions, createKeyword } = require("../keyword/keywordManager");
const {
  generateAdCopy,
  generateBulkAdCopies,
  generateAbTest,
} = require("../adcopy/adCopyGenerator");
const {
  detectSeason,
  calculateOptimalDiscount,
  generatePromotionPlan,
  getUpcomingEvents,
} = require("../promotion/promotionPlanner");
const adApi = require("../api/adApi");
const keywordApi = require("../api/keywordApi");
const statsApi = require("../api/statsApi");
const imageApi = require("../api/imageApi");
const { generateDailyReport } = require("../report/reportGenerator");

const PORT = 3000;

function parseBody(req) {
  return new Promise((resolve) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
    });
    req.on("end", () => {
      try {
        resolve(JSON.parse(body));
      } catch {
        resolve({});
      }
    });
  });
}

async function handleApi(pathname, req) {
  const method = req.method;

  if (pathname === "/api/campaigns" && method === "GET") {
    return await adApi.listCampaigns();
  }

  if (pathname === "/api/keywords/suggest" && method === "GET") {
    return generateKeywordSuggestions();
  }

  if (pathname === "/api/keywords/search" && method === "POST") {
    const { keywords } = await parseBody(req);
    return await keywordApi.getKeywordStats(keywords);
  }

  if (pathname === "/api/keywords/add" && method === "POST") {
    const { adGroupId, keyword, bid, matchType } = await parseBody(req);
    const kw = createKeyword({ keyword, bid, matchType });
    return await keywordApi.createKeywords(adGroupId, [kw]);
  }

  if (pathname === "/api/keywords/update-bid" && method === "POST") {
    const { keywordId, newBid } = await parseBody(req);
    return await keywordApi.updateKeywordBid(keywordId, newBid);
  }

  if (pathname === "/api/keywords/toggle" && method === "POST") {
    const { keywordId, status } = await parseBody(req);
    return await keywordApi.updateKeywordStatus(keywordId, status);
  }

  if (pathname === "/api/keywords/delete" && method === "POST") {
    const { keywordId } = await parseBody(req);
    return await keywordApi.deleteKeyword(keywordId);
  }

  if (pathname === "/api/adcopy/generate" && method === "POST") {
    const { service, variants } = await parseBody(req);
    return generateAdCopy(service || "요트투어", { variants: variants || 3 });
  }

  if (pathname === "/api/adcopy/bulk" && method === "GET") {
    return generateBulkAdCopies();
  }

  if (pathname === "/api/adcopy/abtest" && method === "POST") {
    const { service } = await parseBody(req);
    return generateAbTest(service || "요트투어");
  }

  if (pathname === "/api/report/daily" && method === "GET") {
    const campaigns = await adApi.listCampaigns();
    if (!Array.isArray(campaigns) || campaigns.length === 0) return { error: "캠페인 없음" };
    const { start, end } = statsApi.getDateRange("yesterday");
    const raw = await statsApi.getCampaignStats(campaigns[0].nccCampaignId, start, end);
    const data = statsApi.parseStatsResponse(raw);
    return generateDailyReport(start, data);
  }

  if (pathname === "/api/promotion/plan" && method === "POST") {
    const { searchVolumes, performanceData } = await parseBody(req);
    const season = detectSeason(searchVolumes);
    return generatePromotionPlan(season, performanceData);
  }

  if (pathname === "/api/promotion/events" && method === "GET") {
    return getUpcomingEvents(new Date(), 60);
  }

  if (pathname === "/api/promotion/discount" && method === "POST") {
    const metrics = await parseBody(req);
    return calculateOptimalDiscount(metrics);
  }

  if (pathname === "/api/images/list" && method === "GET") {
    const imagesDir = path.join(__dirname, "../../images");
    return imageApi.listImages(imagesDir);
  }

  if (pathname === "/api/images/upload" && method === "POST") {
    const imagesDir = path.join(__dirname, "../../images");
    return await imageApi.uploadAllImages(imagesDir);
  }

  return { error: "알 수 없는 API" };
}

const server = http.createServer(async (req, res) => {
  const pathname = req.url.split("?")[0];

  if (pathname.startsWith("/api/")) {
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    try {
      const result = await handleApi(pathname, req);
      res.end(JSON.stringify(result, null, 2));
    } catch (err) {
      res.statusCode = 500;
      res.end(JSON.stringify({ error: err.message }));
    }
    return;
  }

  if (pathname === "/" || pathname === "/index.html") {
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.end(fs.readFileSync(path.join(__dirname, "dashboard.html")));
    return;
  }

  res.statusCode = 404;
  res.end("Not Found");
});

server.listen(PORT, () => {
  process.stdout.write(`\n그랑블루요트 광고 대시보드가 시작되었습니다!\n`);
  process.stdout.write(`브라우저에서 열어주세요: http://localhost:${PORT}\n\n`);
});
