#!/bin/bash
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

echo "============================================"
echo "  그랑블루요트 광고 자동화 실행"
echo "  $(date '+%Y-%m-%d %H:%M')"
echo "============================================"
echo ""
echo "무엇을 실행할까요?"
echo ""
echo "  1) 캠페인 목록 조회"
echo "  2) 일간 보고서 생성"
echo "  3) 키워드 추천 받기"
echo "  4) 광고 카피 자동 생성"
echo "  5) 전체 자동화 (일간)"
echo "  6) 종료"
echo ""
read -p "번호를 선택하세요: " choice

case $choice in
  1)
    echo ""
    echo "캠페인 목록을 조회합니다..."
    node -e "
    const adApi = require('./src/api/adApi');
    adApi.listCampaigns()
      .then(data => {
        console.log('');
        if (Array.isArray(data) && data.length > 0) {
          console.log('총', data.length, '개 캠페인:');
          data.forEach(c => {
            console.log('  캠페인:', c.name || c.nccCampaignId);
            console.log('  상태:', c.status);
            console.log('  일예산:', (c.dailyBudget || 0).toLocaleString(), '원');
            console.log('  ---');
          });
        } else {
          console.log('캠페인이 없거나 응답:', JSON.stringify(data, null, 2));
        }
      })
      .catch(e => console.log('오류:', e.message));
    "
    ;;
  2)
    echo ""
    echo "어제 성과를 조회하고 보고서를 생성합니다..."
    node -e "
    const adApi = require('./src/api/adApi');
    const statsApi = require('./src/api/statsApi');
    const { generateDailyReport } = require('./src/report/reportGenerator');

    async function run() {
      const campaigns = await adApi.listCampaigns();
      if (!Array.isArray(campaigns) || campaigns.length === 0) {
        console.log('캠페인이 없습니다.');
        return;
      }
      const { start, end } = statsApi.getDateRange('yesterday');
      for (const camp of campaigns) {
        const raw = await statsApi.getCampaignStats(camp.nccCampaignId, start, end);
        const data = statsApi.parseStatsResponse(raw);
        const report = generateDailyReport(start, data);
        console.log(report.summary);
      }
    }
    run().catch(e => console.log('오류:', e.message));
    "
    ;;
  3)
    echo ""
    echo "키워드를 추천합니다..."
    node -e "
    const { generateKeywordSuggestions } = require('./src/keyword/keywordManager');
    const suggestions = generateKeywordSuggestions();
    console.log('핵심 키워드 (' + suggestions.core.length + '개):');
    suggestions.core.slice(0, 20).forEach(k => console.log('  •', k));
    console.log('');
    console.log('확장 키워드 (' + suggestions.extended.length + '개):');
    suggestions.extended.slice(0, 20).forEach(k => console.log('  •', k));
    console.log('');
    console.log('총', suggestions.total, '개 키워드 생성됨');
    "
    ;;
  4)
    echo ""
    echo "광고 카피를 자동 생성합니다..."
    node -e "
    const { generateBulkAdCopies } = require('./src/adcopy/adCopyGenerator');
    const bulk = generateBulkAdCopies();
    for (const [service, copies] of Object.entries(bulk)) {
      console.log('');
      console.log('【' + service + '】');
      copies.forEach((c, i) => {
        console.log('  변형 ' + (i+1) + ':');
        console.log('    타이틀: ' + c.title);
        console.log('    설명: ' + c.description);
      });
    }
    "
    ;;
  5)
    echo ""
    read -p "캠페인 ID를 입력하세요: " campaign_id
    echo "일간 자동화를 실행합니다..."
    node -e "
    const { runDailyAutomation } = require('./src/api/automationEngine');
    runDailyAutomation('$campaign_id')
      .then(result => {
        console.log('');
        console.log('자동화 완료!');
        result.actions.forEach(a => {
          console.log('  [' + a.status + '] ' + a.step);
        });
      })
      .catch(e => console.log('오류:', e.message));
    "
    ;;
  6)
    echo "종료합니다."
    exit 0
    ;;
  *)
    echo "잘못된 번호입니다."
    ;;
esac
